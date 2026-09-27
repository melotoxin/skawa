import {ArrowRight,Menu,Search,ShoppingBag,Trash2,UserRound,X} from 'lucide-react'
import {useEffect,useRef,useState,type CSSProperties,type FormEvent,type MouseEvent as ReactMouseEvent} from 'react'
import {getCart,setCart,type CartItem} from '../cart'
import {Link,go,usePath} from '../routing'
import InquiryModal from './InquiryModal'
import '../nav-accessibility.css'
import './site-header.css'

const focusableSelector='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
/** Desktop navigation is shown from this width; below it the full-screen menu is used. */
const DESKTOP_QUERY='(min-width: 1100px)'

type Layer='menu'|'search'|'cart'

const navItems=[
  {label:'Shop',to:'/shop',matches:(path:string)=>path==='/shop'||path.startsWith('/product/')},
  {label:'Custom gear',to:'/customize',matches:(path:string)=>path==='/customize'},
  {label:'Academy collections',to:'/academy',matches:(path:string)=>path==='/academy'},
  {label:'Private label',to:'/private-label',matches:(path:string)=>path==='/private-label'||path==='/sample-kit'},
  {label:'Our process',to:'/process',matches:(path:string)=>path==='/process'||path==='/track'},
  {label:'About',to:'/about',matches:(path:string)=>path==='/about'},
]

const menuExtras=[
  {label:'Client work',to:'/selected-fightwear'},
  {label:'Sample kit',to:'/sample-kit'},
  {label:'Track an order',to:'/track'},
  {label:'Contact',to:'/request-mockup?intent=contact'},
]

/** Pages whose top section is light; everything else starts with a dark hero. */
const isLightPage=(path:string)=>path==='/'||path==='/shop'||path.startsWith('/product/')||path==='/customize'

export default function Nav(){
  const path=usePath().split('?')[0]
  const[activeLayer,setActiveLayer]=useState<Layer|null>(null)
  const[scrolled,setScrolled]=useState(false)
  const[items,setItems]=useState<CartItem[]>(()=>getCart())
  const[mockupOpen,setMockupOpen]=useState(false)
  const menuTrigger=useRef<HTMLButtonElement>(null)
  const searchTrigger=useRef<HTMLButtonElement>(null)
  const cartTrigger=useRef<HTMLButtonElement>(null)
  const mobileNav=useRef<HTMLDivElement>(null)
  const searchDialog=useRef<HTMLDivElement>(null)
  const cartDialog=useRef<HTMLDivElement>(null)
  const returnFocus=useRef<HTMLElement|null>(null)

  useEffect(()=>{
    const onScroll=()=>setScrolled(scrollY>24)
    const syncCart=()=>setItems(getCart())
    const openBrief=()=>setMockupOpen(true)
    onScroll()
    addEventListener('scroll',onScroll,{passive:true})
    addEventListener('skawa-cart',syncCart)
    addEventListener('skawa-open-brief',openBrief)
    return()=>{
      removeEventListener('scroll',onScroll)
      removeEventListener('skawa-cart',syncCart)
      removeEventListener('skawa-open-brief',openBrief)
    }
  },[])

  const open=activeLayer==='menu'
  const searchOpen=activeLayer==='search'
  const cartOpen=activeLayer==='cart'

  const restoreFocus=()=>{
    const target=returnFocus.current
    returnFocus.current=null
    requestAnimationFrame(()=>{
      if(target?.isConnected&&target.getClientRects().length)target.focus()
      else menuTrigger.current?.focus()
    })
  }

  const closeLayer=(restore=true)=>{
    setActiveLayer(null)
    if(restore)restoreFocus()
    else returnFocus.current=null
  }

  const openLayer=(layer:Layer,trigger:HTMLElement|null)=>{
    returnFocus.current=trigger||(document.activeElement instanceof HTMLElement?document.activeElement:null)
    setActiveLayer(layer)
  }

  useEffect(()=>{
    if(!activeLayer)return
    const container=activeLayer==='menu'?mobileNav.current:activeLayer==='search'?searchDialog.current:cartDialog.current
    if(!container)return
    const root=document.documentElement
    const body=document.body
    const previousOverflow=body.style.overflow
    root.classList.add('nav-layer-open')
    body.classList.add('nav-layer-open')
    body.style.overflow='hidden'

    const focusables=()=>{
      const available=Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(element=>element.getClientRects().length>0&&element.getAttribute('aria-hidden')!=='true')
      if(activeLayer==='menu'&&menuTrigger.current?.getClientRects().length)available.push(menuTrigger.current)
      return available
    }
    const focusFrame=requestAnimationFrame(()=>{
      const preferred=container.querySelector<HTMLElement>('[data-initial-focus]')
      ;(preferred||focusables()[0]||container).focus()
    })
    const onKeyDown=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){
        event.preventDefault()
        closeLayer()
        return
      }
      if(event.key!=='Tab')return
      const available=focusables()
      if(!available.length){event.preventDefault();container.focus();return}
      const first=available[0]
      const last=available[available.length-1]
      const current=document.activeElement instanceof HTMLElement?document.activeElement:null
      if(event.shiftKey&&(current===first||!current||!available.includes(current))){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&(current===last||!current||!available.includes(current))){event.preventDefault();first.focus()}
    }
    addEventListener('keydown',onKeyDown)
    return()=>{
      cancelAnimationFrame(focusFrame)
      body.style.overflow=previousOverflow
      root.classList.remove('nav-layer-open')
      body.classList.remove('nav-layer-open')
      removeEventListener('keydown',onKeyDown)
    }
  },[activeLayer])

  useEffect(()=>{
    const wide=matchMedia(DESKTOP_QUERY)
    const closeDesktopMenu=()=>{
      if(!wide.matches)return
      setActiveLayer(layer=>layer==='menu'?null:layer)
      returnFocus.current=null
    }
    wide.addEventListener('change',closeDesktopMenu)
    return()=>wide.removeEventListener('change',closeDesktopMenu)
  },[])

  const count=items.reduce((sum,item)=>sum+item.quantity,0)
  const remove=(index:number)=>setCart(items.filter((_,i)=>i!==index))
  const closeForNavigation=()=>closeLayer(false)
  const search=(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault()
    const data=new FormData(event.currentTarget)
    const query=String(data.get('search')||'').trim()
    closeForNavigation()
    go(`/shop${query?`?search=${encodeURIComponent(query)}`:''}`)
  }
  const skipToContent=(event:ReactMouseEvent<HTMLAnchorElement>)=>{
    event.preventDefault()
    const main=document.querySelector<HTMLElement>('main')
    if(!main)return
    if(!main.hasAttribute('tabindex'))main.tabIndex=-1
    main.focus({preventScroll:true})
    main.scrollIntoView({block:'start'})
  }
  const tone=scrolled||open||isLightPage(path)?'light':'dark'

  return <>
    <a className="skip-link" href="#main-content" onClick={skipToContent}>SKIP TO MAIN CONTENT</a>
    <header className={`site-header site-header--${tone}${scrolled?' is-scrolled':''}${open?' is-menu-open':''}`}>
      <div className="site-header__bar">
        <Link className="site-header__logo" to="/" aria-label="SKAWA Fight home" aria-current={path==='/'?'page':undefined} onClick={closeForNavigation}>
          <img className="site-header__logo-img site-header__logo-img--dark" src="/images/brand/skawa-logo-dark.png" alt="" width={160} height={41} decoding="async"/>
          <img className="site-header__logo-img site-header__logo-img--light" src="/images/brand/skawa-logo-light.png" alt="" width={160} height={41} decoding="async"/>
        </Link>

        <nav className="site-header__nav" aria-label="Main navigation">
          <ul>
            {navItems.map(item=><li key={item.to}>
              <Link to={item.to} className={item.matches(path)?'is-active':''} aria-current={item.matches(path)?'page':undefined}>{item.label}</Link>
            </li>)}
          </ul>
        </nav>

        <div className="site-header__actions">
          <button ref={searchTrigger} type="button" className="site-header__icon" onClick={()=>openLayer('search',searchTrigger.current)} aria-label="Search" aria-haspopup="dialog" aria-expanded={searchOpen} aria-controls={searchOpen?'site-search-dialog':undefined}><Search aria-hidden="true"/></button>
          <Link className="site-header__icon site-header__icon--account" to="/account" aria-label="Project hub" aria-current={path==='/account'?'page':undefined}><UserRound aria-hidden="true"/></Link>
          <button ref={cartTrigger} type="button" className="site-header__icon site-header__icon--cart" onClick={()=>openLayer('cart',cartTrigger.current)} aria-label={`Shopping bag with ${count} ${count===1?'item':'items'}`} aria-haspopup="dialog" aria-expanded={cartOpen} aria-controls={cartOpen?'shopping-bag-dialog':undefined}><ShoppingBag aria-hidden="true"/>{count>0&&<i aria-hidden="true">{count}</i>}</button>
          <Link className="site-header__cta" to="/request-mockup?intent=get_started">Get started<ArrowRight aria-hidden="true"/></Link>
          <button ref={menuTrigger} type="button" className="site-header__icon site-header__menu" onClick={()=>open?closeLayer():openLayer('menu',menuTrigger.current)} aria-expanded={open} aria-controls="site-menu" aria-label={open?'Close menu':'Open menu'}>{open?<X aria-hidden="true"/>:<Menu aria-hidden="true"/>}</button>
        </div>
      </div>

      <div ref={mobileNav} id="site-menu" className={`site-menu${open?' is-open':''}`} role="dialog" aria-modal="true" aria-label="Site menu" hidden={!open} tabIndex={-1}>
        <nav aria-label="Menu">
          <ol className="site-menu__primary">
            {navItems.map((item,index)=><li key={item.to} style={{'--i':index} as CSSProperties}>
              <Link to={item.to} onClick={closeForNavigation} className={item.matches(path)?'is-active':''} aria-current={item.matches(path)?'page':undefined}>
                <span>{String(index+1).padStart(2,'0')}</span>{item.label}<ArrowRight aria-hidden="true"/>
              </Link>
            </li>)}
          </ol>
          <ul className="site-menu__secondary">
            {menuExtras.map(item=><li key={item.to}><Link to={item.to} onClick={closeForNavigation}>{item.label}</Link></li>)}
          </ul>
        </nav>
        <div className="site-menu__footer">
          <div className="site-menu__utility">
            <Link to="/account" onClick={closeForNavigation}><UserRound aria-hidden="true"/>Project hub</Link>
            <button type="button" onClick={()=>openLayer('cart',menuTrigger.current)} aria-haspopup="dialog"><ShoppingBag aria-hidden="true"/>Bag{count?` · ${count}`:''}</button>
          </div>
          <Link className="site-menu__cta" to="/request-mockup?intent=get_started" onClick={closeForNavigation}>Get started<ArrowRight aria-hidden="true"/></Link>
          <p>Custom gear for a stronger tomorrow.</p>
        </div>
      </div>
    </header>

    {searchOpen&&<div ref={searchDialog} id="site-search-dialog" className="search-overlay nav-search-dialog" role="dialog" aria-modal="true" aria-labelledby="site-search-title" tabIndex={-1}>
      <button type="button" className="overlay-close" onClick={()=>closeLayer()} aria-label="Close search"><X/></button>
      <form onSubmit={search} role="search">
        <label id="site-search-title" htmlFor="site-search">WHAT ARE YOU LOOKING FOR?</label>
        <div><input data-initial-focus id="site-search" name="search" type="search" enterKeyHint="search" autoComplete="off" placeholder="RASH GUARDS, BJJ GIS, TEAMWEAR..."/><button type="submit" aria-label="Submit search"><ArrowRight/></button></div>
      </form>
    </div>}

    {cartOpen&&<>
      <div ref={cartDialog} id="shopping-bag-dialog" className="cart-drawer nav-cart-drawer open" role="dialog" aria-modal="true" aria-labelledby="shopping-bag-title" tabIndex={-1}>
        <div className="drawer-head"><div><small>YOUR BAG</small><h2 id="shopping-bag-title" aria-live="polite">{count} {count===1?'ITEM':'ITEMS'}</h2></div><button type="button" data-initial-focus onClick={()=>closeLayer()} aria-label="Close shopping bag"><X/></button></div>
        <div className="drawer-items">{items.length===0?<div className="empty-bag"><ShoppingBag aria-hidden="true"/><h3>YOUR CORNER IS EMPTY.</h3><p>Start with performance gear or build a custom product.</p><Link className="btn primary" to="/shop" onClick={closeForNavigation}>EXPLORE GEAR</Link></div>:items.map((item,index)=><article key={`${item.id}-${item.color}-${item.size}`}><div className="bag-thumb" style={{background:item.color}} aria-hidden="true"/><div><h3>{item.name}</h3><p>SIZE {item.size} · QTY {item.quantity}</p><b>{item.price}</b></div><button type="button" onClick={()=>remove(index)} aria-label={`Remove ${item.name}`}><Trash2/></button></article>)}</div>
        {items.length>0&&<div className="drawer-foot"><p>Shipping and customization are confirmed during the quote or checkout flow.</p><Link className="btn primary" to="/request-mockup" onClick={closeForNavigation}>CONTINUE REQUEST <ArrowRight/></Link></div>}
      </div>
      <button type="button" className="drawer-backdrop nav-cart-backdrop" aria-label="Close shopping bag" onClick={()=>closeLayer()} tabIndex={-1}/>
    </>}
    <InquiryModal open={mockupOpen} onClose={()=>setMockupOpen(false)}/>
  </>
}
