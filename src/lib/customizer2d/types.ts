/** What a zone accepts: an uploaded logo, the name/number text, or both. */
export type ZoneKind = 'logo' | 'text'
export type ViewSide = 'front' | 'back'

/** A printable area on one view. Coordinates are normalized to the view canvas (0–1). */
export type Zone2D = {
  id: string
  label: string
  polygon: [number, number][]
  accepts: ZoneKind[]
  /** Widest the artwork may print, as a fraction of the view width. */
  maxWidth: number
  /** Zone used when a product is first shown without a saved placement. */
  defaults?: ZoneKind[]
  /** Matching zone on the other side, used by "Show on both sides". */
  counterpart?: string
  /** Fabric the zone prints on (for contrast checks). Defaults to the body. */
  surface?: 'body' | 'trim'
}

/** One camera view of a garment. Every layer shares the same canvas and registration. */
export type View2D = {
  /** Opaque neutral garment: supplies details that are never recoloured (lining, stitching). */
  base: string
  /** Opaque multiply map: white leaves colour untouched, darker values add folds and shadow. */
  shading?: string
  /** Optional opaque screen map for sheen (black = none). */
  highlight?: string
  /** Alpha masks. `silhouette` is the garment outline, cut once at the end; the others hold straight coverage inside it. */
  masks: {silhouette: string; body: string; trim?: string; pattern?: string}
  zones: Zone2D[]
}

export type Supports = {baseColor: boolean; trim: boolean; accent: boolean; pattern: boolean; logo: boolean; text: boolean}

export type Template2D = {
  id: string
  /** Width / height of every view canvas. */
  aspect: number
  /** Pixel size the layers were produced at (width, height). */
  size: [number, number]
  views: {front: View2D; back?: View2D}
  supports: Supports
  /** Restricts colour choices (e.g. competition gis) when set. */
  palette?: string[]
  /** Fabric sheen strength (0–1): satin shorts shine, lycra and cotton much less. Defaults to 0.5. */
  sheen?: number
}
