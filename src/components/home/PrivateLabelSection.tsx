import {ArrowRight} from 'lucide-react'
import {motion,useReducedMotion} from 'framer-motion'
import {Link} from '../../routing'
import {privateLabel} from './content'
import {Eyebrow,Reveal,SplitTitle,stagger} from './motion'

export default function PrivateLabelSection(){
  const reduce=useReducedMotion()
  return (
    <section className="hp-pl" aria-labelledby="hp-pl-title">
      <div className="hp-container">
        <div className="hp-pl__head">
          <Reveal>
            <Eyebrow tone="light">{privateLabel.eyebrow}</Eyebrow>
            <SplitTitle id="hp-pl-title" className="hp-title hp-title--light" lines={privateLabel.title} accent={privateLabel.accent}/>
          </Reveal>
          <Reveal delay={.08} className="hp-pl__intro">
            <p className="hp-lede hp-lede--light">{privateLabel.copy}</p>
            <div className="hp-actions">
              <Link className="hp-btn hp-btn--red" to={privateLabel.cta.to}>{privateLabel.cta.label}<ArrowRight aria-hidden="true"/></Link>
              <Link className="hp-link hp-link--light" to={privateLabel.secondary.to}>{privateLabel.secondary.label}<ArrowRight aria-hidden="true"/></Link>
            </div>
          </Reveal>
        </div>

        <motion.ul
          className="hp-pl__caps"
          aria-label="Manufacturing capabilities"
          variants={reduce?undefined:stagger.container}
          initial={reduce?false:'hidden'}
          whileInView="show"
          viewport={{once:true,amount:.3}}
        >
          {privateLabel.capabilities.map(({icon:Icon,label},index)=><motion.li key={label} variants={stagger.item}>
            <span>{String(index+1).padStart(2,'0')}</span>
            <Icon aria-hidden="true" strokeWidth={1.5}/>
            {label}
          </motion.li>)}
        </motion.ul>

        <div className="hp-pl__gallery">
          <Reveal className="hp-pl__main" y={40}>
            <img src={privateLabel.main.src} srcSet={privateLabel.main.srcSet} sizes="(min-width: 1024px) 50vw, 100vw" alt={privateLabel.main.alt} loading="lazy" decoding="async"/>
          </Reveal>
          {privateLabel.gallery.map((entry,index)=><Reveal key={entry.src} className={`hp-pl__shot${index===0?' hp-pl__shot--wide':''}`} delay={.08*(index+1)} y={40}>
            <figure>
              <img src={entry.src} srcSet={entry.srcSet} sizes="(min-width: 1024px) 25vw, 50vw" alt={entry.alt} loading="lazy" decoding="async"/>
              <figcaption>{entry.caption}</figcaption>
            </figure>
          </Reveal>)}
        </div>
      </div>
    </section>
  )
}
