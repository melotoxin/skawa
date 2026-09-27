import {ArrowRight} from 'lucide-react'
import {Link} from '../../routing'
import {audiences} from './content'
import {Reveal} from './motion'

type Audience=typeof audiences[number]

export function AudienceCard({audience,index}:{audience:Audience;index:number}){
  const titleId=`hp-aud-${audience.num}`
  return (
    <Reveal className="hp-aud__item" delay={index*.08}>
      <article className="hp-aud-card" aria-labelledby={titleId}>
        <img
          className="hp-aud-card__img"
          src={audience.image.src}
          srcSet={audience.image.srcSet}
          sizes="(min-width: 1024px) 31vw, (min-width: 640px) 50vw, 100vw"
          alt={audience.image.alt}
          loading="lazy"
          decoding="async"
          style={{objectPosition:audience.position}}
        />
        <span className="hp-aud-card__num" aria-hidden="true">{audience.num}</span>
        {/* Pointer-only hit area so the whole card is clickable; the CTA below is the accessible link. */}
        <Link className="hp-aud-card__hit" to={audience.cta.to} tabIndex={-1} aria-hidden="true"/>
        <div className="hp-aud-card__panel">
          <p className="hp-aud-card__category">{audience.category}</p>
          <h3 id={titleId} className="hp-aud-card__title">{audience.title.map(line=><span key={line} className="hp-line">{line}</span>)}</h3>
          <p className="hp-aud-card__copy">{audience.copy}</p>
          <Link className="hp-btn hp-btn--red hp-btn--sm hp-aud-card__cta" to={audience.cta.to}>
            {audience.cta.label}<ArrowRight aria-hidden="true"/>
          </Link>
        </div>
      </article>
    </Reveal>
  )
}

export default function AudienceSection(){
  return (
    <section className="hp-aud" aria-labelledby="hp-aud-title">
      <div className="hp-container">
        <Reveal className="hp-aud__head">
          <p className="hp-eyebrow">Choose your path</p>
          <h2 id="hp-aud-title" className="hp-title hp-title--sm">Three ways to build <span className="hp-accent">with SKAWA.</span></h2>
        </Reveal>
        <div className="hp-aud__grid">
          {audiences.map((audience,index)=><AudienceCard key={audience.num} audience={audience} index={index}/>)}
        </div>
      </div>
    </section>
  )
}
