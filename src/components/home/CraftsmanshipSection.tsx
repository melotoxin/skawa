import {motion,useReducedMotion,useScroll,useTransform} from 'framer-motion'
import {useRef} from 'react'
import {craftsmanship} from './content'
import {Eyebrow,Reveal,SplitTitle,stagger} from './motion'

/** Annotation markers pinned over the main close-up (percent positions). */
const markers=[
  {num:'01',label:'Reinforced stitching',x:55,y:36},
  {num:'03',label:'Branded patch',x:38,y:66},
]

export default function CraftsmanshipSection(){
  const reduce=Boolean(useReducedMotion())
  const stage=useRef<HTMLDivElement>(null)
  const section=useRef<HTMLElement>(null)
  // The scroll moment: the close-up enters oversized and clipped, then settles as it reaches mid-screen.
  const {scrollYProgress:enter}=useScroll({target:stage,offset:['start end','center center']})
  const scale=useTransform(enter,[0,1],[reduce?1:1.26,1])
  const clip=useTransform(enter,[0,1],reduce?['inset(0% 0% 0% 0% round 16px)','inset(0% 0% 0% 0% round 16px)']:['inset(10% 12% 10% 12% round 32px)','inset(0% 0% 0% 0% round 16px)'])
  const markerOpacity=useTransform(enter,[.72,1],[reduce?1:0,1])
  const {scrollYProgress:pass}=useScroll({target:section,offset:['start end','end start']})
  const detailY=useTransform(pass,[0,1],[reduce?0:36,reduce?0:-36])

  return (
    <section ref={section} className="hp-craft" aria-labelledby="hp-craft-title">
      <div className="hp-container hp-craft__grid">
        <div className="hp-craft__copy">
          <Reveal>
            <Eyebrow>{craftsmanship.eyebrow}</Eyebrow>
            <SplitTitle id="hp-craft-title" className="hp-title" lines={craftsmanship.title} accent={craftsmanship.accent}/>
            <p className="hp-lede">{craftsmanship.copy}</p>
          </Reveal>
          <motion.ol
            className="hp-craft__notes"
            variants={reduce?undefined:stagger.container}
            initial={reduce?false:'hidden'}
            whileInView="show"
            viewport={{once:true,amount:.3}}
          >
            {craftsmanship.notes.map(note=><motion.li key={note.num} variants={stagger.item}>
              <span className="hp-craft__num">{note.num}</span>
              <div><h3>{note.title}</h3><p>{note.copy}</p></div>
            </motion.li>)}
          </motion.ol>
        </div>

        <div className="hp-craft__visual">
          <div ref={stage} className="hp-craft__stage">
            <motion.div className="hp-craft__frame" style={{clipPath:clip}}>
              <motion.img
                src={craftsmanship.main.src}
                srcSet={craftsmanship.main.srcSet}
                sizes="(min-width: 1024px) 56vw, 100vw"
                alt={craftsmanship.main.alt}
                loading="lazy"
                decoding="async"
                style={{scale}}
              />
              {markers.map(marker=><motion.span
                key={marker.num}
                className="hp-craft__marker"
                style={{left:`${marker.x}%`,top:`${marker.y}%`,opacity:markerOpacity}}
                aria-hidden="true"
              ><b>{marker.num}</b><span>{marker.label}</span></motion.span>)}
            </motion.div>
          </div>
          <motion.div className="hp-craft__details" style={{y:detailY}}>
            {craftsmanship.details.map(detail=><figure key={detail.src} className="hp-craft__detail">
              <img src={detail.src} srcSet={detail.srcSet} sizes="(min-width: 1024px) 26vw, 50vw" alt={detail.alt} loading="lazy" decoding="async"/>
            </figure>)}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
