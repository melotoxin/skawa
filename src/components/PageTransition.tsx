import {useEffect,useRef,type ReactNode} from 'react'

const SITE_ORIGIN='https://skawafight.com'

const pageMeta:Record<string,{title:string;description:string}>={
  '/':{title:'SKAWA FIGHT — Custom Fightwear Manufacturer for Athletes, Academies & Brands',description:'Custom BJJ gis, rash guards, fight shorts, boxing gloves and teamwear. SKAWA Fight designs, samples and manufactures custom fightwear for athletes, academies and private-label brands.'},
  '/shop':{title:'Shop Fightwear — SKAWA FIGHT',description:'Explore custom-ready fight shorts, rash guards and academy teamwear.'},
  '/customize':{title:'Fightwear Design Lab — SKAWA FIGHT',description:'Build a production-ready fightwear concept with colors, text and artwork.'},
  '/academy':{title:'Gym & Academy Program — SKAWA FIGHT',description:'Coordinated custom gear, samples and reorder support for fight academies.'},
  '/private-label':{title:'Private-Label Manufacturing — SKAWA FIGHT',description:'Develop branded fightwear from materials and samples through packing.'},
  '/process':{title:'Manufacturing Process — SKAWA FIGHT',description:'See the design, approval, manufacturing, quality and delivery workflow.'},
  '/track':{title:'Track an Order — SKAWA FIGHT',description:'Follow a SKAWA production order through its nine-stage timeline.'},
  '/sample-kit':{title:'Sample Kit — SKAWA FIGHT',description:'Review fightwear fabric, decoration, label and packaging samples.'},
  '/request-mockup':{title:'Start a Fightwear Project — SKAWA FIGHT',description:'Share a focused academy, athlete or private-label production brief.'},
  '/selected-fightwear':{title:'Selected Fightwear Concepts — SKAWA FIGHT',description:'Explore clearly labeled fightwear direction concepts and product systems.'},
  '/work':{title:'Selected Fightwear Concepts — SKAWA FIGHT',description:'Explore clearly labeled fightwear direction concepts and product systems.'},
  '/about':{title:'About SKAWA FIGHT',description:'Three decades of custom BJJ, MMA and boxing gear for brands, academies and athletes.'},
  '/account':{title:'Project Hub — SKAWA FIGHT',description:'Review locally saved designs, project briefs and bag items.'},
  '/privacy':{title:'Privacy Policy — SKAWA FIGHT',description:'How SKAWA FIGHT handles project briefs, saved designs and contact details.'},
  '/terms':{title:'Terms of Service — SKAWA FIGHT',description:'Terms covering SKAWA FIGHT quotes, samples, approvals and production.'},
  '/cookies':{title:'Cookie Policy — SKAWA FIGHT',description:'How SKAWA FIGHT uses browser storage and cookies.'},
}

export default function PageTransition({route,children}:{route:string;children:ReactNode}){
  const firstRender=useRef(true)
  const path=route.split('?')[0]
  const pageLabel=path==='/'?'Home':path.split('/').filter(Boolean).join(' ').replace(/\b\w/g,letter=>letter.toUpperCase())||'Page'

  useEffect(()=>{
    const meta=pageMeta[path]
    if(meta){
      document.title=meta.title
      document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content',meta.description)
      document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content',meta.title)
      document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content',meta.description)
    }
    const url=`${SITE_ORIGIN}${path==='/'?'/':path.replace(/\/$/,'')}`
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href',url)
    document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content',url)
    const main=document.querySelector<HTMLElement>('main')
    if(!main)return
    main.id='main-content'
    if(firstRender.current){firstRender.current=false;return}
    if(!main.hasAttribute('tabindex'))main.tabIndex=-1
    main.focus({preventScroll:true})
  },[path,route])

  return <div className="route-stage" key={route}>
    <span className="route-progress" aria-hidden="true"/>
    <span className="route-announcement" role="status" aria-live="polite">{pageLabel} loaded</span>
    {children}
  </div>
}
