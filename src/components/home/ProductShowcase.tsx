import {ArrowRight} from 'lucide-react'
import {AnimatePresence,motion,useReducedMotion} from 'framer-motion'
import {useRef,useState,type KeyboardEvent} from 'react'
import {Link} from '../../routing'
import {showcase,showcaseItems} from './content'
import {Eyebrow,Reveal,SplitTitle,ease} from './motion'

export default function ProductShowcase(){
  const reduce=useReducedMotion()
  const [active,setActive]=useState(0)
  const tabs=useRef<(HTMLButtonElement|null)[]>([])
  const item=showcaseItems[active]

  const select=(index:number,focus=false)=>{
    const next=(index+showcaseItems.length)%showcaseItems.length
    setActive(next)
    if(focus)tabs.current[next]?.focus()
  }
  const onKeyDown=(event:KeyboardEvent<HTMLDivElement>)=>{
    const keys:Record<string,number>={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}
    if(event.key in keys){event.preventDefault();select(active+keys[event.key],true)}
    else if(event.key==='Home'){event.preventDefault();select(0,true)}
    else if(event.key==='End'){event.preventDefault();select(showcaseItems.length-1,true)}
  }

  const fade=reduce
    ?{initial:false as const,animate:{opacity:1},exit:{opacity:1}}
    :{initial:{opacity:0,scale:1.04,x:24},animate:{opacity:1,scale:1,x:0},exit:{opacity:0,scale:.98,x:-24}}

  return (
    <section className="hp-show" aria-labelledby="hp-show-title">
      <div className="hp-container">
        <Reveal className="hp-show__head">
          <div>
            <Eyebrow>{showcase.eyebrow}</Eyebrow>
            <SplitTitle id="hp-show-title" className="hp-title" lines={showcase.title} accent={showcase.accent}/>
          </div>
          <div>
            <p className="hp-lede">{showcase.copy}</p>
            <Link className="hp-link" to="/shop">View the full catalog<ArrowRight aria-hidden="true"/></Link>
          </div>
        </Reveal>

        <Reveal className="hp-show__body" y={36}>
          <div className="hp-show__tabs" role="tablist" aria-label="Product categories" aria-orientation="vertical" onKeyDown={onKeyDown}>
            {showcaseItems.map((entry,index)=><button
              key={entry.key}
              ref={node=>{tabs.current[index]=node}}
              type="button"
              role="tab"
              id={`hp-show-tab-${entry.key}`}
              aria-selected={index===active}
              aria-controls="hp-show-panel"
              tabIndex={index===active?0:-1}
              className="hp-show__tab"
              onClick={()=>select(index)}
            >
              <span>{String(index+1).padStart(2,'0')}</span>{entry.label}
            </button>)}
          </div>

          <div className="hp-show__stage" id="hp-show-panel" role="tabpanel" aria-labelledby={`hp-show-tab-${item.key}`}>
            <div className="hp-show__visual" style={{backgroundColor:item.bg}}>
              <span className="hp-show__index" aria-hidden="true">{String(active+1).padStart(2,'0')}<small>/{String(showcaseItems.length).padStart(2,'0')}</small></span>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.img
                  key={item.key}
                  src={item.image.src}
                  srcSet={item.image.srcSet}
                  sizes="(min-width: 1024px) 44vw, 92vw"
                  alt={item.image.alt}
                  loading="lazy"
                  decoding="async"
                  {...fade}
                  transition={{duration:.7,ease}}
                />
              </AnimatePresence>
            </div>
            <div className="hp-show__info" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={item.key}
                  initial={reduce?false:{opacity:0,y:14}}
                  animate={{opacity:1,y:0}}
                  exit={reduce?{opacity:1}:{opacity:0,y:-10}}
                  transition={{duration:.45,ease}}
                >
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                  <ul aria-label="Highlights">{item.tags.map(tag=><li key={tag}>{tag}</li>)}</ul>
                  <Link className="hp-btn hp-btn--dark" to={item.to}>{item.cta}<ArrowRight aria-hidden="true"/></Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
