import {ArrowRight,Check} from 'lucide-react'
import {AnimatePresence,motion,useReducedMotion} from 'framer-motion'
import {useId,useState,type CSSProperties} from 'react'
import {Link} from '../../routing'
import {customizer,placementZones,shortsColorways} from './content'
import {Eyebrow,Reveal,SplitTitle,ease} from './motion'

const fabrics=['Fight satin','Micro-stretch','Four-way stretch']

export default function CustomizerPreview(){
  const reduce=useReducedMotion()
  const [colorway,setColorway]=useState(0)
  const [zone,setZone]=useState(placementZones[1].key)
  const [name,setName]=useState('')
  const [fabric,setFabric]=useState(fabrics[0])
  const nameId=useId()
  const current=shortsColorways[colorway]
  const activeZone=placementZones.find(entry=>entry.key===zone)!

  return (
    <section className="hp-custom" aria-labelledby="hp-custom-title">
      <div className="hp-container hp-custom__grid">
        <Reveal className="hp-custom__intro">
          <Eyebrow>{customizer.eyebrow}</Eyebrow>
          <SplitTitle id="hp-custom-title" className="hp-title" lines={customizer.title} accent={customizer.accent}/>
          <p className="hp-lede">{customizer.copy}</p>
          <ul className="hp-custom__features" aria-label="What you can customize">
            {customizer.features.map(feature=><li key={feature}><Check aria-hidden="true"/>{feature}</li>)}
          </ul>
          <div className="hp-actions">
            <Link className="hp-btn hp-btn--red" to={customizer.cta.to}>{customizer.cta.label}<ArrowRight aria-hidden="true"/></Link>
            <Link className="hp-link" to={customizer.secondary.to}>{customizer.secondary.label}<ArrowRight aria-hidden="true"/></Link>
          </div>
        </Reveal>

        <Reveal className="hp-custom__demo" delay={.1} y={36}>
          <div className="hp-custom__preview" aria-label={`Preview: ${current.label} fight shorts, logo zone ${activeZone.label}`} role="img">
            <span className="hp-custom__badge" aria-hidden="true">Live preview</span>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img
                key={current.key}
                src={current.image.src}
                srcSet={current.image.srcSet}
                sizes="(min-width: 1024px) 30vw, 70vw"
                alt=""
                loading="lazy"
                decoding="async"
                initial={reduce?false:{opacity:0,y:16,scale:.97}}
                animate={{opacity:1,y:0,scale:1}}
                exit={reduce?{opacity:1}:{opacity:0,y:-8,scale:1.02}}
                transition={{duration:.55,ease}}
              />
            </AnimatePresence>
            {placementZones.map(entry=><span
              key={entry.key}
              className={`hp-custom__zone${entry.key===zone?' is-on':''}`}
              style={{left:`${entry.x}%`,top:`${entry.y}%`}}
              aria-hidden="true"
            >{entry.key===zone&&<b>{name.trim()?name.trim().toUpperCase():'Logo zone'}</b>}</span>)}
          </div>

          <div className="hp-custom__panel">
            <fieldset>
              <legend>Colorway <span>{current.label}</span></legend>
              <div className="hp-custom__swatches">
                {shortsColorways.map((entry,index)=><button
                  key={entry.key}
                  type="button"
                  className="hp-custom__swatch"
                  style={{'--swatch':entry.swatch} as CSSProperties}
                  aria-pressed={index===colorway}
                  aria-label={entry.label}
                  onClick={()=>setColorway(index)}
                />)}
              </div>
            </fieldset>
            <fieldset>
              <legend>Placement</legend>
              <div className="hp-custom__chips">
                {placementZones.map(entry=><button key={entry.key} type="button" aria-pressed={entry.key===zone} onClick={()=>setZone(entry.key)}>{entry.label}</button>)}
              </div>
            </fieldset>
            <label className="hp-custom__field" htmlFor={nameId}>
              <span>Name or number</span>
              <input id={nameId} value={name} maxLength={14} onChange={event=>setName(event.target.value)} placeholder="e.g. SILVA 07" autoComplete="off"/>
            </label>
            <fieldset>
              <legend>Fabric</legend>
              <div className="hp-custom__chips">
                {fabrics.map(entry=><button key={entry} type="button" aria-pressed={entry===fabric} onClick={()=>setFabric(entry)}>{entry}</button>)}
              </div>
            </fieldset>
            <p className="hp-custom__note">Preview only — the Design Lab saves your full design with a unique ID for quoting.</p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
