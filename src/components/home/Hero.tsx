import {ArrowRight} from 'lucide-react'
import {motion,useReducedMotion,useScroll,useTransform} from 'framer-motion'
import {useEffect,useRef,type RefObject} from 'react'
import {Link} from '../../routing'
import {hero,trustPoints} from './content'
import {ease,stagger,useFinePointer} from './motion'

/** Cursor-driven depth: writes --hx/--hy (-0.5…0.5) that the CSS layers translate against. */
function useHeroDepth(ref:RefObject<HTMLElement|null>,enabled:boolean){
  useEffect(()=>{
    const el=ref.current
    if(!el||!enabled)return
    let frame=0
    const set=(x:number,y:number)=>{el.style.setProperty('--hx',x.toFixed(3));el.style.setProperty('--hy',y.toFixed(3))}
    const onMove=(event:PointerEvent)=>{
      cancelAnimationFrame(frame)
      frame=requestAnimationFrame(()=>{
        const rect=el.getBoundingClientRect()
        set((event.clientX-rect.left)/rect.width-.5,(event.clientY-rect.top)/rect.height-.5)
      })
    }
    const onLeave=()=>{cancelAnimationFrame(frame);set(0,0)}
    el.addEventListener('pointermove',onMove)
    el.addEventListener('pointerleave',onLeave)
    return()=>{cancelAnimationFrame(frame);el.removeEventListener('pointermove',onMove);el.removeEventListener('pointerleave',onLeave)}
  },[ref,enabled])
}

export default function Hero(){
  const reduce=Boolean(useReducedMotion())
  const fine=useFinePointer()
  const ref=useRef<HTMLElement>(null)
  const {scrollYProgress}=useScroll({target:ref,offset:['start start','end start']})
  const bgY=useTransform(scrollYProgress,[0,1],[0,reduce?0:90])
  const athleteY=useTransform(scrollYProgress,[0,1],[0,reduce?0:40])
  useHeroDepth(ref,fine&&!reduce)

  const item=reduce?undefined:stagger.item
  return (
    <section ref={ref} className="hp-hero" aria-labelledby="hp-hero-title">
      <motion.div className="hp-hero__bg" style={{y:bgY}} aria-hidden="true">
        <motion.div
          className="hp-hero__depth hp-hero__depth--bg"
          initial={reduce?false:{opacity:0,scale:1.06}}
          animate={{opacity:1,scale:1}}
          transition={{duration:1.4,ease}}
        >
          <picture>
            <source media="(max-width: 767px)" srcSet={hero.background.mobile}/>
            <img src={hero.background.desktop.src} srcSet={hero.background.desktop.srcSet} sizes="100vw" alt="" decoding="async"/>
          </picture>
        </motion.div>
      </motion.div>
      <div className="hp-hero__wash" aria-hidden="true"/>

      <div className="hp-container hp-hero__inner">
        <motion.div
          className="hp-hero__copy"
          variants={reduce?undefined:stagger.container}
          initial={reduce?false:'hidden'}
          animate="show"
        >
          <motion.p className="hp-eyebrow" variants={item}>{hero.eyebrow}</motion.p>
          <h1 id="hp-hero-title" className="hp-hero__title">
            {hero.title.map(line=><motion.span key={line} className="hp-line" variants={item}>{line}</motion.span>)}
            <motion.span className="hp-line hp-accent" variants={item}>{hero.accent}</motion.span>
          </h1>
          <motion.p className="hp-hero__lede" variants={item}>{hero.copy}</motion.p>
          <motion.div className="hp-hero__actions" variants={item}>
            <Link className="hp-btn hp-btn--red" to={hero.primary.to}>{hero.primary.label}<ArrowRight aria-hidden="true"/></Link>
            <Link className="hp-btn hp-btn--glass" to={hero.secondary.to}>{hero.secondary.label}</Link>
          </motion.div>
        </motion.div>
        <motion.ul
          className="hp-trust"
          aria-label="Why athletes and academies choose SKAWA"
          initial={reduce?false:{opacity:0,y:16}}
          animate={{opacity:1,y:0}}
          transition={{duration:.8,ease,delay:.7}}
        >
          {trustPoints.map(({icon:Icon,title,copy})=><li key={title}>
            <Icon aria-hidden="true" strokeWidth={1.5}/>
            <span><b>{title}</b><small>{copy}</small></span>
          </li>)}
        </motion.ul>
      </div>

      <motion.div className="hp-hero__athlete" style={{y:athleteY}}>
        <div className="hp-hero__depth hp-hero__depth--fg">
          <motion.img
            src={hero.athlete.src}
            srcSet={hero.athlete.srcSet}
            sizes="(min-width: 1024px) 50vw, 92vw"
            width={hero.athlete.width}
            height={hero.athlete.height}
            alt={hero.athlete.alt}
            fetchPriority="high"
            decoding="async"
            initial={reduce?false:{y:28,scale:1.03}}
            animate={{y:0,scale:1}}
            transition={{duration:1.3,ease}}
          />
        </div>
      </motion.div>
    </section>
  )
}
