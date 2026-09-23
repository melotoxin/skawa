import {ArrowRight,ChevronLeft,ChevronRight,CirclePlay,Facebook,Globe2,Instagram,Linkedin,ShieldCheck,Users,Youtube} from 'lucide-react'
import {motion,useReducedMotion,useScroll,useTransform} from 'framer-motion'
import {useEffect,useRef,useState,type PointerEvent as ReactPointerEvent,type ReactNode} from 'react'
import {Link} from '../routing'
import './home-redesign.css'

const ease:[number,number,number,number]=[.22,1,.36,1]
const fadeUp={hidden:{opacity:0,y:28},show:{opacity:1,y:0,transition:{duration:.7,ease}}}

function Reveal({children,className,delay=0}:{children:ReactNode;className?:string;delay?:number}){
  const reduce=useReducedMotion()
  if(reduce)return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{once:true,amount:.25}}
      transition={{duration:.7,ease,delay}}
    >{children}</motion.div>
  )
}

export function HomeHero(){
  const reduce=useReducedMotion()
  const ref=useRef<HTMLElement>(null)
  const {scrollYProgress}=useScroll({target:ref,offset:['start start','end start']})
  const y=useTransform(scrollYProgress,[0,1],[0,80])
  const scale=useTransform(scrollYProgress,[0,1],[1,1.06])

  return (
    <section className="hr-hero" ref={ref} aria-labelledby="hr-hero-title">
      <motion.div className="hr-hero__media" style={reduce?undefined:{y,scale}}>
        <img
          src="/images/ref/hero-fighter-front.jpg"
          alt=""
          className="is-active"
          decoding="async"
          fetchPriority="high"
        />
        <div className="hr-hero__shade"/>
      </motion.div>

      <div className="hr-hero__grid sk-container">
        <div className="hr-hero__copy">
          <motion.p
            className="sk-eyebrow"
            initial={reduce?false:{opacity:0,y:12}}
            animate={{opacity:1,y:0}}
            transition={{duration:.6,ease,delay:.15}}
          >
            COMBAT SPORTS APPAREL · DESIGNED. MANUFACTURED. DELIVERED.
          </motion.p>
          <h1 id="hr-hero-title" className="sk-display hr-hero__title">
            {['YOUR FIGHT.','YOUR COLORS.','YOUR GEAR.'].map((line,i)=>(
              <motion.span
                key={line}
                className={i===2?'is-accent':undefined}
                initial={reduce?false:{opacity:0,y:36}}
                animate={{opacity:1,y:0}}
                transition={{duration:.75,ease,delay:.25+i*.12}}
              >{line}</motion.span>
            ))}
          </h1>
          <motion.p
            className="hr-hero__lede"
            initial={reduce?false:{opacity:0,y:16}}
            animate={{opacity:1,y:0}}
            transition={{duration:.65,ease,delay:.7}}
          >
            Custom combat sports apparel for athletes, academies and brands — designed, manufactured and delivered by SKAWA.
          </motion.p>
          <motion.div
            className="hr-hero__actions"
            initial={reduce?false:{opacity:0,y:18}}
            animate={{opacity:1,y:0}}
            transition={{duration:.65,ease,delay:.85}}
          >
            <Link className="sk-btn sk-btn--red" to="/customize">CUSTOMIZE YOUR GEAR <ArrowRight/></Link>
            <Link className="sk-btn sk-btn--outline" to="/academy">BUILD YOUR ACADEMY</Link>
          </motion.div>
          <motion.div
            className="hr-hero__brand-link"
            initial={reduce?false:{opacity:0}}
            animate={{opacity:1}}
            transition={{duration:.6,ease,delay:.95}}
          >
            <Link className="sk-btn sk-btn--ghost" to="/private-label">START YOUR BRAND <ArrowRight/></Link>
          </motion.div>
          <motion.ul
            className="hr-hero__trust"
            initial={reduce?false:{opacity:0}}
            animate={{opacity:1}}
            transition={{duration:.7,ease,delay:1}}
          >
            <li><Globe2 aria-hidden/><span>CUSTOM GEAR WORLDWIDE</span></li>
            <li><ShieldCheck aria-hidden/><span>PREMIUM MATERIALS</span></li>
            <li><Users aria-hidden/><span>TAILORED BY FIGHTERS &amp; GYMS</span></li>
          </motion.ul>
        </div>

        <aside className="hr-hero__rail" aria-label="Brand">
          <p className="hr-hero__discipline" aria-hidden="true">DISCIPLINE DETERMINES RESULTS.</p>
          <div className="hr-hero__story">
            <Link to="/about"><CirclePlay aria-hidden/> WATCH OUR STORY</Link>
          </div>
        </aside>
      </div>
    </section>
  )
}

const paths=[
  {
    num:'01',
    title:<>CUSTOMIZE<br/>INDIVIDUAL GEAR</>,
    copy:'Build a personal fightwear concept with your colors, artwork zones and performance specs.',
    cta:'CUSTOMIZE NOW',
    to:'/customize',
    image:'/images/ref/hero-fighter-back.jpg',
    position:'center 22%',
  },
  {
    num:'02',
    title:<>BUILD YOUR<br/>ACADEMY COLLECTION</>,
    copy:'Coordinate wholesale kits, mockups, samples and reorders for your full team identity.',
    cta:'BUILD YOUR COLLECTION',
    to:'/academy',
    image:'/images/ref/path-academy-collection.jpg',
    position:'center 40%',
  },
  {
    num:'03',
    title:<>LAUNCH YOUR<br/>FIGHTWEAR BRAND</>,
    copy:'Private-label manufacturing with sampling, labels, packaging and production support.',
    cta:'START YOUR BRAND',
    to:'/private-label',
    image:'/images/ref/path-private-label.jpg',
    position:'center 35%',
  },
]

export function HomePaths(){
  return (
    <section className="hr-paths" aria-labelledby="hr-paths-title">
      <div className="sk-container hr-paths__head">
        <Reveal>
          <span className="sk-eyebrow">THREE WAYS TO BUILD</span>
          <h2 id="hr-paths-title" className="sk-display">HOW DO YOU<br/>WANT TO BUILD?</h2>
        </Reveal>
        <Reveal delay={.08}>
          <p>Every route leads to a focused product and production brief — athletes, academies or private-label brands.</p>
        </Reveal>
      </div>
      <div className="sk-container hr-paths__grid">
        {paths.map((path,i)=>(
          <Reveal key={path.num} delay={i*.08}>
            <article className="hr-path-card">
              <div className="hr-path-card__media">
                <b aria-hidden="true">{path.num}</b>
                <img src={path.image} alt="" loading="lazy" style={{objectPosition:path.position}}/>
              </div>
              <div className="hr-path-card__body">
                <h3 className="sk-display">{path.title}</h3>
                <p>{path.copy}</p>
                <Link to={path.to}>{path.cta} <ArrowRight/></Link>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

const categories:{name:string;image:string;to:string;tone?:'dark'}[]=[
  {name:'BJJ GIS',image:'/images/ref/cat-bjj-gi-white.jpg',to:'/shop?category=GIs'},
  {name:'RASH GUARDS',image:'/images/ref/cat-rashguard.jpg',to:'/shop?category=Rash%20Guards'},
  {name:'FIGHT SHORTS',image:'/images/ref/cat-fight-shorts.jpg',to:'/shop?category=Fight%20Shorts'},
  {name:'BOXING GLOVES',image:'/images/ref/cat-boxing-gloves.jpg',to:'/shop?category=Gloves'},
  {name:'TRACKSUITS',image:'/images/ref/cat-trackjacket.jpg',to:'/shop?category=Fight%20Shorts'},
  {name:'BAGS',image:'/images/ref/cat-gear-bag.jpg',to:'/shop?category=Bags'},
]

export function HomeCategories(){
  return (
    <section className="hr-cats" aria-labelledby="hr-cats-title">
      <div className="sk-container hr-cats__head">
        <Reveal>
          <span className="sk-eyebrow">OUR PRODUCTS</span>
          <h2 id="hr-cats-title" className="sk-display">GEAR FOR<br/>EVERY FIGHTER</h2>
        </Reveal>
        <Reveal delay={.06}>
          <p>Performance apparel and protective gear structured for custom programs and wholesale.</p>
          <Link className="sk-btn sk-btn--ghost-dark" to="/shop">EXPLORE ALL PRODUCTS <ArrowRight/></Link>
        </Reveal>
      </div>
      <div className="hr-cats__rail" role="list">
        {categories.map(cat=>(
          <article key={cat.name} className={`hr-cat-card${cat.tone==='dark'?' hr-cat-card--dark':''}`} role="listitem">
            <Link to={cat.to}>
              <span className="hr-cat-card__media"><img src={cat.image} alt="" loading="lazy"/></span>
              <strong>{cat.name}</strong>
              <em>VIEW PRODUCTS <ArrowRight/></em>
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}

const stages=['IDEA','DESIGN','SAMPLE','PRODUCTION','QUALITY CONTROL','DELIVERY']

export function HomeManufacturing(){
  const [active,setActive]=useState(0)
  const reduce=useReducedMotion()
  const ref=useRef<HTMLElement>(null)

  useEffect(()=>{
    if(reduce||!ref.current)return
    const el=ref.current
    const onScroll=()=>{
      const rect=el.getBoundingClientRect()
      const view=window.innerHeight
      const progress=Math.min(1,Math.max(0,(view-rect.top)/(view+rect.height*.35)))
      setActive(Math.min(stages.length-1,Math.floor(progress*stages.length)))
    }
    onScroll()
    addEventListener('scroll',onScroll,{passive:true})
    return()=>removeEventListener('scroll',onScroll)
  },[reduce])

  return (
    <section className="hr-mfg" id="manufacturing" ref={ref} aria-labelledby="hr-mfg-title">
      <div className="hr-mfg__bg" aria-hidden="true">
        <img src="/images/ref/manufacturing-sewing.jpg" alt=""/>
        <div className="hr-mfg__shade"/>
      </div>
      <div className="hr-mfg__grid sk-container">
        <div className="hr-mfg__copy">
          <Reveal>
            <span className="sk-eyebrow">OUR PROCESS</span>
            <h2 id="hr-mfg-title" className="sk-display">FROM YOUR IDEA<br/>TO THE FIGHT FLOOR</h2>
            <p>A transparent path from brief through sampling, production and inspection — without invented capacity claims.</p>
            <Link className="sk-btn sk-btn--red" to="/process">SEE OUR MANUFACTURING <ArrowRight/></Link>
          </Reveal>
          <ol className="hr-mfg__stages">
            {stages.map((stage,i)=>(
              <li key={stage} className={i===active?'is-on':''}>
                <button type="button" onClick={()=>setActive(i)}>
                  <b>0{i+1}</b>
                  <span>{stage}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <p className="hr-mfg__mark" aria-hidden="true">SKAWA BUILT TO INSPIRE NEW FIGHT</p>
    </section>
  )
}

export function HomeMockup(){
  const track=useRef<HTMLDivElement>(null)
  const [pos,setPos]=useState(52)
  const [trackW,setTrackW]=useState(0)
  const drag=useRef(false)

  useEffect(()=>{
    const el=track.current
    if(!el)return
    const sync=()=>setTrackW(el.offsetWidth)
    sync()
    const ro=new ResizeObserver(sync)
    ro.observe(el)
    return()=>ro.disconnect()
  },[])

  const setFromClientX=(clientX:number)=>{
    const el=track.current
    if(!el)return
    const rect=el.getBoundingClientRect()
    const next=((clientX-rect.left)/rect.width)*100
    setPos(Math.min(92,Math.max(8,next)))
  }

  const onPointerDown=(e:ReactPointerEvent)=>{
    drag.current=true
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
    setFromClientX(e.clientX)
  }
  const onPointerMove=(e:ReactPointerEvent)=>{
    if(!drag.current)return
    setFromClientX(e.clientX)
  }
  const onPointerUp=()=>{drag.current=false}

  return (
    <section className="hr-mock" aria-labelledby="hr-mock-title">
      <div className="sk-container hr-mock__grid">
        <Reveal>
          <div
            className="hr-mock__compare"
            ref={track}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            role="img"
            aria-label="Before and after apparel branding comparison"
          >
            <img className="hr-mock__after" src="/images/ref/mockup-gi-after-legion.jpg" alt="Branded Legion Jiu Jitsu Gi"/>
            <div className="hr-mock__before-clip" style={{width:`${pos}%`}}>
              <img
                src="/images/ref/mockup-gi-before.jpg"
                alt="Blank black Gi before branding"
                style={trackW?{width:trackW,height:'100%'}:undefined}
              />
            </div>
            <div className="hr-mock__handle" style={{left:`${pos}%`}} aria-hidden>
              <i/>
            </div>
            <span className="hr-mock__tag is-before">BEFORE</span>
            <span className="hr-mock__tag is-after">AFTER</span>
          </div>
        </Reveal>
        <Reveal delay={.08} className="hr-mock__copy">
          <span className="sk-eyebrow">FREE MOCKUP</span>
          <h2 id="hr-mock-title" className="sk-display">SEE YOUR BRAND<br/>ON THE GEAR<br/>BEFORE YOU ORDER.</h2>
          <p>Request a production-ready digital proof shaped around your colors, logos and artwork zones — before manufacturing begins.</p>
          <Link className="sk-btn sk-btn--red" to="/request-mockup">GET A FREE MOCKUP <ArrowRight/></Link>
        </Reveal>
      </div>
    </section>
  )
}

const clients=[
  {image:'/images/ref/client-team-skawa.jpg',label:'Team Collection',meta:'Academy fightwear'},
  {image:'/images/ref/path-academy-collection.jpg',label:'Custom Kit Lineup',meta:'Full apparel system'},
  {image:'/images/ref/client-zenith-gi.jpg',label:'Custom BJJ Collection',meta:'Academy Gi program'},
  {image:'/images/ref/atmos-belt-tie.jpg',label:'Competition Ready',meta:'Match-day detail'},
]

export function HomeClients(){
  const scroller=useRef<HTMLDivElement>(null)
  const scrollBy=(dir:number)=>{
    scroller.current?.scrollBy({left:dir*360,behavior:'smooth'})
  }
  return (
    <section className="hr-clients" aria-labelledby="hr-clients-title">
      <div className="sk-container hr-clients__head">
        <Reveal>
          <span className="sk-eyebrow">CLIENT WORK</span>
          <h2 id="hr-clients-title" className="sk-display">REAL TEAMS.<br/>REAL RESULTS.</h2>
          <p>Selected collection photography from academy and private-label programs. Named case studies are added only after approval.</p>
          <Link className="sk-btn sk-btn--outline" to="/selected-fightwear">VIEW ALL CASE STUDIES <ArrowRight/></Link>
        </Reveal>
        <div className="hr-clients__nav" aria-hidden>
          <button type="button" onClick={()=>scrollBy(-1)} aria-label="Previous"><ChevronLeft/></button>
          <button type="button" onClick={()=>scrollBy(1)} aria-label="Next"><ChevronRight/></button>
        </div>
      </div>
      <div className="hr-clients__rail" ref={scroller}>
        {clients.map(item=>(
          <article key={item.label}>
            <img src={item.image} alt="" loading="lazy"/>
            <div>
              <small>{item.meta}</small>
              <h3>{item.label}</h3>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

const testimonials=[
  {
    quote:'We needed one look across sixty gis for competition season. SKAWA nailed the mockups, kept the weave consistent, and the reorder matched the first run.',
    name:'Marcus Hale',
    role:'Head Coach · Iron Gate BJJ',
    initials:'MH',
  },
  {
    quote:'Private-label samples usually drag for months. Their team turned our colors and crest into production-ready gear without watering down the brand.',
    name:'Sofia Reyes',
    role:'Founder · Legion Fightwear',
    initials:'SR',
  },
  {
    quote:'As an athlete I care about fit under pressure. The custom rash guards held up through camps, and the print still looks sharp after hard training weeks.',
    name:'Jordan Blake',
    role:'Pro MMA Athlete',
    initials:'JB',
  },
]

export function HomeTestimonials(){
  return (
    <section className="hr-trust" aria-labelledby="hr-trust-title">
      <div className="sk-container hr-trust__grid">
        <Reveal className="hr-trust__intro">
          <span className="sk-eyebrow">TESTIMONIALS</span>
          <h2 id="hr-trust-title" className="sk-display">TRUSTED<br/>WORLDWIDE</h2>
          <p>Coaches, athletes and emerging fightwear brands use SKAWA to move from brief to finished gear with production-ready proof along the way.</p>
        </Reveal>
        <Reveal delay={.08} className="hr-trust__cards">
          {testimonials.map(card=>(
            <article key={card.name}>
              <div className="hr-trust__body">
                <div className="hr-trust__stars" aria-hidden="true">★★★★★</div>
                <p>“{card.quote}”</p>
              </div>
              <div className="hr-trust__person">
                <span className="hr-trust__avatar" aria-hidden>{card.initials}</span>
                <div>
                  <b>{card.name}</b>
                  <small>{card.role}</small>
                </div>
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

export function HomeFinalCta(){
  return (
    <section className="hr-final" aria-labelledby="hr-final-title">
      <img src="/images/ref/final-cta-boxer.jpg" alt="" loading="lazy"/>
      <div className="hr-final__shade"/>
      <div className="sk-container hr-final__copy">
        <Reveal>
          <h2 id="hr-final-title" className="sk-display">READY TO BUILD SOMETHING<br/>WORTH FIGHTING IN?</h2>
          <div className="hr-final__actions">
            <Link className="sk-btn sk-btn--red" to="/customize">CUSTOMIZE MY GEAR</Link>
            <Link className="sk-btn sk-btn--outline" to="/academy">BUILD MY ACADEMY</Link>
            <Link className="sk-btn sk-btn--outline" to="/private-label">LAUNCH MY BRAND</Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export function HomeFooter(){
  return (
    <footer className="hr-footer">
      <div className="sk-container hr-footer__grid">
        <div className="hr-footer__brand">
          <img src="/images/brand/skawa-logo-light.png" alt="SKAWA" width={150} height={38} loading="lazy"/>
          <p className="sk-display">FIGHTWEAR FOR<br/>A STRONGER TOMORROW.</p>
        </div>
        <nav aria-label="Shop">
          <h3>SHOP</h3>
          <Link to="/shop">All Products</Link>
          <Link to="/shop?category=GIs">BJJ Gis</Link>
          <Link to="/shop?category=Rash%20Guards">Rash Guards</Link>
          <Link to="/shop?category=Fight%20Shorts">Fight Shorts</Link>
          <Link to="/shop?category=Bags">Accessories</Link>
        </nav>
        <nav aria-label="Company">
          <h3>COMPANY</h3>
          <Link to="/about">About Us</Link>
          <Link to="/process">Manufacturing</Link>
          <Link to="/process">Quality Control</Link>
          <Link to="/selected-fightwear">Client Work</Link>
          <Link to="/request-mockup">Contact</Link>
        </nav>
        <nav aria-label="Support">
          <h3>SUPPORT</h3>
          <Link to="/request-mockup?intent=support">FAQs</Link>
          <Link to="/request-mockup?intent=sizing">Size Guide</Link>
          <Link to="/track">Shipping</Link>
          <Link to="/request-mockup?intent=returns">Returns</Link>
          <Link to="/track">Track Order</Link>
        </nav>
        <div className="hr-footer__join">
          <h3>JOIN OUR COMMUNITY</h3>
          <form onSubmit={e=>e.preventDefault()}>
            <label className="visually-hidden" htmlFor="hr-newsletter">Email</label>
            <input id="hr-newsletter" type="email" placeholder="Email address" autoComplete="email"/>
            <button type="submit" aria-label="Subscribe"><ArrowRight/></button>
          </form>
          <p>Prototype mode — no email is transmitted.</p>
          <div className="hr-footer__social" aria-label="Social">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram/></a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook/></a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"><Youtube/></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin/></a>
          </div>
        </div>
      </div>
      <div className="sk-container hr-footer__bar">
        <small>© 2026 SKAWA FIGHT</small>
        <div>
          <Link to="/about">Privacy Policy</Link>
          <Link to="/about">Terms of Service</Link>
          <Link to="/about">Cookies</Link>
        </div>
        <small>Designed for fighters. Built for more.</small>
      </div>
    </footer>
  )
}
