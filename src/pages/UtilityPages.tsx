import {ArrowRight,Check,Factory,Layers3,ShieldCheck,ShoppingBag,Sparkles,Users,UserRound} from 'lucide-react'
import {useEffect,useMemo,useRef,type RefObject} from 'react'
import {getCart} from '../cart'
import {Link} from '../routing'
import {PageFrame} from './Pages'
import '../utility.css'
import './about.css'

type SavedDesign={id?:string;color?:string;material?:string;print?:string;text?:string;savedAt?:string}
type SavedBrief={id?:string;route?:string;business?:string;createdAt?:string}

function readLocal<T>(key:string,fallback:T):T{
  try{return JSON.parse(localStorage.getItem(key)||'') as T}catch{return fallback}
}

const METRICS=[
  {value:'30+',label:'YEARS MANUFACTURING'},
  {value:'CUSTOM',label:'BRAND & ACADEMY GEAR'},
  {value:'BJJ · MMA',label:'BOXING & COMBAT SPORTS'},
  {value:'GLOBAL',label:'PRODUCTION & SHIPPING'},
] as const

const STORY_POINTS=[
  {num:'01',title:'OUR EXPERTISE',copy:'Martial-arts experience meets production craftsmanship. Proven construction and modern materials engineered for comfort, durability and movement.'},
  {num:'02',title:'WHAT WE MAKE',copy:'Custom BJJ gis, rash guards, fight shorts, boxing gloves, apparel and full combat kits for academies, private-label brands and athlete programs.'},
] as const

const PRODUCT_CHIPS=['BJJ GIS','RASH GUARDS','FIGHT SHORTS','BOXING GLOVES','APPAREL','TEAM KITS'] as const

const DISCIPLINES=[
  {
    num:'01',
    title:'DESIGN',
    copy:'Color systems, artwork zones, logos and production-ready proofs shaped around your identity.',
    image:'/images/shorts-gold.webp',
    alt:'Custom fight shorts concept',
    to:'/customize',
    cta:'OPEN DESIGN LAB',
  },
  {
    num:'02',
    title:'MANUFACTURE',
    copy:'Sampling through construction, decoration and final inspection — efficient without cutting corners.',
    image:'/images/private-label.webp',
    alt:'Garment construction detail',
    to:'/process',
    cta:'SEE THE PROCESS',
  },
  {
    num:'03',
    title:'FULFILL',
    copy:'Approved packing, clear reorder paths and worldwide shipping readiness for academies and brands.',
    image:'/images/academy-team.webp',
    alt:'Academy team in coordinated kit',
    to:'/request-mockup',
    cta:'START A BRIEF',
  },
] as const

const CUSTOM_POINTS=[
  'Fabric, cut, color and logo systems to match your mark',
  'Academy kits and private-label collections',
  'Production-ready proofs before manufacturing',
] as const

const QUALITY_POINTS=[
  'Reinforced construction for training and competition',
  'Performance fabrics with ergonomic mobility',
  'Inspection from materials through final check',
] as const

const VALUES=[
  {Icon:ShieldCheck,title:'INTEGRITY',copy:'Honest specs, clear timelines and transparent production decisions — relationships built on trust.'},
  {Icon:Sparkles,title:'INNOVATION',copy:'Modern construction, fabrics and decoration methods that keep gear competitive on and off the mat.'},
  {Icon:Factory,title:'EXCELLENCE',copy:'Materials, craftsmanship and finishing held to the same standard from sample through reorder.'},
  {Icon:Users,title:'COMMUNITY',copy:'Support for athletes, academies and emerging brands that grow the BJJ, MMA and boxing world.'},
] as const

function useAboutReveals(root:RefObject<HTMLElement|null>){
  useEffect(()=>{
    const node=root.current
    if(!node)return
    const items=[...node.querySelectorAll<HTMLElement>('.about-reveal')]
    if(!items.length)return
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      items.forEach(el=>el.classList.add('is-in'))
      return
    }
    const io=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(entry.isIntersecting){
          entry.target.classList.add('is-in')
          io.unobserve(entry.target)
        }
      }
    },{rootMargin:'0px 0px -8% 0px',threshold:.12})
    items.forEach(el=>io.observe(el))
    return ()=>io.disconnect()
  },[root])
}

export function AboutPage(){
  const pageRef=useRef<HTMLElement>(null)
  useAboutReveals(pageRef)

  return <PageFrame><main className="about-page" ref={pageRef}>
    <section className="about-hero" aria-labelledby="about-hero-title">
      <div className="about-hero__media" aria-hidden="true">
        <img src="/images/hero-fighter.webp" alt=""/>
        <div className="about-hero__shade"/>
      </div>
      <div className="about-hero__copy">
        <span className="about-eyebrow">EST. · CUSTOM FIGHTWEAR · WORLDWIDE</span>
        <h1 id="about-hero-title">THREE DECADES.<br/>ONE STANDARD.<br/><em>FIGHT.</em></h1>
        <p className="about-hero__lede">Premium custom BJJ gis, rash guards, shorts, boxing gloves and combat apparel — built for brands, academies and athletes who need gear that performs.</p>
        <div className="about-hero__actions">
          <Link className="ref-btn red" to="/request-mockup?intent=about-hero">START A PROJECT</Link>
          <Link className="ref-btn outline" to="/process">SEE HOW WE WORK</Link>
        </div>
      </div>
      <div className="about-hero__metrics" aria-label="SKAWA at a glance">
        {METRICS.map(item=>(
          <article key={item.label}>
            <b>{item.value.includes('+')?<>{item.value.replace('+','')}<em>+</em></>:item.value}</b>
            <span>{item.label}</span>
          </article>
        ))}
      </div>
    </section>

    <section className="about-story" aria-labelledby="story-title">
      <div className="about-story__layout">
        <div className="about-story__copy about-reveal">
          <span className="about-eyebrow">WHO WE ARE</span>
          <h2 id="story-title">MORE THAN A LABEL.<br/>A MANUFACTURING PARTNER.</h2>
          <p>SKAWA Fight connects design, manufacturing and fulfillment so your team kit or brand line moves from brief to mat without losing quality or identity.</p>
          <div className="about-story__points">
            {STORY_POINTS.map((point,i)=>(
              <article key={point.num} className="about-reveal" data-delay={String(i+1)}>
                <b>{point.num}</b>
                <div>
                  <h3>{point.title}</h3>
                  <p>{point.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="about-story__visual about-reveal" data-delay="2">
          <img src="/images/shop-hero-fighter.png" alt="Athlete in SKAWA performance fightwear" loading="lazy"/>
          <div className="about-story__visual-shade"/>
          <div className="about-story__chips" aria-label="Product categories">
            {PRODUCT_CHIPS.map(chip=><span key={chip}>{chip}</span>)}
          </div>
        </div>
      </div>
    </section>

    <section className="about-disciplines" aria-labelledby="discipline-title">
      <header className="about-section__head about-reveal">
        <div>
          <span className="about-eyebrow">THE OPERATING MODEL</span>
          <h2 id="discipline-title">ONE PARTNER.<br/>THREE DISCIPLINES.</h2>
        </div>
        <p>Design, manufacture and fulfillment under one roof — from first proof to reorder.</p>
      </header>
      <div className="about-discipline-panels about-reveal" data-delay="1">
        {DISCIPLINES.map(item=>(
          <article key={item.num} tabIndex={0}>
            <img src={item.image} alt={item.alt} loading="lazy"/>
            <div className="about-discipline-shade"/>
            <div className="about-discipline-copy">
              <b>{item.num}</b>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
              <Link to={item.to}>{item.cta} <ArrowRight/></Link>
            </div>
          </article>
        ))}
      </div>
    </section>

    <div className="about-features">
      <section className="about-feature" aria-labelledby="custom-title">
        <div className="about-feature__body about-reveal">
          <span className="about-eyebrow">CUSTOMIZATION</span>
          <h2 id="custom-title">TAILORED TO<br/>YOUR IDENTITY.</h2>
          <p>Every brand and academy has its own mark. We build gear that carries it — from fabric and cut to logos, colors and finishing.</p>
          <ul className="about-feature__list">
            {CUSTOM_POINTS.map(point=><li key={point}><Check aria-hidden="true"/><span>{point}</span></li>)}
          </ul>
          <div className="about-feature__actions">
            <Link className="ref-btn red" to="/customize">OPEN DESIGN LAB</Link>
            <Link className="ref-btn outline" to="/private-label">PRIVATE LABEL</Link>
          </div>
        </div>
        <div className="about-feature__media about-reveal" data-delay="1">
          <img src="/images/shorts-camo.webp" alt="Custom fight shorts with branded pattern" loading="lazy"/>
          <div className="about-feature__badge"><b>YOUR MARK</b><span>DESIGN → SAMPLE → PRODUCE</span></div>
        </div>
      </section>

      <section className="about-feature about-feature--flip" aria-labelledby="quality-title">
        <div className="about-feature__body about-reveal">
          <span className="about-eyebrow">COMMITMENT TO QUALITY</span>
          <h2 id="quality-title">BUILT LIKE<br/>IT MATTERS.</h2>
          <p>Quality is the standard, not a checkpoint. Materials, construction and finishing are held to the same bar from first sample to reorder.</p>
          <ul className="about-feature__list">
            {QUALITY_POINTS.map(point=><li key={point}><Check aria-hidden="true"/><span>{point}</span></li>)}
          </ul>
          <div className="about-feature__actions">
            <Link className="ref-btn outline" to="/process">EXPLORE THE PROCESS</Link>
            <Link className="ref-btn red" to="/sample-kit">REQUEST SAMPLES</Link>
          </div>
        </div>
        <div className="about-feature__media about-reveal" data-delay="1">
          <img src="/images/private-label.webp" alt="Close-up of technical garment construction" loading="lazy"/>
          <div className="about-feature__badge"><b>QC FIRST</b><span>SPEC · BUILD · INSPECT</span></div>
        </div>
      </section>
    </div>

    <section className="about-values" aria-labelledby="values-title">
      <header className="about-section__head about-reveal">
        <div>
          <span className="about-eyebrow">OUR VALUES</span>
          <h2 id="values-title">HOW WE WORK.</h2>
        </div>
        <p>Integrity, innovation, excellence and community — the principles behind every brief we take on.</p>
      </header>
      <div className="about-values__grid">
        {VALUES.map((value,index)=>{
          const Icon=value.Icon
          return (
            <article key={value.title} className="about-reveal" data-delay={String((index%4)+1)}>
              <Icon aria-hidden="true"/>
              <b>{String(index+1).padStart(2,'0')}</b>
              <h3>{value.title}</h3>
              <p>{value.copy}</p>
            </article>
          )
        })}
      </div>
    </section>

    <section className="about-finale" aria-labelledby="partner-title">
      <div className="about-finale__media" aria-hidden="true">
        <img src="/images/academy-team.webp" alt="" loading="lazy"/>
        <div className="about-finale__shade"/>
      </div>
      <div className="about-finale__content about-reveal">
        <span className="about-eyebrow">PARTNER WITH SKAWA</span>
        <h2 id="partner-title">BRING YOUR VISION<br/><em>TO THE MAT.</em></h2>
        <p>Three decades of custom fightwear expertise behind every brief. Academy kits, athlete lines or private-label manufacturing — design through delivery.</p>
        <div className="about-finale__actions">
          <Link className="ref-btn red" to="/request-mockup?intent=about-partner">START A PROJECT</Link>
          <Link className="ref-btn outline" to="/academy">GYM & ACADEMY</Link>
        </div>
      </div>
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
