export type Product = {
  id: number
  sourceId: number
  slug: string
  name: string
  category: string
  price: string
  color: string
  accent: string
  custom: boolean
  wholesale: boolean
  tag: string
  image: string
  secondaryImage: string
  /** Path to optional GLB under /public/models — procedural mesh used when missing */
  model?: string
  /** Procedural mesh family when GLB is absent */
  modelKind?: import('./lib/productModels').GearKind
  sports: string[]
  material: string
  availability: 'Custom order' | 'In stock' | 'Quote review'
  colors: string[]
  sizes: string[]
  description: string
  /** PRD catalog fields — confirmed values replace quote-led defaults later */
  gsm?: string
  moq?: string
  productionTime?: string
  sampleAvailability?: string
  customizationMethods?: string[]
  customizableAreas?: string[]
  packagingOptions?: string[]
  shippingEstimate?: string
  quantityTiers?: string
}
