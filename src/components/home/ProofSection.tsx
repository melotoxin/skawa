import {ChevronLeft,ChevronRight,Quote} from 'lucide-react'
import {AnimatePresence,motion,useReducedMotion} from 'framer-motion'
import {useEffect,useRef,useState,type PointerEvent} from 'react'
import {commitments,proof,stats,testimonials} from './content'
import {CountUp,Eyebrow,Reveal,SplitTitle,ease} from './motion'

const AUTOPLAY_MS=7000

type Slide={quote:string;title:string;meta:string}
const slides:Slide[]=testimonials.length
  ?testimonials.map(entry=>({quote:entry.quote,title:entry.name,meta:`${entry.role}, ${entry.organization} · ${entry.country}`}))
  :commitments.map(entry=>({quote:entry.quote,title:entry.title,meta:entry.meta}))

export function StatsSection(){
  return (
    <dl className="hp-stats">
      {stats.map(stat=><div key={stat.label}>
        <dt>{stat.label}</dt>
        <dd><CountUp value={stat.value} suffix={stat.suffix}/></dd>
      </div>)}
    </dl>
  )
}

export function Testimonials(){
  const reduce=useReducedMotion()
  const [index,setIndex]=useState(0)
  const [paused,setPaused]=useState(false)
  const startX=useRef<number|null>(null)
  const autoplay=!reduce&&!paused&&slides.length>1

  useEffect(()=>{
    if(!autoplay)return
    const timer=window.setTimeout(()=>setIndex(value=>(value+1)%slides.length),AUTOPLAY_MS)
    return()=>window.clearTimeout(timer)
  },[autoplay,index])

  const go=(step:number)=>setIndex(value=>(value+step+slides.length)%slides.length)
  const onPointerDown=(event:PointerEvent)=>{startX.current=event.clientX;setPaused(true)}
  const onPointerUp=(event:PointerEvent)=>{
    if(startX.current===null)return
    const delta=event.clientX-startX.current
    startX.current=null
    if(Math.abs(delta)>40)go(delta<0?1:-1)
  }
  const slide=slides[index]

  return (
    <div
      className="hp-quote"
      role="group"
      aria-roledescription="carousel"
      aria-label={testimonials.length?'Customer testimonials':'The SKAWA production standard'}
      onMouseEnter={()=>setPaused(true)}
      onMouseLeave={()=>setPaused(false)}
      onFocus={()=>setPaused(true)}
      onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node))setPaused(false)}}
    >
      <div className="hp-quote__card" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={()=>{startX.current=null}}>
        <Quote className="hp-quote__mark" aria-hidden="true"/>
        <div className="hp-quote__viewport" aria-live={autoplay?'off':'polite'}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.figure
              key={index}
              aria-roledescription="slide"
              aria-label={`${index+1} of ${slides.length}`}
              initial={reduce?false:{opacity:0,x:18}}
              animate={{opacity:1,x:0}}
              exit={reduce?{opacity:1}:{opacity:0,x:-18}}
              transition={{duration:.5,ease}}
            >
              <blockquote>“{slide.quote}”</blockquote>
              <figcaption><b>{slide.title}</b><span>{slide.meta}</span></figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>
      </div>
      <div className="hp-quote__controls">
        <div className="hp-quote__dots">
          {slides.map((_,dot)=><button key={dot} type="button" aria-label={`Show item ${dot+1}`} aria-current={dot===index} onClick={()=>setIndex(dot)}><i/></button>)}
        </div>
        <div className="hp-quote__arrows">
          <button type="button" aria-label="Previous" onClick={()=>go(-1)}><ChevronLeft aria-hidden="true"/></button>
          <button type="button" aria-label="Next" onClick={()=>go(1)}><ChevronRight aria-hidden="true"/></button>
        </div>
      </div>
    </div>
  )
}

export default function ProofSection(){
  return (
    <section className="hp-proof" aria-labelledby="hp-proof-title">
      <div className="hp-proof__bg" aria-hidden="true">
        <img src={proof.background.src} srcSet={proof.background.srcSet} sizes="100vw" alt="" loading="lazy" decoding="async"/>
      </div>
      <div className="hp-container hp-proof__grid">
        <Reveal className="hp-proof__copy">
          <Eyebrow>{proof.eyebrow}</Eyebrow>
          <SplitTitle id="hp-proof-title" className="hp-display-wide" lines={proof.title} accent={proof.accent}/>
          <p className="hp-lede">{proof.copy}</p>
          <StatsSection/>
        </Reveal>
        <p className="hp-proof__motto" aria-hidden="true">{proof.motto.map(word=><span key={word}>{word}</span>)}</p>
        <Reveal className="hp-proof__quote" delay={.12}>
          <Testimonials/>
        </Reveal>
      </div>
    </section>
  )
}
