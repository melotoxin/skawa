import {useEffect,useMemo,useRef,useState} from 'react'
import {ArrowRight,Search,SlidersHorizontal,X} from 'lucide-react'
import {products} from '../data'
import ProductCard3D from '../components/ProductCard3D'
import {Link} from '../routing'
import {PageFrame} from './Pages'
import '../commerce-catalog.css'

const priceValue=(product:{price:string})=>{
  const match=product.price.match(/[0-9]+(?:\.[0-9]+)?/)
  return match?Number(match[0]):Number.POSITIVE_INFINITY
}

type SortMode='featured'|'price-low'|'price-high'|'name'
type RouteFilter='all'|'retail'|'quote'

const PRIMARY_CATEGORIES=[
  'GIs',
  'Rash Guards',
  'Fight Shorts',
  'Spats',
  'Belts',
  'Gloves',
  'Protective Gear',
  'Boxing Apparel',
  'Uniforms',
  'Bags',
  'Accessories',
  'Training Equipment',
  'Teamwear',
  'Training',
] as const

const sortOptions:{value:SortMode;label:string}[]=[
  {value:'featured',label:'Featured'},
  {value:'price-low',label:'Price · Low to high'},
  {value:'price-high',label:'Price · High to low'},
  {value:'name',label:'Name · A–Z'},
]

export default function CommerceCatalogPage(){
  const categoryOrder=useMemo(()=>{
    const present=new Set(products.map(product=>product.category))
    const ordered=PRIMARY_CATEGORIES.filter(category=>present.has(category))
    const extras=Array.from(present).filter(category=>!ordered.includes(category as typeof PRIMARY_CATEGORIES[number])).sort()
    return [...ordered,...extras]
  },[])
  const sports=useMemo(()=>Array.from(new Set(products.flatMap(product=>product.sports))).sort(),[])
  const initialParams=useMemo(()=>new URLSearchParams(window.location.search),[])
  const[search,setSearch]=useState(initialParams.get('search')||'')
  const[category,setCategory]=useState(()=>{
    const value=initialParams.get('category')||''
    return categoryOrder.includes(value)?value:''
  })
  const[sport,setSport]=useState('')
  const[route,setRoute]=useState<RouteFilter>('all')
  const[customOnly,setCustomOnly]=useState(initialParams.get('custom')==='true')
  const[wholesaleOnly,setWholesaleOnly]=useState(initialParams.get('wholesale')==='true')
  const[sort,setSort]=useState<SortMode>('featured')
  const[favorites,setFavorites]=useState<Set<number>>(()=>new Set())
  const[isMobile,setIsMobile]=useState(()=>window.matchMedia('(max-width: 900px)').matches)
  const[filtersOpen,setFiltersOpen]=useState(false)
  const filterButtonRef=useRef<HTMLButtonElement>(null)
  const closeButtonRef=useRef<HTMLButtonElement>(null)
  const panelRef=useRef<HTMLDivElement>(null)

  useEffect(()=>{
    const media=window.matchMedia('(max-width: 900px)')
    const sync=()=>setIsMobile(media.matches)
    media.addEventListener('change',sync)
    return()=>media.removeEventListener('change',sync)
  },[])

  useEffect(()=>{
    if(!isMobile||!filtersOpen)return
    const previous=document.body.style.overflow
    document.body.style.overflow='hidden'
    closeButtonRef.current?.focus()
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){
        setFiltersOpen(false)
        requestAnimationFrame(()=>filterButtonRef.current?.focus())
      }
    }
    window.addEventListener('keydown',onKey)
    return()=>{
      document.body.style.overflow=previous
      window.removeEventListener('keydown',onKey)
    }
  },[filtersOpen,isMobile])

  const clearFilters=()=>{
    setCategory('')
    setSport('')
    setRoute('all')
    setCustomOnly(false)
    setWholesaleOnly(false)
  }

  const visibleProducts=useMemo(()=>{
    const query=search.trim().toLowerCase()
    const filtered=products.filter(product=>{
      if(query&&!`${product.name} ${product.category} ${product.tag} ${product.description} ${product.sports.join(' ')}`.toLowerCase().includes(query))return false
      if(category&&product.category!==category)return false
      if(sport&&!product.sports.includes(sport))return false
      if(route==='retail'&&product.price.toLowerCase().includes('quote'))return false
      if(route==='quote'&&!product.price.toLowerCase().includes('quote'))return false
      if(customOnly&&!product.custom)return false
      if(wholesaleOnly&&!product.wholesale)return false
      return true
    })
    return [...filtered].sort((a,b)=>{
      if(sort==='price-low')return priceValue(a)-priceValue(b)
      if(sort==='price-high')return priceValue(b)-priceValue(a)
      if(sort==='name')return a.name.localeCompare(b.name)
      return a.id-b.id
    })
  },[category,customOnly,route,search,sort,sport,wholesaleOnly])

  const activeCount=[category,sport,route!=='all',customOnly,wholesaleOnly].filter(Boolean).length

  const toggleFavorite=(id:number)=>setFavorites(current=>{
    const next=new Set(current)
    if(next.has(id))next.delete(id);else next.add(id)
    return next
  })

  const Filters=({mobile}:{mobile?:boolean})=><div className="sf-shop__filters" ref={mobile?panelRef:undefined} id="shop-filters">
    {mobile&&<div className="sf-shop__filters-head">
      <div><span>REFINE</span><h3 id="shop-filter-title">Filters</h3></div>
      <button ref={closeButtonRef} type="button" aria-label="Close filters" onClick={()=>setFiltersOpen(false)}><X/></button>
    </div>}
    <div className="sf-shop__filter-block">
      <p>Category</p>
      <button type="button" className={!category?'is-on':''} onClick={()=>setCategory('')}>All products</button>
      {categoryOrder.map(item=><button type="button" key={item} className={category===item?'is-on':''} onClick={()=>setCategory(item)}>
        <span>{item}</span>
        <b>{products.filter(product=>product.category===item).length}</b>
      </button>)}
    </div>
    <div className="sf-shop__filter-block">
      <p>Sport</p>
      <button type="button" className={!sport?'is-on':''} onClick={()=>setSport('')}>Any sport</button>
      {sports.map(item=><button type="button" key={item} className={sport===item?'is-on':''} onClick={()=>setSport(item)}>{item}</button>)}
    </div>
    <div className="sf-shop__filter-block">
      <p>Order route</p>
      <button type="button" className={route==='all'?'is-on':''} onClick={()=>setRoute('all')}>All routes</button>
      <button type="button" className={route==='retail'?'is-on':''} onClick={()=>setRoute('retail')}>Priced retail</button>
      <button type="button" className={route==='quote'?'is-on':''} onClick={()=>setRoute('quote')}>Quote-led</button>
    </div>
    <div className="sf-shop__filter-block sf-shop__filter-toggles">
      <p>Capability</p>
      <label className={customOnly?'is-on':''}><input type="checkbox" checked={customOnly} onChange={event=>setCustomOnly(event.target.checked)}/><span/>Customizable</label>
      <label className={wholesaleOnly?'is-on':''}><input type="checkbox" checked={wholesaleOnly} onChange={event=>setWholesaleOnly(event.target.checked)}/><span/>Wholesale ready</label>
    </div>
    <div className="sf-shop__filter-actions">
      <button type="button" onClick={clearFilters}>Clear all</button>
      {mobile&&<button type="button" className="primary" onClick={()=>setFiltersOpen(false)}>Show {visibleProducts.length} <ArrowRight/></button>}
    </div>
  </div>

  return <PageFrame>
    <main className="sf-shop">
      <header className="sf-shop__hero">
        <div className="sf-shop__hero-copy">
          <span>SKAWA FIGHT · PRODUCT CATALOG</span>
          <h1>GEAR FOR EVERY<br/><em>CORNER.</em></h1>
          <p>Browse the full fightwear catalog. Customize eligible pieces, or request academy and private-label pricing.</p>
        </div>
        <div className="sf-shop__hero-visual" aria-hidden="true">
          <img src="/images/shop-hero-fighter.png" alt="" loading="eager" decoding="async"/>
        </div>
      </header>

      <section className="sf-shop__shell" aria-labelledby="shop-heading">
        <div className="sf-shop__toolbar">
          <div>
            <span>SHOP</span>
            <h2 id="shop-heading">Find your <em>fight kit.</em></h2>
          </div>
          <label className="sf-shop__search">
            <Search aria-hidden="true"/>
            <span className="sr-only">Search catalog</span>
            <input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search gis, shorts, gloves…" type="search"/>
            {search&&<button type="button" onClick={()=>setSearch('')} aria-label="Clear search"><X/></button>}
          </label>
          <button ref={filterButtonRef} type="button" className="sf-shop__filter-btn" aria-expanded={filtersOpen} aria-controls="shop-filters" onClick={()=>setFiltersOpen(value=>!value)}>
            <SlidersHorizontal/> Filters{activeCount>0&&<b>{activeCount}</b>}
          </button>
          <label className="sf-shop__sort">
            <span>Sort</span>
            <select value={sort} onChange={event=>setSort(event.target.value as SortMode)}>
              {sortOptions.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>

        <div className="sf-shop__chips" aria-label="Quick categories">
          <button type="button" className={!category?'is-on':''} onClick={()=>setCategory('')}>All</button>
          {categoryOrder.slice(0,8).map(item=><button type="button" key={item} className={category===item?'is-on':''} onClick={()=>setCategory(item)}>{item}</button>)}
        </div>

        <div className="sf-shop__layout">
          {!isMobile&&<aside className="sf-shop__rail" aria-label="Catalog filters">
            <Filters/>
          </aside>}

          <div className="sf-shop__main">
            <div className="sf-shop__results" aria-live="polite">
              <span>{String(visibleProducts.length).padStart(2,'0')} results</span>
              {activeCount>0&&<button type="button" onClick={clearFilters}>Clear filters <X/></button>}
            </div>

            {visibleProducts.length>0?<div className="sf-shop__grid">
              {visibleProducts.map((product,index)=><ProductCard3D
                key={product.id}
                product={product}
                index={index}
                favorite={favorites.has(product.id)}
                onToggleFavorite={()=>toggleFavorite(product.id)}
              />)}
            </div>:<div className="sf-shop__empty" role="status">
              <span>NO MATCH</span>
              <h3>Nothing in this corner.</h3>
              <p>Clear a filter or broaden your search.</p>
              <button type="button" onClick={()=>{setSearch('');clearFilters()}}>Reset catalog <ArrowRight/></button>
            </div>}
          </div>
        </div>

        {isMobile&&filtersOpen&&<>
          <button type="button" className="sf-shop__scrim" aria-label="Close filters" onClick={()=>setFiltersOpen(false)}/>
          <div className="sf-shop__drawer" role="dialog" aria-modal="true" aria-labelledby="shop-filter-title">
            <Filters mobile/>
          </div>
        </>}

        <aside className="sf-shop__cta">
          <div><span>NEED A CUSTOM BUILD?</span><h2>Make it <em>yours.</em></h2></div>
          <p>Open the Design Lab for a visual brief, or start a project request for academy and private-label production.</p>
          <div>
            <Link to="/customize">Open Design Lab <ArrowRight/></Link>
            <Link to="/request-mockup">Start a brief</Link>
          </div>
        </aside>
      </section>
    </main>
  </PageFrame>
}
