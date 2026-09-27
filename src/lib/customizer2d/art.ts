import type {Design} from '../customDesign'
import type {ArtItem, ComposeInput} from './compose'
import {font2d, textRatio} from './fonts'
import {artBox, centreOf, instancesOf, resolvePlacement, type ArtBox, type ArtContent, type Instance} from './placement'
import {nearestColor} from './quality'
import type {Template2D, ZoneKind} from './types'

type Point = [number, number]
/** One printed copy of the text or logo, with its box for selection and hit-testing. */
export type Placed = {kind: ZoneKind; instance: Instance; content: ArtContent; box: ArtBox; centre: Point; item: ArtItem}

/** Every printed copy of the text and logo on a templated product. */
export function placeAll(template: Template2D, design: Design, logo: HTMLImageElement | null): Placed[] {
  const out: Placed[] = []
  const place = (kind: ZoneKind, content: ArtContent, mirror: boolean, make: (instance: Instance, box: ArtBox, centre: Point) => ArtItem) => {
    const placement = resolvePlacement(template, design, kind)
    if (placement) for (const instance of instancesOf(template, placement, mirror)) {
      const box = artBox(instance.zone, content, instance.scale, instance.rotation, template.aspect)
      const centre = centreOf(instance.zone, instance.u, instance.v, box)
      out.push({kind, instance, content, box, centre, item: make(instance, box, centre)})
    }
  }
  // Logo first: the name prints over it, and is picked first.
  if (logo && design.logo && template.supports.logo) place('logo', {kind: 'logo', ratio: logo.naturalHeight / Math.max(1, logo.naturalWidth)}, design.mirrorLogo ?? design.mirrorArt ?? false,
    (instance, box, [x, y]) => ({kind: 'logo', image: logo, x, y, width: box.w, rotation: instance.rotation, clip: instance.zone.polygon}))
  if (design.text && template.supports.text) {
    const spec = font2d(design.font)
    place('text', {kind: 'text', ratio: textRatio(design.text, design.font)}, design.mirrorText ?? design.mirrorArt ?? false,
      (instance, box, [x, y]) => ({kind: 'text', text: design.text, font: spec.stack, weight: spec.weight, color: design.textColor, x, y, size: box.size, maxWidth: instance.zone.maxWidth, rotation: instance.rotation, clip: instance.zone.polygon}))
  }
  return out
}

/** A template limited to fixed colours shows the nearest allowed one (the design keeps the customer's choice). */
export const shownColor = (template: Template2D, hex: string) => template.palette && !template.palette.includes(hex.toLowerCase()) ? nearestColor(template.palette, hex) : hex

/** The compose input for one view: shared by the on-screen proof and the downloaded proof, so they match. */
export function composeInput(template: Template2D, design: Design, placed: Placed[]): ComposeInput {
  return {
    color: shownColor(template, design.color), trim: shownColor(template, design.trim), accent: design.accent, pattern: design.pattern,
    use: {baseColor: template.supports.baseColor, trim: template.supports.trim, pattern: template.supports.pattern && template.supports.accent},
    art: placed.map(p => p.item), sheen: template.sheen,
  }
}
