import type {Product} from '../types'
import {Link} from '../routing'
import {ArrowRight,Heart} from 'lucide-react'

const slug=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
export const productPath=(product:Product)=>`/product/${product.slug||slug(product.name)}`

type Props={
  product:Product
  index:number
  favorite:boolean
  onToggleFavorite:()=>void
}

function statusBadge(product:Product){
  if(product.custom)return 'CUSTOM'
  if(product.availability==='Quote review'||/^quote/i.test(product.price))return 'QUOTE'
  if(product.availability==='In stock')return 'READY TO ORDER'
  return product.tag.toUpperCase()
}

/** Premium catalog card — uniform dark stage, CSS-only hover, flush footer. */
export default function ProductCard3D({product,index,favorite,onToggleFavorite}:Props){
  const badge=statusBadge(product)
  const isQuote=product.price.toLowerCase().includes('quote')||product.availability==='Quote review'
  const path=productPath(product)
  const hasAlt=Boolean(product.secondaryImage&&product.secondaryImage!==product.image)

  return (
    <article className={`product-card sf-card${isQuote?' is-quote':''}`}>
      <div className="sf-card__stage">
        <div className="sf-card__media">
          <Link to={path} className="sf-card__hit" aria-label={`View ${product.name}`}>
            <img
              className="sf-card__img"
              src={product.image}
              alt={product.name}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
            {hasAlt&&(
              <img
                className="sf-card__img sf-card__img--alt"
                src={product.secondaryImage}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
                aria-hidden="true"
              />
            )}
          </Link>
        </div>

        <div className="sf-card__chrome">
          <div className="sf-card__chrome-left">
            <span className="sf-card__index">{String(index+1).padStart(2,'0')}</span>
            <span className="sf-card__badge" title={badge}>{badge}</span>
          </div>
          <button
            type="button"
            className={`sf-card__wish${favorite?' is-on':''}`}
            aria-pressed={favorite}
            aria-label={`${favorite?'Remove':'Save'} ${product.name}`}
            onClick={event=>{
              event.preventDefault()
              event.stopPropagation()
              onToggleFavorite()
            }}
            onPointerDown={event=>event.stopPropagation()}
          >
            <Heart/>
          </button>
        </div>
      </div>

      <div className="sf-card__meta">
        <div className="sf-card__tags" aria-label="Product labels">
          <span className="sf-card__mono">{product.category}</span>
          {product.wholesale&&<span className="sf-card__mono sf-card__mono--mute">Wholesale</span>}
        </div>

        <h3 className="sf-card__title">
          <Link to={path}>{product.name}</Link>
        </h3>

        <div className="sf-card__swatches" aria-hidden="true">
          {product.colors.slice(0,4).map(color=>(
            <i key={color} style={{background:color}}/>
          ))}
        </div>

        <div className="sf-card__footer">
          <strong className={`sf-card__price${isQuote?' is-quote':''}`}>
            {isQuote?'Quote only':product.price}
          </strong>
          <div className="sf-card__actions">
            <Link className="sf-card__action sf-card__action--primary" to={path}>
              VIEW <ArrowRight aria-hidden="true"/>
            </Link>
            {product.custom?(
              <Link className="sf-card__action" to={`/customize?product=${product.slug}`}>
                CUSTOMIZE
              </Link>
            ):isQuote?(
              <Link className="sf-card__action" to={`/request-mockup?product=${product.slug}`}>
                REQUEST
              </Link>
            ):(
              <span className="sf-card__action sf-card__action--ghost" aria-hidden="true">CUSTOMIZE</span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
