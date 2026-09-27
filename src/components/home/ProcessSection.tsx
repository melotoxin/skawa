import {ArrowRight,ChevronRight} from 'lucide-react'
import {motion,useReducedMotion} from 'framer-motion'
import {Link} from '../../routing'
import {processIntro,processSteps} from './content'
import {Eyebrow,Reveal,SplitTitle,ease,stagger} from './motion'

type Step=typeof processSteps[number]

export function ProcessCard({step,last}:{step:Step;last:boolean}){
  const Icon=step.icon
  return (
    <motion.li className="hp-step" variants={stagger.item}>
      <article className="hp-step__card">
        <span className="hp-step__num">{step.num}</span>
        <Icon className="hp-step__icon" aria-hidden="true" strokeWidth={1.5}/>
        <h3 className="hp-step__title">{step.title}</h3>
        <p className="hp-step__copy">{step.copy}</p>
      </article>
      {!last&&<ChevronRight className="hp-step__arrow" aria-hidden="true"/>}
    </motion.li>
  )
}

export default function ProcessSection(){
  const reduce=useReducedMotion()
  return (
    <section className="hp-process" aria-labelledby="hp-process-title">
      <div className="hp-container hp-process__grid">
        <Reveal className="hp-process__intro">
          <Eyebrow>{processIntro.eyebrow}</Eyebrow>
          <SplitTitle id="hp-process-title" className="hp-title" lines={processIntro.title} accent={processIntro.accent}/>
          <p className="hp-lede">{processIntro.copy}</p>
          <Link className="hp-btn hp-btn--glass" to={processIntro.cta.to}>{processIntro.cta.label}<ArrowRight aria-hidden="true"/></Link>
        </Reveal>
        <div className="hp-process__track">
          <motion.span
            className="hp-process__line"
            aria-hidden="true"
            initial={reduce?false:{scaleX:0}}
            whileInView={{scaleX:1}}
            viewport={{once:true,amount:.5}}
            transition={{duration:1.4,ease,delay:.2}}
          />
          <motion.ol
            className="hp-process__steps"
            variants={reduce?undefined:stagger.container}
            initial={reduce?false:'hidden'}
            whileInView="show"
            viewport={{once:true,amount:.25}}
          >
            {processSteps.map((step,index)=><ProcessCard key={step.num} step={step} last={index===processSteps.length-1}/>)}
          </motion.ol>
        </div>
      </div>
    </section>
  )
}
