import {Box,Factory,Gem,Globe2,Lightbulb,PackageCheck,Ruler,Scissors,ShieldCheck,Tag,Truck,Users,Wand2,Layers,Settings2,type LucideIcon} from 'lucide-react'
import {products} from '../../data'

/* ——————————————————————————————————————————————————————————————
   SKAWA homepage content.
   Everything the homepage says lives here so copy, links and verified
   facts can be updated without touching layout code.

   VERIFIED-DATA RULE: only publish numbers, testimonials, client logos
   and social profiles that SKAWA has confirmed. Sections that depend on
   them render only when their arrays below contain real entries.
   —————————————————————————————————————————————————————————————— */

type Img = {src:string;srcSet:string;alt:string}
const img=(name:string,widths:number[],alt:string):Img=>({
  src:`/images/home/${name}-${widths[widths.length-1]}.webp`,
  srcSet:widths.map(w=>`/images/home/${name}-${w}.webp ${w}w`).join(', '),
  alt,
})

/* —— Hero —— */
export const hero={
  eyebrow:'Custom fightwear · Built for what drives you',
  title:['Gear','that goes'],
  accent:'further.',
  copy:'Premium custom BJJ gis, rash guards, shorts, boxing gloves and combat apparel — built for athletes, academies and brands that expect more.',
  primary:{label:'Start a project',to:'/request-mockup?intent=home_project'},
  secondary:{label:'Explore our work',to:'/selected-fightwear'},
  athlete:{...img('hero-athlete',[640,960,1400],'Athlete from behind in a black and red SKAWA rash guard and fight shorts'),width:1400,height:1750},
  background:{desktop:img('hero-bg',[1280,1920],''),mobile:'/images/home/hero-bg-mobile-900.webp'},
}

export const trustPoints:{icon:LucideIcon;title:string;copy:string}[]=[
  {icon:Gem,title:'Premium quality',copy:'Built to last'},
  {icon:Globe2,title:'Worldwide shipping',copy:'Athletes everywhere'},
  {icon:Users,title:'Trusted by brands',copy:'Academies & athletes'},
]

/* —— How SKAWA works —— */
export const processIntro={
  eyebrow:'How SKAWA works',
  title:['From your idea',''],
  accent:'to the fight.',
  copy:'One transparent production path for athletes, academy collections and private-label brands — with a digital proof and a physical sample before anything goes into a full run.',
  cta:{label:'See the process',to:'/process'},
}

export const processSteps:{num:string;icon:LucideIcon;title:string;copy:string}[]=[
  {num:'01',icon:Lightbulb,title:'Share your vision',copy:'Tell us your goals, designs or ideas. We help refine every detail.'},
  {num:'02',icon:Settings2,title:'Design & sample',copy:'Develop designs, digital mockups and physical samples before volume.'},
  {num:'03',icon:Factory,title:'Production',copy:'Premium custom manufacturing with quality control at every stage.'},
  {num:'04',icon:Box,title:'Deliver & grow',copy:'Receive the collection, then reorder or scale your team or brand.'},
]

/* —— Three customer paths —— */
export const audiences=[
  {
    num:'01',
    category:'Athletes',
    title:['Customize','individual gear'],
    copy:'Create custom BJJ gis, rash guards, shorts, boxing gloves and more — made specifically for you.',
    cta:{label:'Start customizing',to:'/customize'},
    image:img('aud-athletes',[560,820],'Athlete in a SKAWA rash guard, fight shorts and MMA gloves'),
    position:'50% 18%',
  },
  {
    num:'02',
    category:'Gyms & academies',
    title:['Build your','academy collection'],
    copy:'Unify your team with premium custom apparel, free digital mockups and wholesale pricing.',
    cta:{label:'Outfit your academy',to:'/academy'},
    image:img('aud-academy',[640,1024],'Academy team wearing matching SKAWA training shirts'),
    position:'50% 30%',
  },
  {
    num:'03',
    category:'Fightwear brands',
    title:['Launch your','brand'],
    copy:'Create a professional fightwear label with SKAWA product development and manufacturing support.',
    cta:{label:'Start your brand',to:'/private-label'},
    image:img('aud-brands',[480,682],'Branded fightwear collection with packaging, hang tags and labels'),
    position:'50% 55%',
  },
]

/* —— Craftsmanship —— */
export const craftsmanship={
  eyebrow:'Craftsmanship',
  title:['Built in'],
  accent:'the details.',
  copy:'More than 30 years of manufacturing shows up where you look closest — the seams, the weave, the print and the label.',
  main:img('craft-stitch',[640,1024],'Needle stitching a SKAWA branded patch onto technical fabric'),
  details:[
    img('craft-gi',[560,1024],'Close-up of BJJ gi weave and a tied belt'),
    img('craft-embroidery',[560,1024],'Embroidery machine stitching a gold chevron onto black fabric'),
  ],
  notes:[
    {num:'01',title:'Reinforced construction',copy:'Stress points and seams built for hard training and competition.'},
    {num:'02',title:'Performance fabrics',copy:'Gi weaves, stretch rash guard knits and fight-short shells chosen per product.'},
    {num:'03',title:'Custom branding',copy:'Sublimation, embroidery, woven labels and patches placed exactly to your proof.'},
    {num:'04',title:'Production quality control',copy:'Size, color, stitching, print and spelling checked before anything is packed.'},
  ],
}

/* —— Product showcase —— */
export const showcase={
  eyebrow:'Product range',
  title:['Gear for'],
  accent:'every discipline.',
  copy:'Custom-ready products for BJJ, MMA, boxing and team training — each one available with your colors, artwork and labels.',
}

export const showcaseItems=[
  {key:'gis',bg:'#efefef',label:'BJJ gis',title:'Custom BJJ gis',copy:'Pearl weave and ripstop options, adult and kids sizing, embroidery, patches and woven labels.',tags:['Pearl / ripstop','Adult & kids','Embroidery'],to:'/shop?category=GIs',cta:'Shop BJJ gis',image:img('cat-bjj-gi-white',[640,1024],'White SKAWA BJJ gi with black belt')},
  {key:'rash',bg:'#f8f8f8',label:'Rash guards',title:'Custom rash guards',copy:'Short and long sleeve rash guards in performance knits with full sublimation and ranked colorways.',tags:['Full sublimation','Short / long sleeve','Ranked series'],to:'/shop?category=Rash%20Guards',cta:'Shop rash guards',image:img('cat-rashguard',[640,1024],'Black SKAWA rash guard with red sublimated graphics')},
  {key:'shorts',bg:'#f8f8f8',label:'Fight shorts',title:'Custom fight shorts',copy:'MMA, grappling and Muay Thai cuts with sublimated panels, reinforced splits and your sponsor zones.',tags:['MMA & grappling','Sublimated panels','Sponsor zones'],to:'/shop?category=Fight%20Shorts',cta:'Shop fight shorts',image:img('cat-fight-shorts',[640,1024],'Black SKAWA fight shorts with red and white graphics')},
  {key:'gloves',bg:'#f4f4f4',label:'Boxing gloves',title:'Custom boxing gloves',copy:'Training and sparring gloves in synthetic or leather builds, with custom colorways and logos.',tags:['Synthetic / leather','Training & sparring','Custom logos'],to:'/shop?category=Gloves',cta:'Shop gloves',image:img('cat-boxing-gloves',[640,1024],'Pair of black SKAWA boxing gloves with red trim')},
  {key:'track',bg:'#f2f2f2',label:'Tracksuits',title:'Tracksuits & teamwear',copy:'Track jackets and team apparel built as part of an academy or brand collection, quoted per program.',tags:['Academy kits','Embroidered crests','Quoted per program'],to:'/academy',cta:'Plan a team kit',image:img('cat-trackjacket',[640,1024],'Black SKAWA track jacket with red sleeve graphics')},
  {key:'bags',bg:'#f7f7f7',label:'Custom bags',title:'Custom gear bags',copy:'Duffels and training bags in durable nylon and polyester, branded for your academy or label.',tags:['Durable nylon','Academy branding','Private label'],to:'/shop?category=Bags',cta:'Shop bags',image:img('cat-gear-bag',[640,1024],'Black SKAWA gear duffel bag with red graphics')},
]

/* —— Customization preview —— */
export const customizer={
  eyebrow:'Design Lab',
  title:['Your gear.'],
  accent:'Your identity.',
  copy:'Pick a product, set your colors, place your logo and name, then save a design ID you can send straight into a quote.',
  features:['Color','Logo','Pattern','Name','Fabric','Placement'],
  cta:{label:'Customize your gear',to:'/customize?product=fight-short'},
  secondary:{label:'Request a free mockup',to:'/request-mockup?intent=mockup'},
}

/** Real SKAWA fight-short colorways (not recolored renders). */
export const shortsColorways=[
  {key:'red',label:'Crimson strike',swatch:'#c8141e',image:img('shorts-red',[440,720],'SKAWA fight shorts, black with crimson strike panels')},
  {key:'gold',label:'Gold edge',swatch:'#c9a24a',image:img('shorts-gold',[440,720],'SKAWA fight shorts, black with gold edge panels')},
  {key:'white',label:'Silver line',swatch:'#dcdcd8',image:img('shorts-white',[440,720],'SKAWA fight shorts, white with gold and black panels')},
  {key:'camo',label:'Urban camo',swatch:'#4b4d50',image:img('shorts-camo',[440,720],'SKAWA fight shorts in grey urban camo')},
]

/** Print zones shown on the preview (percent positions over the product photo). */
export const placementZones=[
  {key:'waist',label:'Waistband logo',x:50,y:27},
  {key:'left',label:'Left leg panel',x:31,y:58},
  {key:'right',label:'Right leg panel',x:69,y:58},
]

/* —— Academy collections —— */
export const academy={
  eyebrow:'Academy collections',
  title:['One team.'],
  accent:'One identity.',
  copy:'SKAWA builds coordinated collections for BJJ academies, MMA gyms and boxing clubs — one color system and one logo set carried across every product, then saved so reorders take minutes, not months.',
  lineup:img('academy-lineup',[900,1600],'Coordinated SKAWA collection: gi, rash guard, track jacket, fight shorts, gear bag and shin guards'),
  team:img('academy-team',[800,1400],'Academy athletes walking into the gym in matching SKAWA training gear'),
  items:['Rash guards','Fight shorts','BJJ gis','Tracksuits','Training shirts','Gear bags'],
  points:[
    {icon:Wand2,title:'Free digital mockups',copy:'See your crest and colors on the whole kit first.'},
    {icon:PackageCheck,title:'Sample before bulk',copy:'Train in a physical sample before sizing the run.'},
    {icon:Tag,title:'Wholesale pricing',copy:'Protected pricing for approved academies.'},
    {icon:Layers,title:'Saved specifications',copy:'Every approved design stored for fast reorders.'},
  ],
  cta:{label:'Build your academy collection',to:'/academy'},
  secondary:{label:'Apply for wholesale',to:'/request-mockup?intent=wholesale_apply'},
}

/* —— Private label —— */
export const privateLabel={
  eyebrow:'Private-label manufacturing',
  title:['Your brand.'],
  accent:'Our production.',
  copy:'From first sketch to packed cartons, SKAWA develops and manufactures fightwear under your label — with samples and proof approval before every run.',
  capabilities:[
    {icon:Lightbulb,label:'Product development'},
    {icon:Wand2,label:'Custom design'},
    {icon:Scissors,label:'Sampling'},
    {icon:Factory,label:'Manufacturing'},
    {icon:Tag,label:'Custom labels'},
    {icon:Box,label:'Packaging'},
    {icon:Truck,label:'Worldwide delivery'},
    {icon:ShieldCheck,label:'Quality control'},
  ],
  main:img('pl-collection',[640,1024],'Private-label BJJ gis and rash guards laid out with custom branding'),
  gallery:[
    {...img('pl-label',[700,1400],'Woven brand label stitched onto a fight-short waistband'),caption:'Custom labels'},
    {...img('pl-design',[560,1024],'Design table with fabric swatches, sketches and a digital short design'),caption:'Design & sampling'},
    {...img('pl-fulfill',[560,1024],'Warehouse aisle stacked with SKAWA shipping cartons'),caption:'Packing & delivery'},
  ],
  cta:{label:'Launch your brand',to:'/private-label'},
  secondary:{label:'Order a sample kit',to:'/sample-kit'},
}

/* —— Offers (PRD: free mockup + sample kit) —— */
export const offers=[
  {icon:Wand2,eyebrow:'Free for academies & brands',title:'Free digital mockup',copy:'See your logo, colors and placement on the actual product before you commit to a quantity.',cta:{label:'Request a mockup',to:'/request-mockup?intent=mockup'}},
  {icon:Ruler,eyebrow:'Feel it first',title:'Sample kit',copy:'Fabric swatches, print and embroidery samples, labels and packaging — reviewed before volume production.',cta:{label:'Request a sample kit',to:'/sample-kit'}},
]

/* —— Proof: verified facts, testimonials, logos ——
   Numeric facts must come from SKAWA. `null` values are hidden.
   Add confirmed figures here (e.g. countriesServed: 50) to publish them. */
const categoryCount=new Set(products.map(product=>product.category)).size

export const siteFacts:{
  yearsManufacturing:number|null
  countriesServed:number|null
  brandsServed:number|null
  piecesDelivered:number|null
}={
  yearsManufacturing:30, // About page: "30+ years manufacturing"
  countriesServed:null,
  brandsServed:null,
  piecesDelivered:null,
}

export type Stat={value:number;suffix?:string;label:string}
export const stats:Stat[]=[
  siteFacts.yearsManufacturing?{value:siteFacts.yearsManufacturing,suffix:'+',label:'Years manufacturing'}:null,
  siteFacts.brandsServed?{value:siteFacts.brandsServed,suffix:'+',label:'Brands trust us'}:null,
  siteFacts.countriesServed?{value:siteFacts.countriesServed,suffix:'+',label:'Countries served'}:null,
  siteFacts.piecesDelivered?{value:siteFacts.piecesDelivered,suffix:'+',label:'Pieces delivered'}:null,
  {value:categoryCount,label:'Product categories'},
  {value:9,label:'Tracked production stages'},
].filter((stat):stat is Stat=>Boolean(stat)).slice(0,3)

export const proof={
  eyebrow:'Trusted worldwide',
  title:['Real brands.'],
  accent:'Real impact.',
  copy:'Custom gear for BJJ, MMA and boxing programs, produced with the same proof-and-sample discipline on every order.',
  background:img('proof-bg',[900,1400],''),
  motto:['Fight','builds','better','people.'],
}

/** Verified customer quotes only. Leave empty until SKAWA supplies approved testimonials. */
export const testimonials:{quote:string;name:string;role:string;organization:string;country:string}[]=[]

/** Shown in the testimonial card while `testimonials` is empty: SKAWA's own production commitments. */
export const commitments=[
  {quote:'Every design gets a digital proof you can mark up before any cloth is cut.',title:'Proof first',meta:'The SKAWA standard · 01'},
  {quote:'The first physical piece is for fit and print. You train in it, then we adjust.',title:'Then a sample',meta:'The SKAWA standard · 02'},
  {quote:'Once the sample is approved, production follows the same spec — weave, color and artwork.',title:'Then the run',meta:'The SKAWA standard · 03'},
  {quote:'Approved specifications are saved, so your next order starts where the last one finished.',title:'Then the reorder',meta:'The SKAWA standard · 04'},
]

/** Approved client logos only (monochrome SVG/PNG paths). Empty = logo wall hidden. */
export const clientLogos:{name:string;src:string}[]=[]

export const disciplines=['Brazilian jiu-jitsu','MMA','Boxing','Muay Thai','Grappling','Judo','Karate','Team training']

/* —— Final CTA —— */
export const finalCta={
  eyebrow:'Start a project',
  title:['Ready to build','your next'],
  accent:'collection?',
  copy:'Whether you’re an athlete, academy or emerging fightwear brand, SKAWA can help take your idea from concept to production.',
  primary:{label:'Start a project',to:'/request-mockup?intent=home_project'},
  secondary:{label:'Talk to SKAWA',to:'/request-mockup?intent=contact'},
  image:img('final-athletes',[480,682],'Fighters in black SKAWA training gear standing in a dark gym'),
}

/* —— Footer —— */
export const footerColumns=[
  {title:'Custom gear',links:[
    {label:'Academy collections',to:'/academy'},
    {label:'Individual gear',to:'/customize'},
    {label:'BJJ',to:'/shop?category=GIs'},
    {label:'MMA',to:'/shop?category=Fight%20Shorts'},
    {label:'Boxing',to:'/shop?category=Gloves'},
    {label:'Shop all products',to:'/shop'},
  ]},
  {title:'Company',links:[
    {label:'About',to:'/about'},
    {label:'Process',to:'/process'},
    {label:'Private label',to:'/private-label'},
    {label:'Client work',to:'/selected-fightwear'},
    {label:'Contact',to:'/request-mockup?intent=contact'},
  ]},
  {title:'Support',links:[
    {label:'Track an order',to:'/track'},
    {label:'Sample kit',to:'/sample-kit'},
    {label:'FAQ',to:'/request-mockup?intent=support'},
    {label:'Sizing help',to:'/request-mockup?intent=sizing'},
    {label:'Policies',to:'/terms'},
  ]},
]

/** Official profiles only. An entry without a URL is not rendered. */
export const socialProfiles:{label:string;url:string|null}[]=[
  {label:'Instagram',url:null},
  {label:'YouTube',url:null},
  {label:'TikTok',url:null},
]
