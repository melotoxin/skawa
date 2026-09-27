import {ArrowRight} from 'lucide-react'
import {Link} from '../../routing'
import {offers} from './content'
import {Reveal} from './motion'

export default function OffersBand(){
  return (
    <section className="hp-offers" aria-label="Start with proof">
      <div className="hp-container hp-offers__grid">
        {offers.map(({icon:Icon,...offer},index)=><Reveal key={offer.title} delay={index*.08}>
          <article className="hp-offer">
            <Icon className="hp-offer__icon" aria-hidden="true" strokeWidth={1.5}/>
            <div>
              <p className="hp-offer__eyebrow">{offer.eyebrow}</p>
              <h2 className="hp-offer__title">{offer.title}</h2>
              <p className="hp-offer__copy">{offer.copy}</p>
            </div>
            <Link className="hp-btn hp-btn--dark" to={offer.cta.to}>{offer.cta.label}<ArrowRight aria-hidden="true"/></Link>
          </article>
        </Reveal>)}
      </div>
    </section>
  )
}
