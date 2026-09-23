import {ArrowLeft,ArrowRight,Check,FileCheck2,FlaskConical,Layers3,ShieldCheck,Sparkles} from 'lucide-react'
import {Link} from '../routing'
import {NotFound,PageFrame} from './Pages'
import '../selected-fightwear.css'

const cases=[
  {
    slug:'academy-identity-system',
    number:'01',
    title:'Academy identity system',
    category:'DEMO ACADEMY COLLECTION',
    image:'/images/ref/client-team-skawa.jpg',
    summary:'A hypothetical collection showing how one visual identity can extend across athlete, coach and supporter products without implying a completed client engagement.',
    deliverables:['Competition fight shorts','Coordinated teamwear direction','Placement and color system'],
    route:['Brief','Digital mockup','Sample review','Team production'],
    facts:{client:'Demo academy concept',sport:'MMA / team training',products:'Fight shorts / teamwear',material:'Production selection pending',method:'Sublimation / placement proof'},
    link:'/academy',
    linkLabel:'EXPLORE ACADEMY PROGRAM',
  },
  {
    slug:'private-label-starter-line',
    number:'02',
    title:'Private-label starter line',
    category:'DEMO BRAND CONCEPT',
    image:'/images/ref/path-private-label.jpg',
    summary:'A non-client example of the decisions behind a focused first collection: product mix, trims, packaging and a repeatable production specification.',
    deliverables:['Three-product capsule direction','Label and packaging touchpoints','Production-ready approval path'],
    route:['Brand brief','Material selection','Prototype','Quality control'],
    facts:{client:'Demo private-label concept',sport:'Multi-discipline',products:'Three-product capsule',material:'Sample review pending',method:'Labels / trims / packaging'},
    link:'/private-label',
    linkLabel:'EXPLORE PRIVATE LABEL',
  },
  {
    slug:'athlete-signature-short',
    number:'03',
    title:'Athlete signature short',
    category:'DEMO PRODUCT CONCEPT',
    image:'/images/ref/cat-fight-shorts.jpg',
    summary:'A clearly marked visual concept demonstrating a custom short route for an individual athlete. The artwork and product are placeholders for later production validation.',
    deliverables:['Color and graphic direction','Name and sponsor zones','Customizer-ready starting point'],
    route:['Select product','Build concept','Approve artwork','Order'],
    facts:{client:'Demo athlete concept',sport:'MMA / Muay Thai',products:'Signature fight short',material:'Micro-stretch direction',method:'Sublimation / sponsor zones'},
    link:'/customize',
    linkLabel:'OPEN DESIGN LAB',
  },
]

export default function SelectedFightwearPage({route='/selected-fightwear'}:{route?:string}){
  const caseSlug=route.split('/')[2]
  if(caseSlug){
    const item=cases.find(entry=>entry.slug===caseSlug)
    if(!item)return <NotFound/>
    return <PageFrame><main className="selected-case-study">
      <header className="selected-case-study-hero">
        <img src={item.image} alt={`Visual placeholder for ${item.title}`}/><div className="selected-fightwear-shade"/>
        <div><Link to="/selected-fightwear"><ArrowLeft/> ALL SELECTED FIGHTWEAR</Link><span>{item.category}</span><h1>{item.title}</h1><p>{item.summary}</p></div>
      </header>
      <section className="selected-case-study-facts" aria-label="Demonstration project facts">
        {Object.entries(item.facts).map(([label,value])=><div key={label}><span>{label.toUpperCase()}</span><b>{value}</b></div>)}
      </section>
      <section className="selected-case-study-body">
        <div><span>CASE-STUDY FRAMEWORK</span><h2>A TRANSPARENT<br/>PRODUCTION STORY.</h2><p>This demonstration shows the structure of a future verified case study. It does not claim a real customer, delivered production run, or commercial result.</p><div>{item.deliverables.map(deliverable=><b key={deliverable}><Check/>{deliverable}</b>)}</div></div>
        <ol>{item.route.map((step,index)=><li key={step}><span>0{index+1}</span><h3>{step}</h3><p>{index===0?'Define scope, products and identity.':index===1?'Translate direction into reviewable product decisions.':index===2?'Validate the physical or visual proof before production.':'Complete the approved route with quality gates.'}</p></li>)}</ol>
      </section>
      <section className="selected-case-study-cta"><div><span>BUILD FROM THIS DIRECTION</span><h2>MAKE THE NEXT<br/>COLLECTION REAL.</h2></div><Link to={item.link}>{item.linkLabel}<ArrowRight/></Link></section>
    </main></PageFrame>
  }
  return <PageFrame>
    <main className="selected-fightwear">
      <header className="selected-fightwear-hero">
        <img src="/images/ref/client-team-skawa.jpg" alt="Demo image representing a fightwear team collection"/>
        <div className="selected-fightwear-shade"/>
        <div className="selected-fightwear-hero-copy">
          <span><FlaskConical/> DEMONSTRATION PORTFOLIO</span>
          <h1>SELECTED<br/><em>FIGHTWEAR.</em></h1>
          <p>Three honest examples of how SKAWA’s service paths can come together. These are conceptual demonstrations—not client projects, testimonials or production claims.</p>
          <a href="#demo-work">VIEW DEMO WORK <ArrowRight/></a>
        </div>
        <aside>
          <b>NO INVENTED CLIENTS.</b>
          <p>Names, results and performance metrics will only appear here when verified case-study material is supplied and approved.</p>
        </aside>
      </header>

      <section className="selected-principles" aria-labelledby="portfolio-standard">
        <div>
          <span>THE PORTFOLIO STANDARD</span>
          <h2 id="portfolio-standard">PROOF SHOULD<br/><em>EARN TRUST.</em></h2>
        </div>
        <p>This page is ready to become a production portfolio without pretending demo concepts are real commissions. Its structure separates the brief, deliverables, process and verified outcome.</p>
        <div className="selected-proof-grid">
          <article><FileCheck2/><b>VERIFIED BRIEF</b><small>Business context approved by the customer.</small></article>
          <article><Layers3/><b>APPROVED VISUALS</b><small>Only imagery cleared for public use.</small></article>
          <article><ShieldCheck/><b>CONFIRMED OUTCOME</b><small>No unverified performance or sales claims.</small></article>
        </div>
      </section>

      <section id="demo-work" className="selected-cases" aria-label="Demonstration case studies">
        {cases.map((item,index)=><article className="selected-case" key={item.number}>
          <div className="selected-case-visual">
            <Link className="selected-case-open" to={`/selected-fightwear/${item.slug}`} aria-label={`Open demonstration case study: ${item.title}`}><img src={item.image} alt={`Visual placeholder for ${item.title}`} loading={index===0?'eager':'lazy'}/></Link>
            <span>DEMO / NOT A CLIENT PROJECT</span>
            <b>{item.number}</b>
          </div>
          <div className="selected-case-copy">
            <span>{item.category}</span>
            <h2>{item.title}</h2>
            <p>{item.summary}</p>
            <div className="selected-deliverables">
              <h3>EXAMPLE DELIVERABLES</h3>
              {item.deliverables.map(deliverable=><span key={deliverable}><Check/>{deliverable}</span>)}
            </div>
            <div className="selected-route" aria-label="Example project route">
              {item.route.map((step,stepIndex)=><span key={step}><b>0{stepIndex+1}</b>{step}</span>)}
            </div>
            <Link to={`/selected-fightwear/${item.slug}`}>OPEN DEMO CASE STUDY <ArrowRight/></Link>
          </div>
        </article>)}
      </section>

      <section className="selected-replace-note">
        <Sparkles/>
        <div><span>CONTENT HANDOFF</span><h2>READY FOR REAL WORK.</h2></div>
        <p>Replace each demo entry with approved photography, a named customer only with consent, the verified production scope, and outcomes the business can substantiate.</p>
      </section>

      <section className="selected-cta">
        <div><span>BUILD THE NEXT PIECE</span><h2>YOUR CONCEPT.<br/><em>BUILT TO FIGHT.</em></h2></div>
        <p>Choose the path that fits your project. Individual athletes can begin in the Design Lab; academies and brands can send a structured production brief.</p>
        <div><Link to="/customize">OPEN DESIGN LAB <ArrowRight/></Link><Link to="/request-mockup">START PROJECT BRIEF</Link></div>
      </section>
    </main>
  </PageFrame>
}
