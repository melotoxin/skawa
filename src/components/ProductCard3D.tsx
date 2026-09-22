import {useEffect,useRef,useState,type PointerEvent as ReactPointerEvent} from 'react'
import {Link} from '../routing'
import type {Product} from '../types'
import {ArrowRight,Heart} from 'lucide-react'

const slug=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
export const productPath=(product:Product)=>`/product/${product.slug||slug(product.name)}`

type Props={
  product:Product
  index:number
  favorite:boolean
  onToggleFavorite:()=>void
}

/** Luxury product card — dark stage, cutout photos, pointer tilt depth. */
export default function ProductCard3D({product,index,favorite,onToggleFavorite}:Props){
  const stageRef=useRef<HTMLDivElement>(null)
  const[tilt,setTilt]=useState({x:0,y:0})
  const[hover,setHover]=useState(false)
  const reduced=useRef(typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  const onMove=(event:ReactPointerEvent<HTMLDivElement>)=>{
    if(reduced.current||!stageRef.current)return
    const rect=stageRef.current.getBoundingClientRect()
    const px=(event.clientX-rect.left)/rect.width
    const py=(event.clientY-rect.top)/rect.height
    setTilt({x:(py-.5)*-10,y:(px-.5)*12})
  }
  const onLeave=()=>{setHover(false);setTilt({x:0,y:0})}

  useEffect(()=>{
    const media=window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync=()=>{reduced.current=media.matches}
    media.addEventListener('change',sync)
    return()=>media.removeEventListener('change',sync)
  },[])

  const statusTag=product.custom?'CUSTOM':product.tag.toUpperCase()

  return <article className={`product-card sf-card${hover?' is-hot':''}`}>
    <div
      ref={stageRef}
      className="sf-card__stage"
      onPointerEnter={()=>setHover(true)}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <div className="sf-card__orb" aria-hidden="true"/>
      <div className="sf-card__floor" aria-hidden="true"/>
      <div
        className="sf-card__model"
        style={{transform:`rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(${hover?20:8}px)`}}
      >
        <Link to={productPath(product)} aria-label={`View ${product.name}`} className="sf-card__hit">
          <img className="product-card__img" src={product.image} alt={product.name} loading="lazy" decoding="async"/>
          {product.secondaryImage!==product.image&&(
            <img className="product-card__img sf-card__alt" src={product.secondaryImage} alt="" loading="lazy" aria-hidden="true"/>
          )}
        </Link>
      </div>
      <span className="sf-card__index">{String(index+1).padStart(2,'0')}</span>
      <span className="sf-card__badge">{statusTag}</span>
      <button type="button" className={favorite?'is-on':''} aria-pressed={favorite} aria-label={`${favorite?'Remove':'Save'} ${product.name}`} onClick={onToggleFavorite}><Heart/></button>
    </div>

    <div className="sf-card__meta">
      <div className="sf-card__tags">
        <span className="sf-card__mono">{product.category.toUpperCase()}</span>
        {product.wholesale&&<span className="sf-card__mono sf-card__mono--mute">WHOLESALE</span>}
        {!product.custom&&product.availability==='In stock'&&<span className="sf-card__mono sf-card__mono--mute">READY TO ORDER</span>}
      </div>
      <h3><Link to={productPath(product)}>{product.name}</Link></h3>
      <div className="sf-card__swatches" aria-hidden="true">{product.colors.slice(0,5).map(color=><i key={color} style={{background:color}}/>)}</div>
      <div className="sf-card__footer">
        <strong className="sf-card__price">{product.price}</strong>
        <div className="sf-card__actions">
          <Link to={productPath(product)}>VIEW <ArrowRight/></Link>
          {product.custom&&<Link to={`/customize?product=${product.slug}`}>CUSTOMIZE</Link>}
        </div>
      </div>
    </div>
  </article>
}
