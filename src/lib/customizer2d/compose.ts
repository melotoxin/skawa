import type {Pattern} from '../customDesign'
import {drawPattern} from './patterns'
import type {Template2D, View2D, ViewSide} from './types'

/** Decoded layers of one template view. */
export type LoadedView = {
  size: [number, number]
  base: HTMLImageElement
  shading?: HTMLImageElement
  highlight?: HTMLImageElement
  silhouette: HTMLImageElement
  body: HTMLImageElement
  trim?: HTMLImageElement
  pattern?: HTMLImageElement
}

type Polygon = [number, number][]

/** How strongly the garment's folds shade printed artwork (1 = as strongly as the fabric). */
const ART_SHADING = 0.7

/**
 * Artwork in view-normalized units: x/y is the centre (0–1 of the view), text `size` is the font size
 * and `maxWidth` the widest line as fractions of the view width, logo `width` likewise.
 */
export type ArtItem =
  | {kind: 'text'; text: string; font: string; weight: number; color: string; x: number; y: number; size: number; maxWidth: number; rotation: number; clip?: Polygon}
  | {kind: 'logo'; image: HTMLImageElement; x: number; y: number; width: number; rotation: number; clip?: Polygon}

export type ComposeInput = {
  color: string
  trim: string
  accent: string
  pattern: Pattern
  /** Layers the template supports; anything else is left as the neutral base. */
  use: {baseColor: boolean; trim: boolean; pattern: boolean}
  art: ArtItem[]
  /** Satin sheen strength (screen), 0–1. */
  sheen?: number
}

const images = new Map<string, Promise<HTMLImageElement>>()
function decode(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(src.startsWith('data:') ? 'Artwork could not be decoded' : `Could not load ${src}`))
    img.src = src
  })
}
/** Decoded image, cached per URL. Uploaded artwork (data URLs) is decoded fresh and never cached. */
export function loadImage(src: string) {
  if (src.startsWith('data:')) return decode(src)
  let promise = images.get(src)
  if (!promise) {
    promise = decode(src)
    images.set(src, promise)
    promise.catch(() => images.delete(src))
  }
  return promise
}

export async function loadView(template: Template2D, side: ViewSide): Promise<LoadedView> {
  const view: View2D = (side === 'back' && template.views.back) || template.views.front
  const optional = (src?: string) => src ? loadImage(src) : Promise.resolve(undefined)
  const [base, shading, highlight, silhouette, body, trim, pattern] = await Promise.all([
    loadImage(view.base), optional(view.shading), optional(view.highlight),
    loadImage(view.masks.silhouette), loadImage(view.masks.body), optional(view.masks.trim), optional(view.masks.pattern),
  ])
  return {size: template.size, base, shading, highlight, silhouette, body, trim, pattern}
}

/** Starts downloading every layer of a template (ignored if one fails; the view reports it). */
export function preloadTemplate(template: Template2D) {
  for (const view of Object.values(template.views)) if (view) {
    for (const src of [view.base, view.shading, view.highlight, ...Object.values(view.masks)]) if (src) loadImage(src).catch(() => {})
  }
}

/** Reusable scratch canvases, sized to the job. */
const scratch: Record<string, HTMLCanvasElement> = {}
function layer(name: string, width: number, height: number) {
  const canvas = scratch[name] ??= document.createElement('canvas')
  if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height }
  const ctx = canvas.getContext('2d')!
  reset(ctx)
  ctx.clearRect(0, 0, width, height)
  return {canvas, ctx}
}
function reset(ctx: CanvasRenderingContext2D) {
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
}

/**
 * A layer resampled once to the render size, so every later draw is a 1:1 copy (scaling is the costly part).
 * Least recently used first out, within a pixel budget (about 48 MB), so switching products never grows memory.
 */
const resampled = new Map<string, HTMLCanvasElement>()
const RESAMPLE_BUDGET = 12_000_000
let resampledPixels = 0
function at(image: HTMLImageElement, width: number, height: number): HTMLImageElement | HTMLCanvasElement {
  if (image.naturalWidth === width && image.naturalHeight === height) return image
  const key = `${width}x${height} ${image.src}`
  let canvas = resampled.get(key)
  if (canvas) { resampled.delete(key); resampled.set(key, canvas); return canvas }
  canvas = document.createElement('canvas')
  canvas.width = width; canvas.height = height
  const ctx = canvas.getContext('2d')!
  reset(ctx)
  ctx.drawImage(image, 0, 0, width, height)
  resampled.set(key, canvas)
  resampledPixels += width * height
  for (const [oldKey, old] of resampled) {
    if (resampledPixels <= RESAMPLE_BUDGET || oldKey === key) break
    resampled.delete(oldKey); resampledPixels -= old.width * old.height
    old.width = old.height = 0
  }
  return canvas
}

/** Body and trim coverage together (they're disjoint, so their coverage adds): where artwork can print. */
const fabrics = new WeakMap<LoadedView, Map<string, HTMLCanvasElement>>()
function fabricOf(view: LoadedView, width: number, height: number) {
  let sizes = fabrics.get(view)
  if (!sizes) fabrics.set(view, sizes = new Map())
  const key = `${width}x${height}`
  let canvas = sizes.get(key)
  if (!canvas) {
    canvas = document.createElement('canvas')
    canvas.width = width; canvas.height = height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(at(view.body, width, height), 0, 0)
    if (view.trim) { ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(at(view.trim, width, height), 0, 0) }
    sizes.set(key, canvas)
  }
  return canvas
}

/** Paint × shading, cut to the given masks, laid over the view. */
function paintRegion(target: CanvasRenderingContext2D, view: LoadedView, width: number, height: number, masks: HTMLImageElement[], paint: (ctx: CanvasRenderingContext2D) => void) {
  const {canvas, ctx} = layer('region', width, height)
  paint(ctx)
  if (view.shading) { ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(at(view.shading, width, height), 0, 0) }
  ctx.globalCompositeOperation = 'destination-in'
  for (const mask of masks) ctx.drawImage(at(mask, width, height), 0, 0)
  target.drawImage(canvas, 0, 0)
}

function tracePolygon(ctx: CanvasRenderingContext2D, polygon: Polygon, width: number, height: number) {
  ctx.beginPath()
  polygon.forEach(([x, y], i) => i ? ctx.lineTo(x * width, y * height) : ctx.moveTo(x * width, y * height))
  ctx.closePath()
}

/** Artwork printed on the fabric: clipped to its zone and the garment, with the folds showing through. */
function paintArt(target: CanvasRenderingContext2D, view: LoadedView, width: number, height: number, items: ArtItem[]) {
  if (!items.length) return
  const art = layer('art', width, height)
  for (const item of items) {
    const ctx = art.ctx
    ctx.save()
    if (item.clip) { tracePolygon(ctx, item.clip, width, height); ctx.clip() }
    ctx.translate(item.x * width, item.y * height)
    ctx.rotate(item.rotation * Math.PI / 180)
    if (item.kind === 'text') {
      ctx.fillStyle = item.color
      ctx.font = `${item.weight} ${item.size * width}px ${item.font}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(item.text, 0, 0, item.maxWidth * width)
    } else {
      const w = item.width * width, h = w * item.image.naturalHeight / Math.max(1, item.image.naturalWidth)
      ctx.drawImage(item.image, -w / 2, -h / 2, w, h)
    }
    ctx.restore()
  }
  // Only the part of the artwork that lands on fabric prints.
  art.ctx.globalCompositeOperation = 'destination-in'
  art.ctx.drawImage(fabricOf(view, width, height), 0, 0)
  if (!view.shading) { target.drawImage(art.canvas, 0, 0); return }
  // Folds show through the print: multiply by the shading (softened, so ribs and seams never cut through
  // letters), then restore the artwork's own coverage.
  const shaded = layer('shaded', width, height)
  shaded.ctx.drawImage(art.canvas, 0, 0)
  shaded.ctx.globalCompositeOperation = 'multiply'
  shaded.ctx.globalAlpha = ART_SHADING
  shaded.ctx.drawImage(at(view.shading, width, height), 0, 0)
  shaded.ctx.globalAlpha = 1
  shaded.ctx.globalCompositeOperation = 'destination-in'
  shaded.ctx.drawImage(art.canvas, 0, 0)
  target.drawImage(shaded.canvas, 0, 0)
}

/** The garment without artwork, cached per target canvas: dragging artwork never repaints colours and patterns. */
const garments = new WeakMap<HTMLCanvasElement, {key: string; view: LoadedView; canvas: HTMLCanvasElement}>()
function garment(view: LoadedView, input: ComposeInput, target: HTMLCanvasElement, width: number, height: number) {
  const key = JSON.stringify([width, height, input.color, input.trim, input.accent, input.pattern, input.use])
  const cached = garments.get(target)
  if (cached && cached.view === view && cached.key === key) return cached.canvas
  const canvas = cached?.canvas ?? document.createElement('canvas')
  canvas.width = width; canvas.height = height
  const ctx = canvas.getContext('2d')!
  reset(ctx)
  ctx.drawImage(at(view.base, width, height), 0, 0)
  if (input.use.baseColor) paintRegion(ctx, view, width, height, [view.body], c => { c.fillStyle = input.color; c.fillRect(0, 0, width, height) })
  if (input.use.pattern && input.pattern !== 'solid' && (view.pattern || view.body)) {
    paintRegion(ctx, view, width, height, [view.pattern ?? view.body, view.body], c => drawPattern(c, width, height, input.pattern, input.color, input.accent))
  }
  if (input.use.trim && view.trim) paintRegion(ctx, view, width, height, [view.trim], c => { c.fillStyle = input.trim; c.fillRect(0, 0, width, height) })
  garments.set(target, {key, view, canvas})
  return canvas
}

/**
 * Renders one template view into `target` at `scale` × the template size.
 * Deterministic: the same view, input and scale always produce the same pixels (the export reuses it).
 * Order: base → base colour → pattern → trim → artwork → sheen → silhouette cut.
 */
export function composeView(view: LoadedView, input: ComposeInput, target: HTMLCanvasElement, scale = 1) {
  const width = Math.round(view.size[0] * scale), height = Math.round(view.size[1] * scale)
  const base = garment(view, input, target, width, height)
  if (target.width !== width || target.height !== height) { target.width = width; target.height = height }
  const ctx = target.getContext('2d')!
  reset(ctx)
  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(base, 0, 0)
  paintArt(ctx, view, width, height, input.art)

  if (view.highlight) {
    ctx.globalCompositeOperation = 'screen'
    ctx.globalAlpha = input.sheen ?? 0.5
    ctx.drawImage(at(view.highlight, width, height), 0, 0)
    ctx.globalAlpha = 1
  }
  ctx.globalCompositeOperation = 'destination-in'
  ctx.drawImage(at(view.silhouette, width, height), 0, 0)
  ctx.globalCompositeOperation = 'source-over'
}
