import type {Design, ZonePlacement} from '../customDesign'
import type {Template2D, ViewSide, Zone2D, ZoneKind} from './types'

type Point = [number, number]
export type Box = {x0: number; y0: number; x1: number; y1: number}

export const bounds = (polygon: Point[]): Box => ({
  x0: Math.min(...polygon.map(p => p[0])), y0: Math.min(...polygon.map(p => p[1])),
  x1: Math.max(...polygon.map(p => p[0])), y1: Math.max(...polygon.map(p => p[1])),
})

export function inPolygon([x, y]: Point, polygon: Point[]) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i], [xj, yj] = polygon[j]
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

/** The point itself when inside the polygon, else the closest point on its outline. */
export function nearestInPolygon(point: Point, polygon: Point[]): Point {
  if (inPolygon(point, polygon)) return point
  let best: Point = polygon[0], bestDistance = Infinity
  for (let i = 0; i < polygon.length; i++) {
    const [ax, ay] = polygon[i], [bx, by] = polygon[(i + 1) % polygon.length]
    const dx = bx - ax, dy = by - ay
    const t = Math.max(0, Math.min(1, ((point[0] - ax) * dx + (point[1] - ay) * dy) / (dx * dx + dy * dy || 1)))
    const candidate: Point = [ax + t * dx, ay + t * dy]
    const distance = Math.hypot(candidate[0] - point[0], candidate[1] - point[1])
    if (distance < bestDistance) { best = candidate; bestDistance = distance }
  }
  return best
}

export const otherSide = (side: ViewSide): ViewSide => side === 'front' ? 'back' : 'front'
export const zonesOn = (template: Template2D, side: ViewSide) => (side === 'back' ? template.views.back?.zones : template.views.front.zones) ?? []
export const findZone = (template: Template2D, side: ViewSide, id: string) => zonesOn(template, side).find(zone => zone.id === id)
/** Zones that accept a kind of artwork, front first. */
export const acceptingZones = (template: Template2D, kind: ZoneKind) =>
  (['front', 'back'] as const).flatMap(side => zonesOn(template, side).filter(zone => zone.accepts.includes(kind)).map(zone => ({side, zone})))

const round = (n: number) => Math.round(n * 1000) / 1000
const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n))
export const DEFAULT_SCALE: Record<ZoneKind, number> = {text: 0.72, logo: 0.6}

/**
 * Where a kind of artwork sits on a templated product: the saved zone placement; otherwise the design's
 * shared placement when it lands in an accepting zone (so 2D starts where 3D shows it); otherwise the
 * template's default zone. Returns null when no zone accepts the kind.
 */
export function resolvePlacement(template: Template2D, design: Design, kind: ZoneKind): ZonePlacement | null {
  const saved = design.placements2d?.[template.id]?.[kind]
  if (saved && findZone(template, saved.side, saved.zone)?.accepts.includes(kind)) return saved
  const candidates = acceptingZones(template, kind)
  const shared = kind === 'text' ? design.textPlacement : design.logoPlacement
  const point: Point = [shared.x / 100, shared.y / 100]
  const hit = candidates.find(c => c.side === shared.side && inPolygon(point, c.zone.polygon))
  if (hit) {
    const b = bounds(hit.zone.polygon)
    return {side: hit.side, zone: hit.zone.id, u: round(clamp((point[0] - b.x0) / (b.x1 - b.x0))), v: round(clamp((point[1] - b.y0) / (b.y1 - b.y0))),
      scale: kind === 'logo' ? round(clamp(shared.size / 100 / hit.zone.maxWidth, 0.2, 1)) : DEFAULT_SCALE.text, rotation: shared.rotation}
  }
  const fallback = candidates.find(c => c.zone.defaults?.includes(kind)) ?? candidates[0]
  return fallback ? {side: fallback.side, zone: fallback.zone.id, u: 0.5, v: 0.5, scale: DEFAULT_SCALE[kind], rotation: 0} : null
}

/** A printed copy of the artwork: the placement itself, plus its counterpart when shown on both sides. */
export type Instance = {side: ViewSide; zone: Zone2D; u: number; v: number; scale: number; rotation: number; copy: boolean}
export function instancesOf(template: Template2D, placement: ZonePlacement, mirror: boolean): Instance[] {
  const zone = findZone(template, placement.side, placement.zone)
  if (!zone) return []
  const out: Instance[] = [{...placement, zone, copy: false}]
  const twin = mirror && zone.counterpart ? findZone(template, otherSide(placement.side), zone.counterpart) : undefined
  // The copy mirrors across the body: the same spot seen from the other side.
  if (twin) out.push({side: otherSide(placement.side), zone: twin, u: 1 - placement.u, v: placement.v, scale: placement.scale, rotation: -placement.rotation, copy: true})
  return out
}

/** What is printed: text (width per unit of font size) or a logo (height / width). */
export type ArtContent = {kind: 'text'; ratio: number} | {kind: 'logo'; ratio: number}
/** Printed size: w/ex are fractions of the view width, h/ey of its height; size is the text's font size (fraction of width). */
export type ArtBox = {w: number; h: number; ex: number; ey: number; size: number}
/** Text never grows taller than this share of its zone's height. */
const TEXT_HEIGHT = 0.72

export function artBox(zone: Zone2D, content: ArtContent, scale: number, rotation: number, aspect: number): ArtBox {
  const b = bounds(zone.polygon)
  let w: number, hw: number, size = 0
  if (content.kind === 'text') {
    // Auto-fit: as wide as the scale asks, capped by the zone height; never wider than the zone allows.
    size = Math.min((b.y1 - b.y0) / aspect * TEXT_HEIGHT, scale * zone.maxWidth / Math.max(0.01, content.ratio))
    w = size * content.ratio
    hw = size * 1.1
  } else {
    // A tall logo in a short zone (a waistband) is limited by the zone height instead.
    w = Math.min(scale * zone.maxWidth, (b.y1 - b.y0) / aspect * 0.9 / Math.max(0.01, content.ratio))
    hw = w * content.ratio
  }
  const t = rotation * Math.PI / 180, c = Math.abs(Math.cos(t)), s = Math.abs(Math.sin(t))
  return {w, h: hw * aspect, ex: w * c + hw * s, ey: (w * s + hw * c) * aspect, size}
}

/** Centre of the artwork: u/v move it across the room its zone leaves around it (0.5 = centred). */
export function centreOf(zone: Zone2D, u: number, v: number, box: ArtBox): Point {
  const b = bounds(zone.polygon)
  const axis = (lo: number, hi: number, extent: number, t: number) => hi - lo > extent ? lo + extent / 2 + t * (hi - lo - extent) : (lo + hi) / 2
  return [axis(b.x0, b.x1, box.ex, u), axis(b.y0, b.y1, box.ey, v)]
}
export function uvAt(zone: Zone2D, [x, y]: Point, box: ArtBox): Point {
  const b = bounds(zone.polygon)
  const axis = (lo: number, hi: number, extent: number, c: number) => hi - lo > extent ? round(clamp((c - lo - extent / 2) / (hi - lo - extent))) : 0.5
  return [axis(b.x0, b.x1, box.ex, x), axis(b.y0, b.y1, box.ey, y)]
}

/**
 * Where a dragged centre lands on `side`: inside an accepting zone it takes that zone; otherwise it stays in
 * `current` (same side) or snaps to the nearest accepting zone (other side). `allow` narrows the zones.
 */
export function dropZone(template: Template2D, kind: ZoneKind, side: ViewSide, point: Point, current: {side: ViewSide; zone: string}, allow: (zone: Zone2D) => boolean = () => true) {
  const zones = zonesOn(template, side).filter(zone => zone.accepts.includes(kind) && allow(zone))
  if (!zones.length) return null
  const inside = zones.find(zone => inPolygon(point, zone.polygon))
  if (inside) return inside
  const own = side === current.side ? zones.find(zone => zone.id === current.zone) : undefined
  if (own) return own
  const distance = (zone: Zone2D) => { const [x, y] = nearestInPolygon(point, zone.polygon); return Math.hypot(x - point[0], y - point[1]) }
  return zones.reduce((best, zone) => distance(zone) < distance(best) ? zone : best)
}

/** Design with one template placement replaced (every other template keeps its own). */
export function withPlacement(design: Design, templateId: string, kind: ZoneKind, placement: ZonePlacement): Design['placements2d'] {
  return {...design.placements2d, [templateId]: {...design.placements2d?.[templateId], [kind]: placement}}
}
