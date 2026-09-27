import type {Template2D, View2D, ViewSide, Zone2D} from './types'

const ALL = {baseColor: true, trim: true, accent: true, pattern: true, logo: true, text: true}

/** Standard layer paths for a rendered template view (see README.md). */
const view = (id: string, side: ViewSide, zones: Zone2D[], layers: {trim?: boolean; pattern?: boolean; highlight?: boolean} = {}): View2D => ({
  base: `/images/customizer/${id}/${side}-base.webp`,
  shading: `/images/customizer/${id}/${side}-shading.webp`,
  highlight: layers.highlight === false ? undefined : `/images/customizer/${id}/${side}-highlight.webp`,
  masks: {
    silhouette: `/images/customizer/${id}/${side}-mask-silhouette.webp`,
    body: `/images/customizer/${id}/${side}-mask-body.webp`,
    trim: layers.trim === false ? undefined : `/images/customizer/${id}/${side}-mask-trim.webp`,
    pattern: layers.pattern === false ? undefined : `/images/customizer/${id}/${side}-mask-pattern.webp`,
  },
  zones,
})

/** Rectangle helper for zone polygons (normalized view coordinates). */
const rect = (x0: number, y0: number, x1: number, y1: number): [number, number][] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]

/** 2D templates by id. A product without a template keeps the photo preview. */
export const templates: Record<string, Template2D> = {
  // Rendered from public/models/fight-short.glb. "Left"/"right" are the wearer's sides.
  'fight-short': {
    id: 'fight-short',
    aspect: 0.8,
    size: [1200, 1500],
    supports: ALL,
    views: {
      front: view('fight-short', 'front', [
        {id: 'waistbandFront', label: 'Front waistband', polygon: rect(0.2, 0.236, 0.8, 0.296), accepts: ['text', 'logo'], maxWidth: 0.46, defaults: ['text'], counterpart: 'waistbandBack', surface: 'trim'},
        {id: 'leftLeg', label: 'Left leg', polygon: [[0.54, 0.4], [0.83, 0.4], [0.88, 0.64], [0.56, 0.64]], accepts: ['logo', 'text'], maxWidth: 0.24, defaults: ['logo'], counterpart: 'leftRearLeg'},
        {id: 'rightLeg', label: 'Right leg', polygon: [[0.17, 0.4], [0.46, 0.4], [0.44, 0.64], [0.12, 0.64]], accepts: ['logo', 'text'], maxWidth: 0.24, counterpart: 'rightRearLeg'},
      ]),
      back: view('fight-short', 'back', [
        {id: 'waistbandBack', label: 'Back waistband', polygon: rect(0.2, 0.236, 0.8, 0.296), accepts: ['text', 'logo'], maxWidth: 0.46, counterpart: 'waistbandFront', surface: 'trim'},
        {id: 'leftRearLeg', label: 'Left rear leg', polygon: [[0.17, 0.42], [0.46, 0.42], [0.44, 0.66], [0.12, 0.66]], accepts: ['logo', 'text'], maxWidth: 0.24, counterpart: 'leftLeg'},
        {id: 'rightRearLeg', label: 'Right rear leg', polygon: [[0.54, 0.42], [0.83, 0.42], [0.88, 0.66], [0.56, 0.66]], accepts: ['logo', 'text'], maxWidth: 0.24, counterpart: 'rightLeg'},
      ]),
    },
  },
  // Rendered from public/models/rash-guard.glb (long raglan sleeves). Front "left" = the wearer's left (screen right).
  'rashguard-long': {
    id: 'rashguard-long',
    aspect: 0.8,
    size: [1200, 1500],
    supports: ALL,
    sheen: 0.32,
    views: {
      front: view('rashguard-long', 'front', [
        {id: 'chest', label: 'Chest', polygon: rect(0.35, 0.315, 0.65, 0.465), accepts: ['logo', 'text'], maxWidth: 0.27, defaults: ['logo'], counterpart: 'upperBack'},
        {id: 'leftSleeve', label: 'Left sleeve', polygon: [[0.745, 0.45], [0.885, 0.45], [0.94, 0.63], [0.82, 0.63]], accepts: ['logo'], maxWidth: 0.11},
        {id: 'rightSleeve', label: 'Right sleeve', polygon: [[0.115, 0.45], [0.255, 0.45], [0.18, 0.63], [0.06, 0.63]], accepts: ['logo', 'text'], maxWidth: 0.11},
      ]),
      back: view('rashguard-long', 'back', [
        {id: 'upperBack', label: 'Upper back', polygon: rect(0.34, 0.27, 0.66, 0.42), accepts: ['text', 'logo'], maxWidth: 0.29, defaults: ['text'], counterpart: 'chest'},
        {id: 'lowerBack', label: 'Lower back', polygon: rect(0.35, 0.58, 0.65, 0.74), accepts: ['logo', 'text'], maxWidth: 0.27},
      ]),
    },
  },
  // The same raglan body with the sleeves cut to short length at render time (see scripts/customizer-render/render.js).
  'rashguard-short': {
    id: 'rashguard-short',
    aspect: 0.8,
    size: [1200, 1500],
    supports: ALL,
    sheen: 0.32,
    views: {
      front: view('rashguard-short', 'front', [
        {id: 'chest', label: 'Chest', polygon: rect(0.35, 0.315, 0.65, 0.465), accepts: ['logo', 'text'], maxWidth: 0.27, defaults: ['logo'], counterpart: 'upperBack'},
        {id: 'leftSleeve', label: 'Left sleeve', polygon: [[0.72, 0.36], [0.84, 0.36], [0.885, 0.465], [0.74, 0.465]], accepts: ['logo'], maxWidth: 0.1},
        {id: 'rightSleeve', label: 'Right sleeve', polygon: [[0.16, 0.36], [0.28, 0.36], [0.26, 0.465], [0.115, 0.465]], accepts: ['logo', 'text'], maxWidth: 0.1},
      ]),
      back: view('rashguard-short', 'back', [
        {id: 'upperBack', label: 'Upper back', polygon: rect(0.34, 0.27, 0.66, 0.42), accepts: ['text', 'logo'], maxWidth: 0.29, defaults: ['text'], counterpart: 'chest'},
        {id: 'lowerBack', label: 'Lower back', polygon: rect(0.35, 0.58, 0.65, 0.74), accepts: ['logo', 'text'], maxWidth: 0.27},
      ]),
    },
  },
  // Rendered from public/models/bjj-gi.glb with its own texture; fabric and belt are separated from the image and the
  // model's baked-in third-party marks removed (scripts/build-customizer-assets.mjs, DERIVED.gi). The lapel is not a
  // separate part of this model, so lapel contrast (trim) is not offered; competition gis are solid (no pattern).
  gi: {
    id: 'gi',
    aspect: 0.8,
    size: [1200, 1500],
    supports: ALL,
    views: {
      front: view('gi', 'front', [
        {id: 'leftChest', label: 'Left chest', polygon: rect(0.53, 0.15, 0.69, 0.27), accepts: ['logo', 'text'], maxWidth: 0.12, defaults: ['logo'], counterpart: 'upperBack'},
        {id: 'rightChest', label: 'Right chest', polygon: [[0.29, 0.16], [0.4, 0.16], [0.42, 0.27], [0.29, 0.27]], accepts: ['text', 'logo'], maxWidth: 0.1},
        {id: 'leftShoulder', label: 'Left shoulder', polygon: [[0.68, 0.14], [0.76, 0.14], [0.78, 0.24], [0.7, 0.24]], accepts: ['logo'], maxWidth: 0.07},
        {id: 'leftThigh', label: 'Left thigh (pants)', polygon: rect(0.56, 0.55, 0.68, 0.64), accepts: ['logo', 'text'], maxWidth: 0.1},
      ], {trim: false, pattern: false, highlight: false}),
      back: view('gi', 'back', [
        {id: 'upperBack', label: 'Upper back', polygon: rect(0.39, 0.13, 0.61, 0.27), accepts: ['text', 'logo'], maxWidth: 0.2, defaults: ['text'], counterpart: 'leftChest'},
        {id: 'lowerBack', label: 'Lower back (above belt)', polygon: rect(0.4, 0.285, 0.6, 0.342), accepts: ['logo', 'text'], maxWidth: 0.18},
      ], {trim: false, pattern: false, highlight: false}),
    },
  },
}

/** Product slug → template id, for products that share one garment cut. */
export const aliases: Record<string, string> = {
  // Same Muay Thai cut as the Fight Short model (wide flared legs, elastic waistband, side slits); checked against each photo.
  'elite-fight-shorts': 'fight-short',
  'shadow-series': 'fight-short',
  'reign-fight-shorts': 'fight-short',
  'stealth-pro': 'fight-short',
  'academy-gold-shorts': 'fight-short',
  'crimson-training-shorts': 'fight-short',
  'full-sleeves': 'rashguard-long',
  'short-sleeves': 'rashguard-short',
  'bjj-gi': 'gi',
  'kids-bjj-gi': 'gi',
}

export const templateIdFor = (slug: string) => aliases[slug] ?? (templates[slug] ? slug : undefined)
export const getTemplate = (slug: string): Template2D | undefined => {
  const id = templateIdFor(slug)
  return id ? templates[id] : undefined
}
export const hasTemplate = (slug: string) => Boolean(getTemplate(slug))

/** Every layer URL of a template, for preloading. */
export const templateLayers = (template: Template2D) => Object.values(template.views).flatMap(view => view ? [view.base, view.shading, view.highlight, ...Object.values(view.masks)] : []).filter((src): src is string => Boolean(src))
