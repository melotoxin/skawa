import {ArrowRight,Factory,Globe2,Layers3,PackageCheck,Palette,ShieldCheck,ShoppingBag,UserRound} from 'lucide-react'
import {useMemo} from 'react'
import {getCart} from '../cart'
import {Link} from '../routing'
import {PageFrame} from './Pages'
import '../utility.css'

type SavedDesign={id?:string;color?:string;material?:string;print?:string;text?:string;savedAt?:string}
type SavedBrief={id?:string;route?:string;business?:string;createdAt?:string}

function readLocal<T>(key:string,fallback:T):T{
  try{return JSON.parse(localStorage.getItem(key)||'') as T}catch{return fallback}
}

export function AboutPage(){
  return <PageFrame><main className="about-page">
    <section className="about-hero">
      <img src="/images/hero-fighter.webp" alt="Combat athlete wearing SKAWA-style performance fightwear in an arena"/>
      <div className="about-hero-shade"/>
      <div className="about-hero-copy"><span>DESIGN · MANUFACTURING · FULFILLMENT</span><h1>MORE THAN<br/>A FIGHTWEAR<br/><em>LABEL.</em></h1><p>SKAWA Fight is presented as an end-to-end fightwear platform for athletes, academies and emerging combat-sports brands.</p></div>
    </section>

    <section className="about-capabilities" aria-labelledby="capability-title">
      <header><span>THE OPERATING MODEL</span><h2 id="capability-title">ONE PARTNER.<br/>THREE DISCIPLINES.</h2></header>
      <div>
        <article><Palette/><b>01</b><h3>DESIGN</h3><p>Product direction, color systems, artwork zones and production-ready proofs.</p></article>
        <article><Factory/><b>02</b><h3>MANUFACTURE</h3><p>Material selection, sampling, decoration, construction and quality control.</p></article>
        <article><PackageCheck/><b>03</b><h3>FULFILL</h3><p>Approved packing, order visibility and a repeatable reorder path.</p></article>
      </div>
    </section>

    <section className="about-proof">
      <div><span>QUALITY CONTROL</span><h2>BUILT LIKE<br/>IT MATTERS.</h2><p>Every production-ready program should verify construction, sizing, artwork placement, quantities and packing against an approved specification.</p><Link to="/process">EXPLORE THE PROCESS <ArrowRight/></Link></div>
      <img src="/images/private-label.webp" alt="Close-up of technical garment construction and private-label placement" loading="lazy"/>
    </section>

    <section className="global-reach" aria-labelledby="global-title">
      <Globe2 aria-hidden="true"/><div><span>INTERNATIONAL READINESS</span><h2 id="global-title">WORLDWIDE MANUFACTURING<br/>& SHIPPING.</h2><p>No unverified country count or delivery promise is shown in this frontend. Live destinations, duties and carrier estimates should come from the fulfillment backend.</p></div><Link className="ref-btn red" to="/request-mockup?intent=global-project">START A PROJECT</Link>
    </section>
  </main></PageFrame>
}

export function AccountPage(){
  const designs=useMemo(()=>readLocal<SavedDesign[]>('skawa-designs',[]),[])
  const brief=useMemo(()=>readLocal<SavedBrief|null>('skawa-last-request',null),[])
  const cart=useMemo(()=>getCart(),[])
  const cartCount=cart.reduce((total,item)=>total+item.quantity,0)

  return <PageFrame><main className="account-page">
    <header className="account-hero"><div><span>LOCAL PROJECT HUB</span><h1>YOUR CORNER.<br/><em>YOUR WORK.</em></h1><p>Saved designs and request references on this prototype stay in this browser. Connect authenticated customer accounts before production launch.</p></div><UserRound aria-hidden="true"/></header>

    <section className="account-summary" aria-label="Project summary">
      <article><b>{String(designs.length).padStart(2,'0')}</b><span>SAVED DESIGNS</span></article>
      <article><b>{brief?'01':'00'}</b><span>LOCAL BRIEFS</span></article>
      <article><b>{String(cartCount).padStart(2,'0')}</b><span>BAG ITEMS</span></article>
    </section>

    <section className="account-grid">
      <article className="account-designs"><header><div><span>DESIGN LAB</span><h2>SAVED DESIGNS</h2></div><Link to="/customize">CREATE NEW <ArrowRight/></Link></header>{designs.length?<div className="saved-design-grid">{designs.slice().reverse().map((design,index)=><div key={design.id||index}><i style={{background:design.color||'#111'}}/><small>{design.id||`LOCAL-${index+1}`}</small><h3>{design.text||'CUSTOM FIGHTWEAR'}</h3><p>{design.material||'Material pending'} · {design.print||'Print pending'}</p></div>)}</div>:<div className="account-empty"><Layers3/><h3>NO SAVED DESIGNS YET.</h3><p>Build a fight-short concept and save its local reference.</p><Link className="ref-btn red" to="/customize">OPEN DESIGN LAB</Link></div>}</article>

      <aside className="account-actions"><article><ShieldCheck/><span>ORDER VISIBILITY</span><h2>TRACK PRODUCTION.</h2><p>Use an order reference to open the nine-stage production view.</p><Link to="/track">TRACK AN ORDER <ArrowRight/></Link></article><article><ShoppingBag/><span>CURRENT BAG</span><h2>{cartCount} ITEM{cartCount===1?'':'S'}</h2><p>Product selections stay in this browser until checkout services are connected.</p><Link to="/shop">CONTINUE SHOPPING <ArrowRight/></Link></article></aside>
    </section>

    <section className="account-brief"><div><span>LATEST PROJECT BRIEF</span><h2>{brief?.id||'NO LOCAL BRIEF SAVED'}</h2><p>{brief?.route||'Start the six-step production brief when you are ready.'}</p></div><Link className="ref-btn red" to="/request-mockup">{brief?'START ANOTHER BRIEF':'START A BRIEF'}</Link></section>
  </main></PageFrame>
}
