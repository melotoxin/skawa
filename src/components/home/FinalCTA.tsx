import {ArrowRight,Check} from 'lucide-react'
import {Link} from '../../routing'
import {finalCta} from './content'
import {Eyebrow,Reveal,SplitTitle} from './motion'

const steps=['Free digital mockup','Physical sample','Production & QC']

export default function FinalCTA(){
  return (
    <section className="hp-final" aria-labelledby="hp-final-title">
      <div className="hp-container hp-final__grid">
        <Reveal className="hp-final__copy">
          <Eyebrow>{finalCta.eyebrow}</Eyebrow>
          <SplitTitle id="hp-final-title" className="hp-display-wide hp-final__title" lines={finalCta.title} accent={finalCta.accent}/>
          <p className="hp-lede">{finalCta.copy}</p>
          <div className="hp-actions">
            <Link className="hp-btn hp-btn--red hp-btn--lg" to={finalCta.primary.to}>{finalCta.primary.label}<ArrowRight aria-hidden="true"/></Link>
            <Link className="hp-btn hp-btn--glass hp-btn--lg" to={finalCta.secondary.to}>{finalCta.secondary.label}</Link>
          </div>
        </Reveal>
        <Reveal className="hp-final__visual" delay={.1} y={40}>
          <img src={finalCta.image.src} srcSet={finalCta.image.srcSet} sizes="(min-width: 1024px) 34vw, 90vw" alt={finalCta.image.alt} loading="lazy" decoding="async"/>
          <ul className="hp-final__steps" aria-label="What happens next">
            {steps.map((step,index)=><li key={step}><span>{String(index+1).padStart(2,'0')}</span>{step}<Check aria-hidden="true"/></li>)}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
