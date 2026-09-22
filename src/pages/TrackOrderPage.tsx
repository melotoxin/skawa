import {useState,type FormEvent} from 'react'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  Headphones,
  Layers3,
  Mail,
  MapPin,
  Package,
  PackageCheck,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  type LucideIcon,
} from 'lucide-react'
import {PageFrame} from './Pages'
import {Link} from '../routing'
import '../track-order.css'

export const DEMO_ORDER_REFERENCE = 'SF-2026-0148'

type TrackingStage = {
  label:string
  detail:string
  date:string
  icon:LucideIcon
}

const stages:TrackingStage[] = [
  {label:'ORDER CONFIRMED',detail:'Brief, quantity and order details locked',date:'SEP 01',icon:ClipboardCheck},
  {label:'ARTWORK APPROVED',detail:'Production artwork approved',date:'SEP 04',icon:FileCheck2},
  {label:'MATERIALS PREPARING',detail:'Fabric and trims allocated',date:'SEP 07',icon:Layers3},
  {label:'MANUFACTURING',detail:'Cutting and construction underway',date:'IN PROGRESS',icon:PackageCheck},
  {label:'PRINTING',detail:'Approved graphics applied to panels',date:'NEXT',icon:Sparkles},
  {label:'QUALITY CONTROL',detail:'Construction and artwork inspected',date:'EST. SEP 24',icon:ShieldCheck},
  {label:'PACKING',detail:'Finished units counted and packed',date:'EST. SEP 25',icon:Package},
  {label:'SHIPPING',detail:'Carrier collection and tracking',date:'EST. SEP 26',icon:Truck},
  {label:'DELIVERED',detail:'Order arrives at your door',date:'EST. SEP 30',icon:CheckCircle2},
]

const currentStage = 3

function cleanReference(value:string){
  return value.trim().toUpperCase().replace(/\s+/g,'')
}

export default function TrackOrderPage(){
  const[reference,setReference]=useState(()=>new URLSearchParams(window.location.search).get('order')||'')
  const[visibleReference,setVisibleReference]=useState('')
  const[error,setError]=useState('')

  const findOrder=(value:string)=>{
    const normalized=cleanReference(value)
    setReference(normalized)
    if(!normalized){
      setVisibleReference('')
      setError('Enter an order reference to continue.')
      return
    }
    if(normalized!==DEMO_ORDER_REFERENCE){
      setVisibleReference('')
      setError(`We could not find ${normalized}. Check the reference or open the demo order below.`)
      return
    }
    setError('')
    setVisibleReference(normalized)
    requestAnimationFrame(()=>document.querySelector('#order-status')?.scrollIntoView({behavior:'smooth',block:'start'}))
  }

  const submit=(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault()
    findOrder(reference)
  }

  const openDemo=()=>findOrder(DEMO_ORDER_REFERENCE)

  return <PageFrame>
    <main className="order-tracking-page">
      <section className="order-tracking-hero" aria-labelledby="tracking-title">
        <div className="order-tracking-hero-copy">
          <div className="order-tracking-kicker"><span/> ORDER VISIBILITY / 03</div>
          <h1 id="tracking-title">EVERY STEP.<br/><em>IN YOUR CORNER.</em></h1>
          <p>Follow your custom fightwear from approved artwork to final delivery. One reference keeps your whole production journey in view.</p>
        </div>
        <div className="order-tracking-hero-status" aria-hidden="true">
          <span>LIVE PRODUCTION FLOW</span>
          <strong>09</strong>
          <small>TRACKED MILESTONES</small>
        </div>
      </section>

      <section className="order-lookup" aria-labelledby="lookup-title">
        <div className="order-lookup-copy">
          <div className="order-tracking-kicker dark"><span/> FIND YOUR ORDER</div>
          <h2 id="lookup-title">ENTER YOUR<br/>REFERENCE.</h2>
          <p>Your order reference appears in your confirmation email and usually starts with <b>SF-</b>.</p>
        </div>
        <form className="order-lookup-form" onSubmit={submit} noValidate>
          <label htmlFor="tracking-reference">ORDER OR TRACKING REFERENCE</label>
          <div className={`order-lookup-control ${error?'has-error':''}`}>
            <Search aria-hidden="true"/>
            <input
              id="tracking-reference"
              value={reference}
              onChange={event=>{setReference(event.target.value);if(error)setError('')}}
              placeholder="SF-2026-0148"
              autoComplete="off"
              spellCheck={false}
              aria-describedby="tracking-help tracking-feedback"
              aria-invalid={Boolean(error)}
            />
            <button type="submit">TRACK ORDER <ArrowRight aria-hidden="true"/></button>
          </div>
          <div className="order-lookup-meta">
            <p id="tracking-help">This prototype uses a clearly marked sample order.</p>
            <button type="button" onClick={openDemo}>OPEN DEMO · {DEMO_ORDER_REFERENCE}</button>
          </div>
          <p id="tracking-feedback" className="order-lookup-feedback" role={error?'alert':'status'} aria-live="polite">{error}</p>
        </form>
      </section>

      {visibleReference&&<section id="order-status" className="order-status" aria-labelledby="order-status-title">
        <div className="order-status-head">
          <div>
            <span className="demo-chip">DEMO ORDER</span>
            <p>ORDER REFERENCE</p>
            <h2 id="order-status-title">{visibleReference}</h2>
          </div>
          <div className="order-status-state">
            <i><PackageCheck aria-hidden="true"/></i>
            <span><small>CURRENT STATUS</small><b>MANUFACTURING</b></span>
          </div>
          <div className="order-status-estimate">
            <small>ESTIMATED DELIVERY</small>
            <b>SEP 30, 2026</b>
            <span>Demo date · subject to final carrier service</span>
          </div>
        </div>

        <div className="order-progress-summary">
          <div>
            <span>PRODUCTION PROGRESS</span>
            <b>{currentStage+1} OF {stages.length} MILESTONES</b>
          </div>
          <div className="order-progress-bar" role="progressbar" aria-label="Order production progress" aria-valuemin={1} aria-valuemax={stages.length} aria-valuenow={currentStage+1}>
            <i style={{width:`${((currentStage+1)/stages.length)*100}%`}}/>
          </div>
        </div>

        <ol className="order-timeline" aria-label="Order milestones">
          {stages.map((stage,index)=>{
            const Icon=stage.icon
            const state=index<currentStage?'complete':index===currentStage?'current':'upcoming'
            return <li className={state} key={stage.label} aria-current={state==='current'?'step':undefined}>
              <div className="order-stage-marker"><Icon aria-hidden="true"/>{state==='complete'&&<Check className="order-stage-check" aria-hidden="true"/>}</div>
              <div className="order-stage-copy">
                <span>0{index+1}</span>
                <h3>{stage.label}</h3>
                <p>{stage.detail}</p>
                <small>{stage.date}</small>
              </div>
            </li>
          })}
        </ol>

        <div className="order-detail-grid">
          <article className="order-product-card">
            <div className="order-panel-label"><Package aria-hidden="true"/> ORDER SUMMARY</div>
            <div className="order-product-body">
              <div className="order-product-image"><img src="/images/shorts-red.webp" alt="Black and red Shadow Series fight shorts"/></div>
              <div>
                <small>CUSTOM FIGHTWEAR</small>
                <h3>SHADOW SERIES<br/>ACADEMY SHORTS</h3>
                <dl>
                  <div><dt>Quantity</dt><dd>24 units</dd></div>
                  <div><dt>Colorway</dt><dd>Black / Fight Red</dd></div>
                  <div><dt>Decoration</dt><dd>Sublimation</dd></div>
                  <div><dt>Order type</dt><dd>Academy program</dd></div>
                </dl>
              </div>
            </div>
          </article>

          <article className="order-shipment-card">
            <div className="order-panel-label"><Truck aria-hidden="true"/> SHIPMENT</div>
            <div className="order-shipment-state"><Clock3 aria-hidden="true"/><span><small>TRACKING NUMBER</small><b>ASSIGNED AFTER DISPATCH</b></span></div>
            <dl>
              <div><dt><MapPin aria-hidden="true"/> Destination</dt><dd>Lahore, Pakistan</dd></div>
              <div><dt><PackageCheck aria-hidden="true"/> Current station</dt><dd>Production floor</dd></div>
              <div><dt><Truck aria-hidden="true"/> Shipping method</dt><dd>Confirmed at dispatch</dd></div>
            </dl>
            <p>Carrier details appear here once your order passes quality control and leaves the facility.</p>
          </article>

          <aside className="order-help-card" aria-labelledby="order-help-title">
            <Headphones aria-hidden="true"/>
            <small>NEED A CORNER TEAM?</small>
            <h3 id="order-help-title">WE’RE HERE<br/>BETWEEN ROUNDS.</h3>
            <p>Have a deadline, artwork question, or delivery concern? Send the order reference with your message so support can help faster.</p>
            <Link to="/request-mockup?intent=order-support">MESSAGE ORDER SUPPORT <Mail aria-hidden="true"/></Link>
          </aside>
        </div>

        <p className="order-demo-note"><b>DEMO DATA:</b> This page does not expose a real customer order. Connect authenticated order records and verified shipment data before launch.</p>
      </section>}

      {!visibleReference&&<section className="order-tracking-promise" aria-label="Tracking benefits">
        <span>01 <b>CLEAR MILESTONES</b></span>
        <span>02 <b>PRODUCTION VISIBILITY</b></span>
        <span>03 <b>DELIVERY UPDATES</b></span>
      </section>}
    </main>
  </PageFrame>
}
