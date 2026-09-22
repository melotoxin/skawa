import {useEffect,useMemo,useRef,useState} from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Minus,
  Plus,
  Ruler,
  ShieldCheck,
  Sparkles,
  Truck,
  X,
  ZoomIn,
} from 'lucide-react'
import {addToCart} from '../cart'
import {products} from '../data'
import {Link} from '../routing'
import type {Product} from '../types'
import {NotFound,PageFrame} from './Pages'
import '../product-detail.css'

const slug=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
const productPath=(product:Product)=>`/product/${product.slug||slug(product.name)}`

function findProduct(route:string){
  const key=route.split('/').pop()||''
  return products.find(product=>product.slug===key||slug(product.name)===key)
}

function planningCopy(product:Product){
  const methods=product.customizationMethods?.length?product.customizationMethods.join(', '):product.custom?'Sublimation, embroidery and labels':'Standard catalog finishing'
  const areas=product.customizableAreas?.length?product.customizableAreas.join(', '):'Confirmed per product specification'
  if(product.custom){
    return {
      subtitle:`Custom ${product.category.toLowerCase()}`,
      intro:product.description,
      productionTime:product.productionTime||'Custom: estimated after artwork approval',
      sampleAvailability:product.sampleAvailability||'Sample kit and product samples available on qualifying orders',
      shippingEstimate:product.shippingEstimate||'Confirmed with destination and quantity',
      reviewState:'Verified reviews are not available yet',
      construction:[
        product.material+(product.gsm?` · GSM: ${product.gsm}`:''),
        `Customization: ${methods}`,
        `Zones: ${areas}`,
        product.moq?`MOQ: ${product.moq}`:'Wholesale and academy programs supported',
        product.quantityTiers?`Quantity tiers: ${product.quantityTiers}`:'Volume pricing confirmed on quote',
      ],
    }
  }
  return {
    subtitle:product.category,
    intro:product.description,
    productionTime:product.productionTime||'Ready-to-order or quote-led depending on configuration',
    sampleAvailability:product.sampleAvailability||'Shown catalog imagery / sample options on request',
    shippingEstimate:product.shippingEstimate||'Confirmed with destination and quantity',
    reviewState:'Verified reviews are not available yet',
    construction:[
      product.material+(product.gsm?` · GSM: ${product.gsm}`:''),
      `Finishing: ${methods}`,
      product.moq?`MOQ: ${product.moq}`:'Retail and bulk paths available',
      product.quantityTiers?`Quantity tiers: ${product.quantityTiers}`:'Volume pricing confirmed on quote',
    ],
  }
}

const sizeGuideFallback=['XS','S','M','L','XL','2XL']

export default function ProductDetailPage({route}:{route:string}){
  const matchedProduct=useMemo(()=>findProduct(route),[route])
  if(!matchedProduct)return <NotFound/>
  return <ProductDetailContent key={matchedProduct.id} current={matchedProduct}/>
}

function ProductDetailContent({current}:{current:Product}){
  const metadata=planningCopy(current)
  const gallery=useMemo(()=>{
    const images=[current.image,current.secondaryImage].filter((value,index,list)=>Boolean(value)&&list.indexOf(value)===index)
    return images.map((image,index)=>({
      image,
      label:index===0?'Front':'Alternate',
      note:index===0?'Primary product view':'Additional catalog view',
      color:current.color,
      accent:current.accent,
    }))
  },[current])
  const sizes=current.sizes.length?current.sizes:sizeGuideFallback
  const defaultSize=sizes.find(value=>/^(m|medium|a2|small)$/i.test(value))||sizes[Math.min(1,sizes.length-1)]||sizes[0]

  const[variantIndex,setVariantIndex]=useState(0)
  const[size,setSize]=useState(defaultSize)
  const[quantity,setQuantity]=useState(1)
  const[added,setAdded]=useState(false)
  const[openPanel,setOpenPanel]=useState(0)
  const[sizeGuideOpen,setSizeGuideOpen]=useState(false)
  const closeGuideRef=useRef<HTMLButtonElement>(null)
  const sizeGuideTriggerRef=useRef<HTMLButtonElement>(null)
  const guideDialogRef=useRef<HTMLElement>(null)
  const selectedVariant=gallery[variantIndex]||gallery[0]

  useEffect(()=>{
    setVariantIndex(0)
    setSize(defaultSize)
    setQuantity(1)
    setOpenPanel(0)
  },[current.id,defaultSize])

  useEffect(()=>{
    document.title=`${current.name} — SKAWA FIGHT`
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content',current.description.slice(0,160))
  },[current])

  useEffect(()=>{
    if(!added)return
    const timeout=window.setTimeout(()=>setAdded(false),2400)
    return()=>window.clearTimeout(timeout)
  },[added])

  useEffect(()=>{
    if(!sizeGuideOpen)return
    const previousOverflow=document.body.style.overflow
    const previousFocus=document.activeElement instanceof HTMLElement?document.activeElement:sizeGuideTriggerRef.current
    const onKeyDown=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){
        event.preventDefault()
        setSizeGuideOpen(false)
        return
      }
      if(event.key!=='Tab'||!guideDialogRef.current)return
      const focusable=Array.from(guideDialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'))
      if(!focusable.length){event.preventDefault();guideDialogRef.current.focus();return}
      const first=focusable[0]
      const last=focusable[focusable.length-1]
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
    }
    document.body.style.overflow='hidden'
    window.addEventListener('keydown',onKeyDown)
    requestAnimationFrame(()=>closeGuideRef.current?.focus())
    return()=>{
      document.body.style.overflow=previousOverflow
      window.removeEventListener('keydown',onKeyDown)
      previousFocus?.focus()
    }
  },[sizeGuideOpen])

  const add=()=>{
    addToCart({
      id:current.id,
      name:current.name,
      price:current.price,
      color:selectedVariant.color,
      size,
      quantity,
    })
    setAdded(true)
  }

  const related=products
    .filter(product=>product.id!==current.id&&(product.category===current.category||product.custom===current.custom))
    .slice(0,3)

  return <PageFrame>
    <main className="sf-pdp">
      <div className="sf-pdp__topline">
        <nav aria-label="Breadcrumb">
          <Link to="/shop">SHOP</Link><span>/</span><span>{current.category.toUpperCase()}</span><span>/</span><b>{current.name.toUpperCase()}</b>
        </nav>
        <Link className="sf-pdp__back" to="/shop"><ArrowLeft/> BACK TO FIGHTWEAR</Link>
      </div>

      <div className="sf-pdp__layout">
        <section className="sf-pdp__gallery" aria-label={`${current.name} product gallery`}>
          <div className="sf-pdp__thumbs" role="list" aria-label="Choose product view">
            {gallery.map((item,index)=><button
              key={`${item.image}-${index}`}
              type="button"
              className={variantIndex===index?'is-active':''}
              onClick={()=>setVariantIndex(index)}
              aria-pressed={variantIndex===index}
              aria-label={`View ${item.label.toLowerCase()} image`}
            ><span>{String(index+1).padStart(2,'0')}</span><img src={item.image} alt=""/><small>{item.label}</small></button>)}
          </div>

          <div className="sf-pdp__stage">
            <span className="sf-pdp__watermark" aria-hidden="true">SKAWA</span>
            <div className="sf-pdp__stage-meta"><span>0{variantIndex+1} / 0{gallery.length}</span><span><ZoomIn/> PRODUCT DETAIL</span></div>
            <img
              key={selectedVariant.image}
              className="sf-pdp__main-image"
              src={selectedVariant.image}
              alt={`${current.name} — ${selectedVariant.note}`}
            />
            <div className="sf-pdp__image-note"><b>{selectedVariant.label}</b><span>{selectedVariant.note}</span></div>
          </div>
        </section>

        <section className="sf-pdp__buy" aria-labelledby="product-title">
          <div className="sf-pdp__kicker"><span>{current.tag}</span><b>{current.wholesale?'WHOLESALE ELIGIBLE':'RETAIL READY'}</b><strong>{current.custom?'CUSTOMIZABLE':'STANDARD PRODUCT'}</strong></div>
          <h1 id="product-title">{current.name}</h1>
          <p className="sf-pdp__subtitle">{metadata.subtitle.toUpperCase()}</p>
          <div className="sf-pdp__review-state" aria-label="Product review status"><span>REVIEWS</span><b>{metadata.reviewState}</b></div>
          <div className="sf-pdp__price"><strong>{current.price}</strong><span>Taxes and shipping calculated at confirmation.</span></div>
          <p className="sf-pdp__intro">{metadata.intro}</p>

          <dl className="sf-pdp__facts" aria-label="Product planning information">
            <div><dt>MATERIAL</dt><dd>{current.material}</dd></div>
            <div><dt>PRODUCTION TIME</dt><dd>{metadata.productionTime}</dd></div>
            <div><dt>SAMPLE</dt><dd>{metadata.sampleAvailability}</dd></div>
            <div><dt>SHIPPING ESTIMATE</dt><dd>{metadata.shippingEstimate}</dd></div>
          </dl>
          <p className="sf-pdp__facts-note">Catalog synced from skawafight.com. Confirm final material, production and delivery terms before ordering.</p>

          {gallery.length>1&&<fieldset className="sf-pdp__option">
            <legend>VIEW <b>{selectedVariant.label}</b></legend>
            <div className="sf-pdp__swatches">
              {gallery.map((variant,index)=><button
                key={`${variant.image}-${index}`}
                type="button"
                className={variantIndex===index?'is-active':''}
                style={{'--swatch-color':variant.color,'--swatch-accent':variant.accent} as React.CSSProperties}
                onClick={()=>setVariantIndex(index)}
                aria-label={`Select ${variant.label}`}
                aria-pressed={variantIndex===index}
              ><span/></button>)}
            </div>
          </fieldset>}

          <fieldset className="sf-pdp__option">
            <legend>SELECT SIZE <button ref={sizeGuideTriggerRef} type="button" onClick={()=>setSizeGuideOpen(true)} aria-haspopup="dialog"><Ruler/> SIZE GUIDE</button></legend>
            <div className="sf-pdp__sizes">
              {sizes.map(label=><button type="button" key={label} className={size===label?'is-active':''} onClick={()=>setSize(label)} aria-pressed={size===label}>{label}</button>)}
            </div>
          </fieldset>

          <div className="sf-pdp__purchase">
            <div className="sf-pdp__quantity" aria-label="Quantity selector">
              <button type="button" onClick={()=>setQuantity(Math.max(1,quantity-1))} aria-label="Decrease quantity"><Minus/></button>
              <span aria-live="polite">{quantity}</span>
              <button type="button" onClick={()=>setQuantity(Math.min(99,quantity+1))} aria-label="Increase quantity"><Plus/></button>
            </div>
            <button type="button" className="sf-pdp__add" onClick={add}>{added?<><Check/> ADDED TO BAG</>:<>ADD TO BAG <ArrowRight/></>}</button>
          </div>
          <div className="sf-pdp__status" aria-live="polite">{added&&`${quantity} × ${current.name}, size ${size}, added to your bag.`}</div>
          {current.custom&&<Link className="sf-pdp__customize" to={`/customize?product=${current.slug}`}><Sparkles/> CUSTOMIZE THIS PRODUCT <ArrowRight/></Link>}

          <div className="sf-pdp__trust" aria-label="Purchase benefits">
            <span><ShieldCheck/><b>PRO-GRADE QUALITY</b><small>Reinforced & inspected</small></span>
            <span><Truck/><b>GLOBAL DELIVERY</b><small>Tracked from our floor</small></span>
          </div>

          <div className="sf-pdp__accordions">
            {[
              {title:'Materials & construction',body:<ul>{metadata.construction.map(item=><li key={item}>{item}</li>)}</ul>},
              {title:'Customization methods',body:<p>{current.custom?'Built for dye-sublimation artwork, academy marks, sponsor logos and athlete names. Start in the Design Lab or request a production-ready digital mockup.':'This is a finished catalog product. Custom programs can start from Fight Short, BJJ GI, Full Sleeves or Short Sleeves.'}</p>},
              {title:'Production & shipping',body:<p>{metadata.productionTime}. {metadata.shippingEstimate}. Timing begins after size, artwork and payment terms are confirmed.</p>},
            ].map((panel,index)=>{
              const isOpen=openPanel===index
              return <div key={panel.title} className={isOpen?'is-open':''}>
                <button type="button" onClick={()=>setOpenPanel(isOpen?-1:index)} aria-expanded={isOpen} aria-controls={`pdp-detail-${index}`}>
                  <span>0{index+1}</span>{panel.title}<ChevronDown/>
                </button>
                <div id={`pdp-detail-${index}`} hidden={!isOpen}>{panel.body}</div>
              </div>
            })}
          </div>
        </section>
      </div>

      <section className="sf-pdp__bulk" aria-labelledby="bulk-title">
        <div><span>GYMS, ACADEMIES & BRANDS</span><h2 id="bulk-title">BUILD A TEAM.<br/><em>UNLOCK BULK VALUE.</em></h2><p>Consistent sizing, coordinated artwork and a guided production path for larger programs.</p><Link to={`/request-mockup?intent=bulk&product=${current.slug}`}>REQUEST TEAM PRICING <ArrowRight/></Link></div>
        <div className="sf-pdp__tiers">
          <span>ESTIMATED UNIT PRICING</span>
          <table><caption>Estimated bulk pricing by order quantity</caption><tbody>
            <tr><th scope="row">1–9 units</th><td>{current.price}</td></tr>
            <tr><th scope="row">10–24 units</th><td>Pricing review</td></tr>
            <tr><th scope="row">25–49 units</th><td>Volume quote</td></tr>
            <tr><th scope="row">50+ units</th><td>Program quote</td></tr>
          </tbody></table>
          <small>Live catalog prices from skawafight.com. Final quotes depend on artwork, material and delivery requirements.</small>
        </div>
      </section>

      <section className="sf-pdp__related" aria-labelledby="related-title">
        <div className="sf-pdp__section-head"><div><span>COMPLETE THE KIT</span><h2 id="related-title">MORE FROM THE FIGHT FLOOR.</h2></div><Link to="/shop">VIEW ALL FIGHTWEAR <ArrowRight/></Link></div>
        <div className="sf-pdp__related-grid">
          {related.map(product=><article key={product.id}>
            <Link className="sf-pdp__related-image" to={productPath(product)}><span>{product.tag}</span><img src={product.image} alt={product.name}/></Link>
            <div><Link to={productPath(product)}><h3>{product.name}</h3></Link><b>{product.price}</b></div>
            <small>{product.category}</small>
          </article>)}
        </div>
      </section>
    </main>

    <div className="sf-pdp__mobile-buy" role="region" aria-label="Quick add to bag">
      <span><small>{current.name}</small><b>{current.price}</b></span>
      <button type="button" onClick={add}>{added?<><Check/> ADDED</>:<>ADD · {size} <ArrowRight/></>}</button>
    </div>

    {sizeGuideOpen&&<div className="sf-pdp__modal" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)setSizeGuideOpen(false)}}>
      <section ref={guideDialogRef} role="dialog" aria-modal="true" aria-labelledby="size-guide-title" aria-describedby="size-guide-description" tabIndex={-1}>
        <button ref={closeGuideRef} className="sf-pdp__modal-close" type="button" onClick={()=>setSizeGuideOpen(false)} aria-label="Close size guide"><X/></button>
        <span>FIND YOUR FIGHT FIT</span><h2 id="size-guide-title">{current.category.toUpperCase()} SIZE GUIDE</h2><p id="size-guide-description">Sizes below match the live Skawa Fight options for this product. If you are between sizes, choose the larger size for training comfort.</p>
        <table><caption>{current.name} available sizes</caption><thead><tr><th>Size</th></tr></thead><tbody>{sizes.map(label=><tr key={label}><td>{label}</td></tr>)}</tbody></table>
        <small>Measurements are a fit guide. Production specifications should be verified before launch.</small>
      </section>
    </div>}
  </PageFrame>
}
