import {clientLogos,disciplines} from './content'
import {Eyebrow,Reveal} from './motion'

/**
 * Approved client logos as a slow monochrome marquee. Until SKAWA supplies approved logos,
 * the band shows the disciplines SKAWA builds for instead of inventing clients.
 */
export default function LogoWall(){
  const hasLogos=clientLogos.length>0
  const items=hasLogos
    ?clientLogos.map(logo=><img key={logo.name} src={logo.src} alt={logo.name} loading="lazy"/>)
    :disciplines.map(name=><span key={name}>{name}</span>)
  return (
    <section className="hp-wall" aria-labelledby="hp-wall-title">
      <Reveal className="hp-container hp-wall__head">
        <Eyebrow>{hasLogos?'Trusted by teams':'Every discipline'}</Eyebrow>
        <h2 id="hp-wall-title" className="hp-title hp-title--sm">Built for athletes. <span className="hp-accent">Trusted by teams.</span></h2>
      </Reveal>
      <div className="hp-wall__marquee">
        <div className="hp-wall__track">
          <div className="hp-wall__set">{items}</div>
          <div className="hp-wall__set" aria-hidden="true">{items}</div>
        </div>
      </div>
    </section>
  )
}
