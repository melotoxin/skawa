import {motion,useInView,useReducedMotion} from 'framer-motion'
import {useEffect,useRef,useState,type ReactNode} from 'react'

/** SKAWA motion curve — cubic-bezier(0.22, 1, 0.36, 1). */
export const ease=[.22,1,.36,1] as const

/** Fade/translate reveal on first entry. Renders static content when reduced motion is requested. */
export function Reveal({children,className,delay=0,y=28,amount=.2}:{children:ReactNode;className?:string;delay?:number;y?:number;amount?:number}){
  const reduce=useReducedMotion()
  if(reduce)return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{opacity:0,y}}
      whileInView={{opacity:1,y:0}}
      viewport={{once:true,amount}}
      transition={{duration:.8,ease,delay}}
    >{children}</motion.div>
  )
}

/** Stagger container + item pair for lists that reveal in sequence. */
export const stagger={
  container:{hidden:{},show:{transition:{staggerChildren:.09,delayChildren:.05}}},
  item:{hidden:{opacity:0,y:22},show:{opacity:1,y:0,transition:{duration:.7,ease}}},
}

/** Counts from 0 to `value` once the number scrolls into view. */
export function CountUp({value,suffix='',duration=1400}:{value:number;suffix?:string;duration?:number}){
  const ref=useRef<HTMLSpanElement>(null)
  const inView=useInView(ref,{once:true,amount:.6})
  const reduce=useReducedMotion()
  const [shown,setShown]=useState(reduce?value:0)
  useEffect(()=>{
    if(!inView)return
    if(reduce){setShown(value);return}
    let frame=0
    const start=performance.now()
    const tick=(now:number)=>{
      const t=Math.min(1,(now-start)/duration)
      setShown(Math.round(value*(1-Math.pow(1-t,3))))
      if(t<1)frame=requestAnimationFrame(tick)
    }
    frame=requestAnimationFrame(tick)
    return()=>cancelAnimationFrame(frame)
  },[inView,reduce,value,duration])
  return <span ref={ref} aria-label={`${value}${suffix}`}><span aria-hidden="true">{shown}{suffix}</span></span>
}

/** True on devices with a fine pointer that can hover (desktop), false on touch. */
export function useFinePointer(){
  const [fine,setFine]=useState(false)
  useEffect(()=>{
    const media=matchMedia('(hover: hover) and (pointer: fine)')
    const sync=()=>setFine(media.matches)
    sync()
    media.addEventListener('change',sync)
    return()=>media.removeEventListener('change',sync)
  },[])
  return fine
}

/** Section heading pieces shared by every homepage section. */
export function Eyebrow({children,tone='dark'}:{children:ReactNode;tone?:'dark'|'light'}){
  return <p className={`hp-eyebrow${tone==='light'?' hp-eyebrow--light':''}`}>{children}</p>
}

export function SplitTitle({lines,accent,as:Tag='h2',className='',id}:{lines:string[];accent?:string;as?:'h1'|'h2';className?:string;id?:string}){
  return <Tag id={id} className={className}>
    {lines.filter(Boolean).map(line=><span key={line} className="hp-line">{line}</span>)}
    {accent&&<span className="hp-line hp-accent">{accent}</span>}
  </Tag>
}
