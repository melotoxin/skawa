import {ArrowRight,Menu,Search,ShoppingBag,Trash2,UserRound,X} from 'lucide-react'
import {useEffect,useRef,useState,type FormEvent,type MouseEvent as ReactMouseEvent} from 'react'
import {getCart,setCart,type CartItem} from '../cart'
import {Link,go,usePath} from '../routing'
import '../nav-accessibility.css'

const focusableSelector='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

type Layer='menu'|'search'|'cart'

const navItems=[
  {label:'Shop',to:'/shop',matches:(path:string)=>path==='/shop'||path.startsWith('/product/')||path==='/selected-fightwear'||path==='/work'},
  {label:'Customize',to:'/customize',matches:(path:string)=>path==='/customize'},
  {label:'Gym & Academy',to:'/academy',matches:(path:string)=>path==='/academy'},
  {label:'Private Label',to:'/private-label',matches:(path:string)=>path==='/private-label'||path==='/sample-kit'},
  {label:'Our Process',to:'/process',matches:(path:string)=>path==='/process'||path==='/track'},
  {label:'About',to:'/about',matches:(path:string)=>path==='/about'},
]

export default function Nav(){
  const path=usePath().split('?')[0]
  const[activeLayer,setActiveLayer]=useState<Layer|null>(null)
  const[scrolled,setScrolled]=useState(false)
  const[items,setItems]=useState<CartItem[]>(()=>getCart())
  const menuTrigger=useRef<HTMLButtonElement>(null)
  const searchTrigger=useRef<HTMLButtonElement>(null)
  const cartTrigger=useRef<HTMLButtonElement>(null)
  const mobileNav=useRef<HTMLElement>(null)
  const searchDialog=useRef<HTMLDivElement>(null)
  const cartDialog=useRef<HTMLDivElement>(null)
  const returnFocus=useRef<HTMLElement|null>(null)

  useEffect(()=>{
    const onScroll=()=>setScrolled(scrollY>30)
    const syncCart=()=>setItems(getCart())
    onScroll()
    addEventListener('scroll',onScroll)
    addEventListener('skawa-cart',syncCart)
    return()=>{
      removeEventListener('scroll',onScroll)
      removeEventListener('skawa-cart',syncCart)
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
    const wide=matchMedia('(min-width: 981px)')
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
  const lightPage=path==='/shop'||path.startsWith('/product/')||path==='/customize'

  return <>
    <a className="skip-link" href="#main-content" onClick={skipToContent}>SKIP TO MAIN CONTENT</a>
    <header className={`nav ${scrolled?'scrolled':''} ${lightPage&&!scrolled?'light-nav':''} ${open?'menu-open':''}`}>
      <Link className="logo" to="/" aria-label="SKAWA Fight home" aria-current={path==='/'?'page':undefined}><span>SKAWA</span><b>FIGHT</b></Link>
      <nav ref={mobileNav} id="primary-navigation" className={open?'open':''} aria-label="Main navigation" tabIndex={open?-1:undefined}>
        <div className="mobile-nav-heading" aria-hidden="true"><span>MENU</span><b>FIND YOUR CORNER.</b></div>
        {navItems.map(item=><Link
          key={item.to}
          to={item.to}
          onClick={closeForNavigation}
          className={item.matches(path)?'active':''}
          aria-current={item.matches(path)?'page':undefined}
        >{item.label}</Link>)}
        <div className="mobile-nav-actions" role="group" aria-label="Account and shopping bag">
          <Link to="/account" onClick={closeForNavigation} aria-current={path==='/account'?'page':undefined}><UserRound/><span>PROJECT HUB</span></Link>
          <button type="button" onClick={()=>openLayer('cart',menuTrigger.current)} aria-haspopup="dialog"><ShoppingBag/><span>SHOPPING BAG{count?` · ${count}`:''}</span></button>
        </div>
      </nav>
      <div className="nav-actions">
        <button ref={searchTrigger} type="button" className="search-toggle" onClick={()=>openLayer('search',searchTrigger.current)} aria-label="Search" aria-haspopup="dialog" aria-expanded={searchOpen} aria-controls={searchOpen?'site-search-dialog':undefined}><Search/></button>
        <Link className="account-toggle" to="/account" aria-label="Open project hub" aria-current={path==='/account'?'page':undefined}><UserRound/></Link>
        <button ref={cartTrigger} type="button" className="cart-toggle" onClick={()=>openLayer('cart',cartTrigger.current)} aria-label={`Shopping bag with ${count} ${count===1?'item':'items'}`} aria-haspopup="dialog" aria-expanded={cartOpen} aria-controls={cartOpen?'shopping-bag-dialog':undefined}><ShoppingBag/>{count>0&&<i aria-hidden="true">{count}</i>}</button>
        <button ref={menuTrigger} type="button" className="menu" onClick={()=>open?closeLayer():openLayer('menu',menuTrigger.current)} aria-expanded={open} aria-controls="primary-navigation" aria-label={open?'Close menu':'Open menu'}>{open?<X/>:<Menu/>}</button>
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
  </>
}
