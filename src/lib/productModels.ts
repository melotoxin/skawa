import type {Product} from '../types'

/** Procedural mesh families for SKAWA fightwear when a .glb is not yet exported. */
export type GearKind=
  |'gi'
  |'rashguard'
  |'shorts'
  |'gloves'
  |'mma-gloves'
  |'belt'
  |'bag'
  |'shin'
  |'mitt'
  |'wrap'
  |'mouthguard'
  |'spats'
  |'trunks'
  |'uniform'

const kindBySlug:Record<string,GearKind>={
  'bjj-gi':'gi',
  'kids-bjj-gi':'gi',
  'fight-short':'shorts',
  'elite-fight-shorts':'shorts',
  'shadow-series':'shorts',
  'reign-fight-shorts':'shorts',
  'stealth-pro':'shorts',
  'academy-gold-shorts':'shorts',
  'crimson-training-shorts':'shorts',
  'grappling-shorts':'shorts',
  'full-sleeves':'rashguard',
  'short-sleeves':'rashguard',
  'samurai-rashguard':'rashguard',
  'ranked-rashguard-black-belt':'rashguard',
  'ranked-rashy-blue-belt':'rashguard',
  'ranked-rashguard-brown-belt':'rashguard',
  'ranked-rashguard-purple-belt':'rashguard',
  'ranked-rashguard-white-belt':'rashguard',
  'boxing-gloves':'gloves',
  'mma-gloves':'mma-gloves',
  'jiu-jitsu-belts':'belt',
  'sports-bags':'bag',
  'gear-bags':'bag',
  'shin-pads':'shin',
  'focus-mitts':'mitt',
  'hand-wraps':'wrap',
  'mouth-guard':'mouthguard',
  'spats-compression-pants':'spats',
  'boxing-trunks':'trunks',
  'karate-uniform':'uniform',
  'judo-uniform':'uniform',
}

const kindByCategory:Record<string,GearKind>={
  'GIs':'gi',
  'Rash Guards':'rashguard',
  'Fight Shorts':'shorts',
  'Spats':'spats',
  'Belts':'belt',
  'Gloves':'gloves',
  'Protective Gear':'shin',
  'Boxing Apparel':'trunks',
  'Uniforms':'uniform',
  'Bags':'bag',
  'Accessories':'wrap',
  'Training Equipment':'mitt',
  'Teamwear':'shorts',
  'Training':'shorts',
}

/** Canonical GLB filename per gear family (swap file in /public/models to upgrade). */
export const modelFileByKind:Record<GearKind,string>={
  gi:'bjj-gi.glb',
  rashguard:'rash-guard.glb',
  shorts:'fight-short.glb',
  gloves:'gloves.glb',
  'mma-gloves':'mma-gloves.glb',
  belt:'belt.glb',
  bag:'gear-bag.glb',
  shin:'shin-pads.glb',
  mitt:'focus-mitts.glb',
  wrap:'hand-wraps.glb',
  mouthguard:'mouth-guard.glb',
  spats:'spats.glb',
  trunks:'boxing-trunks.glb',
  uniform:'uniform.glb',
}

export function resolveGearKind(product:Pick<Product,'slug'|'category'|'modelKind'>):GearKind{
  if(product.modelKind)return product.modelKind
  return kindBySlug[product.slug]||kindByCategory[product.category]||'rashguard'
}

export function resolveModelPath(product:Pick<Product,'slug'|'category'|'model'|'modelKind'>):string{
  if(product.model)return product.model
  const kind=resolveGearKind(product)
  return `/models/${modelFileByKind[kind]}`
}

/** Family fallback for catalog products without their own model (the ranked rash guards). Others stay procedural. */
const shippedModelByKind:Partial<Record<GearKind,string>>={
  rashguard:'/models/products/rash-guard-family.glb?v=opt',
}

/**
 * Product-specific models, generated from each product's own catalog photo (Higgsfield · SAM 3 3D) and
 * optimized with meshopt + WebP (see public/models/products/README.md). Products that share a photo share a model.
 */
const productModelBySlug:Record<string,string>={
  'bjj-gi':'bjj-gi',
  'kids-bjj-gi':'kids-bjj-gi',
  'fight-short':'fight-short',
  'elite-fight-shorts':'shorts-gold',
  'academy-gold-shorts':'shorts-gold',
  'shadow-series':'shorts-red',
  'crimson-training-shorts':'shorts-red',
  'reign-fight-shorts':'shorts-white',
  'stealth-pro':'shorts-camo',
  'grappling-shorts':'grappling-shorts',
  'boxing-trunks':'boxing-trunks',
  'spats-compression-pants':'spats-compression-pants',
  'full-sleeves':'full-sleeves',
  'short-sleeves':'short-sleeves',
  'karate-uniform':'karate-uniform',
  'judo-uniform':'judo-uniform',
  'jiu-jitsu-belts':'jiu-jitsu-belts',
  'boxing-gloves':'boxing-gloves',
  'mma-gloves':'mma-gloves',
  'focus-mitts':'focus-mitts',
  'shin-pads':'shin-pads',
  'hand-wraps':'hand-wraps',
  'sports-bags':'sports-bags',
  'gear-bags':'gear-bags',
}

export function apparelModelUrl(product:Pick<Product,'slug'|'category'|'modelKind'>):string|null{
  const own=productModelBySlug[product.slug]
  if(own)return `/models/products/${own}.glb?v=sam3`
  return shippedModelByKind[resolveGearKind(product)]??null
}

/** Attach model + modelKind defaults onto every catalog product. */
export function attachModels<T extends Product>(list:T[]):T[]{
  return list.map(product=>{
    const modelKind=resolveGearKind(product)
    const model=product.model||`/models/${modelFileByKind[modelKind]}`
    return {...product,model,modelKind}
  })
}
