import {ArrowRight} from 'lucide-react'
import {motion,useReducedMotion,useScroll,useTransform} from 'framer-motion'
import {useRef} from 'react'
import {Link} from '../../routing'
import {academy} from './content'
import {Eyebrow,Reveal,SplitTitle,stagger} from './motion'

export default function AcademySection(){
  const reduce=Boolean(useReducedMotion())
  const ref=useRef<HTMLElement>(null)
  const {scrollYProgress}=useScroll({target:ref,offset:['start end','end start']})
  const lineupY=useTransform(scrollYProgress,[0,1],[reduce?0:24,reduce?0:-24])
  const teamY=useTransform(scrollYProgress,[0,1],[reduce?0:60,reduce?0:-40])

  return (
    <section ref={ref} className="hp-academy" aria-labelledby="hp-academy-title">
      <div className="hp-container hp-academy__grid">
        <div className="hp-academy__copy">
          <Reveal>
            <Eyebrow>{academy.eyebrow}</Eyebrow>
            <SplitTitle id="hp-academy-title" className="hp-title" lines={academy.title} accent={academy.accent}/>
            <p className="hp-lede">{academy.copy}</p>
          </Reveal>
          <motion.ul
            className="hp-academy__points"
            variants={reduce?undefined:stagger.container}
            initial={reduce?false:'hidden'}
            whileInView="show"
            viewport={{once:true,amount:.3}}
          >
            {academy.points.map(({icon:Icon,title,copy})=><motion.li key={title} variants={stagger.item}>
              <Icon aria-hidden="true" strokeWidth={1.5}/>
              <div><h3>{title}</h3><p>{copy}</p></div>
            </motion.li>)}
          </motion.ul>
          <Reveal className="hp-actions">
            <Link className="hp-btn hp-btn--red" to={academy.cta.to}>{academy.cta.label}<ArrowRight aria-hidden="true"/></Link>
            <Link className="hp-link" to={academy.secondary.to}>{academy.secondary.label}<ArrowRight aria-hidden="true"/></Link>
          </Reveal>
        </div>

        <div className="hp-academy__visual">
          <motion.figure className="hp-academy__lineup" style={{y:lineupY}}>
            <img src={academy.lineup.src} srcSet={academy.lineup.srcSet} sizes="(min-width: 1024px) 58vw, 100vw" alt={academy.lineup.alt} loading="lazy" decoding="async"/>
          </motion.figure>
          <motion.figure className="hp-academy__team" style={{y:teamY}}>
            <img src={academy.team.src} srcSet={academy.team.srcSet} sizes="(min-width: 1024px) 24vw, 46vw" alt={academy.team.alt} loading="lazy" decoding="async"/>
          </motion.figure>
          <Reveal className="hp-academy__kit" delay={.2}>
            <p>The collection</p>
            <ol>{academy.items.map((entry,index)=><li key={entry}><span>{String(index+1).padStart(2,'0')}</span>{entry}</li>)}</ol>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
