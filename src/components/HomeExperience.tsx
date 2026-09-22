import {ArrowRight,Factory,Palette,ShieldCheck,Shirt,Users} from 'lucide-react'
import {Link} from '../routing'
import {LazyFightShortsScene} from './three'
import './home-experience.css'

const paths=[
  {index:'01',title:'ATHLETES',heading:'CUSTOMIZE INDIVIDUAL GEAR',copy:'Build a personal fightwear concept with your colors, text and artwork.',cta:'START CUSTOMIZING',to:'/customize',image:'/images/hero-fighter.webp',className:'athlete'},
  {index:'02',title:'GYMS & ACADEMIES',heading:'BUILD YOUR ACADEMY COLLECTION',copy:'Coordinate wholesale products, mockups, samples and recurring reorders.',cta:'BUILD YOUR COLLECTION',to:'/academy',image:'/images/academy-team.webp',className:'academy'},
  {index:'03',title:'FIGHTWEAR BRANDS',heading:'LAUNCH YOUR BRAND',copy:'Move from product brief through private-label production and packing.',cta:'START YOUR BRAND',to:'/private-label',image:'/images/private-label.webp',className:'brand'},
]

export function CustomerPaths(){
  return <section className="home-paths" aria-labelledby="paths-title"><header><span>CHOOSE YOUR CORNER</span><h2 id="paths-title">THREE WAYS<br/><em>TO BUILD.</em></h2><p>Start with the path that fits your role. Every route leads to a focused product and production brief.</p></header><div className="home-path-panels">{paths.map(path=><article className={path.className} key={path.index}><img src={path.image} alt="" loading="lazy"/><div className="home-path-shade"/><div className="home-path-index">{path.index}</div><div className="home-path-copy"><span>{path.title}</span><h3>{path.heading}</h3><p>{path.copy}</p><Link to={path.to}>{path.cta}<ArrowRight/></Link></div></article>)}</div></section>
}

const callouts=[
  [Shirt,'PERFORMANCE FABRICS','Replaceable material configuration'],
  [ShieldCheck,'REINFORCED STITCHING','Production construction zone'],
  [Palette,'CUSTOM BRANDING','Front, back and side artwork zones'],
  [Factory,'PRODUCTION-GRADE PRINTING','Sublimation-ready architecture'],
] as const

export function BuiltToFight(){
  return <section className="built-fight" aria-labelledby="built-fight-title"><div className="built-fight-copy"><span>TRUE 3D PRODUCT DEMO</span><h2 id="built-fight-title">BUILT<br/><em>TO FIGHT.</em></h2><p>This procedural fight-short model uses real WebGL geometry, lighting and material response. It is an honest demo placeholder structured for replacement by an approved production GLB and UV maps.</p><Link to="/customize">OPEN THE DESIGN LAB <ArrowRight/></Link></div><LazyFightShortsScene className="built-fight-scene"/><div className="built-fight-callouts" aria-label="Product construction capabilities">{callouts.map(([Icon,title,detail],index)=><article key={title}><b>0{index+1}</b><Icon aria-hidden="true"/><div><h3>{title}</h3><p>{detail}</p></div></article>)}</div></section>
}

const categories=[
  {name:'JIU JITSU GIS',meta:'ADULT · KIDS · CUSTOM',image:'/images/products/bjj-gi-1.png',to:'/shop?category=GIs'},
  {name:'RASH GUARDS',meta:'RANKED · CUSTOM · ACADEMY',image:'/images/products/full-sleeves-1.png',to:'/shop?category=Rash%20Guards'},
  {name:'FIGHT SHORTS',meta:'GRAPPLING · MMA · BOXING',image:'/images/shorts-gold.webp',to:'/shop?category=Fight%20Shorts'},
]

export function EditorialCategories(){
  return <section className="editorial-categories" aria-labelledby="categories-title"><header><span>PRODUCT DIRECTIONS</span><h2 id="categories-title">GEAR WITH<br/><em>A PURPOSE.</em></h2><p>The current imagery is a curated demo set. The catalog architecture is ready for verified category photography and production specifications.</p></header><div>{categories.map((category,index)=><article key={category.name}><div className="category-visual"><span>0{index+1}</span><img src={category.image} alt={`${category.name.toLowerCase()} product direction`} loading="lazy"/></div><div className="category-copy"><small>{category.meta}</small><h3>{category.name}</h3><Link to={category.to}>EXPLORE <ArrowRight/></Link></div></article>)}</div></section>
}

export function GlobalPromise(){
  return <section className="home-global"><Users aria-hidden="true"/><div><span>ATHLETES · ACADEMIES · BRANDS</span><h2>ONE PRODUCTION LANGUAGE.<br/>BUILT FOR EVERY CORNER.</h2></div><Link className="ref-btn red" to="/request-mockup">START A PROJECT</Link></section>
}
