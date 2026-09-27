import {Component,Suspense,lazy,useEffect,useMemo,useRef,useState,type ChangeEvent,type PointerEvent,type ReactNode,type CSSProperties,type RefObject} from 'react'
import {ArrowLeft,ArrowRight,Check,Download,ImagePlus,RotateCcw,RotateCw,Save,Upload,X,ZoomIn,ZoomOut} from 'lucide-react'
import {products} from '../data'
import {go} from '../routing'
import {defaultDesign,defaultSize,downloadFile,fonts,isDesign,paintDesign,palette,patterns,readDesigns,type Design,type DesignSide,type Placement,type SavedDesign,type ZonePlacement} from '../lib/customDesign'
import {moveArt,pickArt,type ArtKey,type ArtTarget} from '../lib/artPlacement'
import {getTemplate} from '../lib/customizer2d/templates'
import {preloadTemplate} from '../lib/customizer2d/compose'
import {artBox,findZone,resolvePlacement,withPlacement} from '../lib/customizer2d/placement'
import {analyzeLogo,contrast,MIN_CONTRAST,MIN_SHARPNESS,MIN_TEXT_PX,nearestColor,type LogoInfo} from '../lib/customizer2d/quality'
import {textRatio} from '../lib/customizer2d/fonts'
import type {ZoneKind} from '../lib/customizer2d/types'
import Proof2D from './customizer2d/Proof2D'
import ZonePlacementFields from './customizer2d/ZonePlacementFields'
import {exportPhoto,exportTemplated} from '../lib/customizer2d/export'
import '../design-lab.css'

const Scene=lazy(()=>import('./three/DesignPreview3D'))
const tabs=['Product','Design','Logos','Text','Review'] as const
type Tab=typeof tabs[number]
const presets=products.filter(p=>p.custom)
const gearCategories=new Set(['Gloves','Protective Gear','Bags','Accessories','Training Equipment','Training'])
const apparelSize=/^(YXS|YS|YM|YL|YXL|XS|S|M|L|XL|XXL|XXXL|XXXXL|Small|Medium|Large|XLarge|XXLarge|XXXLarge|XXXXLarge|XXlarge|WXS|WSmall|WMedium|WLarge|WXL|WXXL|WXXXL)$/i
function sizesFor(product:{category:string;sizes:string[]}){
  const list=product.sizes.length?product.sizes:['S','M','L','XL']
  if(!gearCategories.has(product.category))return list
  const gear=list.filter(size=>!apparelSize.test(size))
  return gear.length?gear:['One size']
}
function canUseWebGL(){
  try{
    const canvas=document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2')||canvas.getContext('webgl'))
  }catch{return false}
}
function initialDesign(){
  const params=new URLSearchParams(location.search),saved=readDesigns().find(d=>d.id===params.get('design'))
  if(isDesign(saved)&&presets.some(p=>p.id===saved.productId))return saved
  const requested=params.get('product')||params.get('id')
  return defaultDesign(presets.find(p=>p.slug===requested||String(p.id)===requested)||presets.find(p=>p.slug==='fight-short')||presets[0])
}
class PreviewBoundary extends Component<{children:ReactNode;fallback:ReactNode},{failed:boolean}>{
  state={failed:false}
  static getDerivedStateFromError(){return {failed:true}}
  render(){return this.state.failed?this.props.fallback:this.props.children}
}
function ColorField({label,value,onChange,options}:{label:string;value:string;onChange:(color:string)=>void;options?:string[]}){
  return <fieldset className="dl-colors"><legend>{label}</legend><div>{(options??palette).map(hex=><button type="button" key={hex} aria-label={`${label} ${hex}`} aria-pressed={hex===value} style={{background:hex}} onClick={()=>onChange(hex)}>{hex===value&&<Check style={{color:hex==='#f0f0ed'?'#111':'white'}}/>}</button>)}{!options&&<label className="dl-picker" title={`Choose any ${label.toLowerCase()}`}><input type="color" aria-label={`Custom ${label.toLowerCase()}`} value={value} onChange={e=>onChange(e.target.value)}/><span>+</span></label>}</div><small>{value.toUpperCase()}</small></fieldset>
}
function PlacementFields({label,value,onChange,onView,mirror,onMirror}:{label:string;value:Placement;onChange:(p:Placement)=>void;onView:(side:DesignSide)=>void;mirror:boolean;onMirror:(on:boolean)=>void}){
  return <fieldset className="dl-placement"><legend>{label} placement</legend><label className="dl-check"><input type="checkbox" checked={mirror} onChange={e=>onMirror(e.target.checked)}/>Show on both sides</label><p className="dl-help">On, this {label.toLowerCase()} prints on the front and the back. Off, it stays on the side where you place it.</p><label>Print side<select value={value.side} onChange={e=>{const side=e.target.value as DesignSide;onChange({...value,side});onView(side)}}><option value="front">Front</option><option value="back">Back</option></select></label>{(['x','y','size','rotation'] as const).map(key=><label key={key}>{({x:'Horizontal',y:'Vertical',size:'Size',rotation:'Rotation'})[key]}<output>{value[key]}{key==='rotation'?'°':'%'}</output><input type="range" aria-label={`${label} ${({x:'horizontal',y:'vertical',size:'size',rotation:'rotation'})[key]}`} min={key==='rotation'?-180:key==='size'?2:0} max={key==='rotation'?180:key==='size'?35:100} value={value[key]} onChange={e=>onChange({...value,[key]:Number(e.target.value)})}/></label>)}<button type="button" className="dl-secondary" onClick={()=>onChange({...value,x:50,y:50,rotation:0})}>Center {label.toLowerCase()}</button><p className="dl-help">Drag it on the preview. In the 2D proof, drag it from one side onto the other.</p></fieldset>
}

function PhotoSide({src,side,art,textColor,font,logo,rendered,active,imgRef,onPointerDown,onPointerMove}:{src:string;side:DesignSide;art:ArtTarget;textColor:string;font:string;logo:string;rendered:boolean;active:ArtKey|null;imgRef:RefObject<HTMLImageElement|null>;onPointerDown:(event:PointerEvent<HTMLImageElement>)=>void;onPointerMove:(event:PointerEvent<HTMLImageElement>)=>void}){
  const frameRef=useRef<HTMLDivElement>(null)
  const layerRef=useRef<HTMLDivElement>(null)
  const fit=()=>{
    const img=imgRef.current,layer=layerRef.current,frame=frameRef.current
    if(!img||!layer||!frame||!img.naturalWidth)return
    const rect=frame.getBoundingClientRect()
    const scale=Math.min(rect.width/img.naturalWidth,rect.height/img.naturalHeight)
    const w=img.naturalWidth*scale,h=img.naturalHeight*scale
    layer.style.width=`${w}px`
    layer.style.height=`${h}px`
    layer.style.left=`${(rect.width-w)/2}px`
    layer.style.top=`${(rect.height-h)/2}px`
  }
  useEffect(()=>{fit();const frame=frameRef.current;if(!frame)return;const observer=new ResizeObserver(fit);observer.observe(frame);return()=>observer.disconnect()},[src])
  const text=art.textPlacement,mark=art.logoPlacement
  const showText=!!art.text&&(art.mirrorText||text.side===side)
  const showLogo=art.hasLogo&&!!logo&&(art.mirrorLogo||mark.side===side)
  return <figure><div className="dl-photo" ref={frameRef}><img ref={imgRef} className="dl-photo__shot" src={src} alt={`${side} ${rendered?'custom design proof':'product photo'}`} draggable={false} onLoad={fit} onPointerDown={onPointerDown} onPointerMove={onPointerMove}/><div className="dl-photo__art" ref={layerRef}>{!rendered&&showLogo&&<span className={`dl-art-frame${active==='logoPlacement'?' is-on':''}`} style={{left:`${mark.x}%`,top:`${mark.y}%`,width:`${mark.size}%`,transform:`translate(-50%,-50%) rotate(${mark.rotation}deg)`}}><img className="dl-photo__logo" src={logo} alt=""/><i/><i/><i/><i/></span>}{!rendered&&showText&&<span className={`dl-art-frame dl-art-frame--text${active==='textPlacement'?' is-on':''}`} style={{left:`${text.x}%`,top:`${text.y}%`,transform:`translate(-50%,-50%) rotate(${text.rotation}deg)`}}><span className="dl-photo__text" style={{color:textColor,fontFamily:font,fontSize:`${text.size*0.78}cqw`}}>{art.text}</span><i/><i/><i/><i/></span>}</div></div><figcaption>{side}</figcaption></figure>
}

function ProofPair({front,back,art,textColor,font,logo,rendered,active,onGrab,onMove,onEnd}:{front:string;back:string;art:ArtTarget;textColor:string;font:string;logo:string;rendered:boolean;active:ArtKey|null;onGrab:(key:ArtKey)=>void;onMove:(key:ArtKey,placement:Placement)=>void;onEnd:()=>void}){
  const frontRef=useRef<HTMLImageElement>(null)
  const backRef=useRef<HTMLImageElement>(null)
  const drag=useRef<{key:ArtKey;ox:number;oy:number}|null>(null)
  const artRef=useRef(art)
  artRef.current=art
  const pointOf=(img:HTMLImageElement,clientX:number,clientY:number)=>{
    const rect=img.getBoundingClientRect()
    const nw=img.naturalWidth||1024,nh=img.naturalHeight||1024
    const scale=Math.min(rect.width/nw,rect.height/nh)
    const w=nw*scale,h=nh*scale
    const x=(clientX-(rect.left+(rect.width-w)/2))/w*1024
    const y=(clientY-(rect.top+(rect.height-h)/2))/h*1024
    if(x<0||y<0||x>1024||y>1024)return null
    return {x,y}
  }
  const panelAt=(clientX:number,clientY:number)=>{
    for(const [img,side] of [[frontRef.current,'front'],[backRef.current,'back']] as const){
      if(!img)continue
      const rect=img.getBoundingClientRect()
      if(clientX<rect.left||clientX>rect.right||clientY<rect.top||clientY>rect.bottom)continue
      const point=pointOf(img,clientX,clientY)
      if(point)return {side,point,img}
    }
    return null
  }
  const finish=()=>{drag.current=null;frontRef.current?.classList.remove('dl-art-drag');backRef.current?.classList.remove('dl-art-drag');onEnd()}
  // No true back photo: show the front only rather than repeating it as a fake back.
  const single=back===front
  const backArt=single&&((!!art.text&&art.textPlacement.side==='back'&&!art.mirrorText)||(art.hasLogo&&art.logoPlacement.side==='back'&&!art.mirrorLogo))
  return <div className={`dl-flat dl-flat--pair${single?' dl-flat--single':''}`} onPointerMove={event=>{
    if(!drag.current)return
    const panel=panelAt(event.clientX,event.clientY)
    if(!panel)return
    const placement=artRef.current[drag.current.key]
    const mirrored=drag.current.key==='textPlacement'?artRef.current.mirrorText:artRef.current.mirrorLogo
    onMove(drag.current.key,moveArt(placement,panel.point.x,panel.point.y,drag.current.ox,drag.current.oy,mirrored?placement.side:panel.side))
  }} onPointerUp={finish} onPointerCancel={finish}>
    {(single?['front'] as const:['front','back'] as const).map(side=>{
      const src=side==='front'?front:back
      const imgRef=side==='front'?frontRef:backRef
      return <PhotoSide key={side} src={src} side={side} art={art} textColor={textColor} font={font} logo={logo} rendered={rendered} active={active} imgRef={imgRef}
        onPointerDown={event=>{
          const point=pointOf(event.currentTarget,event.clientX,event.clientY)
          const key=point&&pickArt(point.x,point.y,artRef.current,side)
          if(!point||!key)return
          event.preventDefault()
          const placement=artRef.current[key]
          drag.current={key,ox:point.x-placement.x/100*1024,oy:point.y-placement.y/100*1024}
          try{event.currentTarget.setPointerCapture(event.pointerId)}catch{/* pointer capture needs a browser-generated event */}
          event.currentTarget.classList.add('dl-art-drag')
          onGrab(key)
        }}
        onPointerMove={event=>{
          if(drag.current)return
          const point=pointOf(event.currentTarget,event.clientX,event.clientY)
          event.currentTarget.classList.toggle('dl-art-hot',!!(point&&pickArt(point.x,point.y,artRef.current,side)))
        }}/>
    })}
    {single&&<p className="dl-back-missing">Back view not available yet{backArt?' — your back artwork is saved and appears on your production proof':''}.</p>}
  </div>
}

export default function Customizer(){
  const[design,setDesign]=useState<Design>(initialDesign)
  const[tab,setTab]=useState<Tab>('Product')
  const[view,setView]=useState('perspective')
  const[mode,setMode]=useState<'3d'|'2d'>(()=>canUseWebGL()?'3d':'2d')
  const[zoom,setZoom]=useState(1)
  const[spin,setSpin]=useState(false)
  const[status,setStatus]=useState('')
  const[error,setError]=useState('')
  const[savedId,setSavedId]=useState('')
  const[savedList,setSavedList]=useState(readDesigns)
  const[busy,setBusy]=useState(false)
  const[history,setHistory]=useState<Design[]>([])
  const[future,setFuture]=useState<Design[]>([])
  const[frames,setFrames]=useState<{front:HTMLCanvasElement;back:HTMLCanvasElement;proofFront:string;proofBack:string}|null>(null)
  const[rendering,setRendering]=useState(true)
  const[noWebGL,setNoWebGL]=useState(()=>!canUseWebGL())
  const[activeArt,setActiveArt]=useState<ArtKey|null>(null)
  const uploadToken=useRef(0)
  const designRef=useRef(design)
  const dragOrigin=useRef<Design|null>(null)
  const dragging=useRef(false)
  const[logoAspect,setLogoAspect]=useState(1)
  const[logoInfo,setLogoInfo]=useState<LogoInfo|null>(null)
  const[exporting,setExporting]=useState(false)
  designRef.current=design
  const product=useMemo(()=>presets.find(p=>p.id===design.productId)||presets[0],[design.productId])
  const template2d=useMemo(()=>getTemplate(product.slug),[product.slug])
  const reducedMotion=useMemo(()=>matchMedia('(prefers-reduced-motion: reduce)').matches,[])
  const update=(patch:Partial<Design>)=>{setHistory(h=>[...h.slice(-19),design]);setFuture([]);setDesign(d=>({...d,...patch}));setSavedId('');setStatus('');setError('')}
  const setPreview=(side:string)=>{setView(side);setSpin(false)}
  const beginArtDrag=(key?:ArtKey)=>{dragOrigin.current=designRef.current;dragging.current=true;if(key)setActiveArt(key)}
  const moveArtPlacement=(key:ArtKey,placement:Placement)=>{
    if(dragOrigin.current){const origin=dragOrigin.current;dragOrigin.current=null;setHistory(h=>[...h.slice(-19),origin]);setFuture([])}
    setDesign(d=>({...d,[key]:placement}));setSavedId('');setStatus('');setError('')
  }
  const endArtDrag=()=>{dragOrigin.current=null;dragging.current=false}
  /** 2D zone drag on a templated product: one undo step per drag, like the shared placements. */
  const moveZoneArt=(kind:ZoneKind,placement:ZonePlacement)=>{
    if(!template2d)return
    if(dragOrigin.current){const origin=dragOrigin.current;dragOrigin.current=null;setHistory(h=>[...h.slice(-19),origin]);setFuture([])}
    setDesign(d=>({...d,placements2d:withPlacement(d,template2d.id,kind,placement)}));setSavedId('');setStatus('');setError('')
  }
  const art:ArtTarget={text:design.text,textPlacement:design.textPlacement,hasLogo:!!design.logo,logoPlacement:design.logoPlacement,logoAspect,mirrorText:design.mirrorText??design.mirrorArt??false,mirrorLogo:design.mirrorLogo??design.mirrorArt??false}
  useEffect(()=>{if(!design.logo){setLogoAspect(1);return};const img=new Image();img.onload=()=>setLogoAspect(img.naturalHeight/Math.max(1,img.naturalWidth)||1);img.src=design.logo},[design.logo])
  useEffect(()=>{const sizes=sizesFor(product);if(!sizes.includes(designRef.current.size))setDesign(d=>({...d,size:defaultSize(sizes)}))},[product])
  useEffect(()=>{let active=true;if(!dragging.current)setRendering(true);Promise.all([paintDesign(design,product,'front'),paintDesign(design,product,'back'),paintDesign(design,product,'front',true),paintDesign(design,product,'back',true)]).then(([front,back,pf,pb])=>{if(active){setFrames({front,back,proofFront:pf.toDataURL(),proofBack:pb.toDataURL()});setRendering(false)}}).catch(()=>{if(active){setRendering(false);setError('The preview could not render this artwork. Remove the logo and try another image.')}});return()=>{active=false}},[design,product])
  useEffect(()=>()=>{uploadToken.current++},[])
  useEffect(()=>{let live=true;if(!design.logo){setLogoInfo(null);return};analyzeLogo(design.logo).then(info=>{if(live)setLogoInfo(info)}).catch(()=>{if(live)setLogoInfo(null)});return()=>{live=false}},[design.logo])
  const restore=(next:Design)=>{uploadToken.current++;setBusy(false);setHistory(h=>[...h.slice(-19),design]);setFuture([]);setDesign(next);setSavedId('');setError('');setPreview('front')}
  const save=()=>{
    try{
      const id=savedId||`SKW-${Date.now().toString(36).toUpperCase()}`
      const record:SavedDesign={...design,id,product:product.name,savedAt:new Date().toISOString()}
      const next=[...readDesigns().filter(item=>item.id!==id),record]
      localStorage.setItem('skawa-designs',JSON.stringify(next));setSavedList(next);setSavedId(id);setStatus(`Design ${id} saved in this browser, including your logo.`);setError('');return id
    }catch{setError('Browser storage is full or unavailable. Download the design file to keep your work.');return null}
  }
  const uploadLogo=async(event:ChangeEvent<HTMLInputElement>)=>{
    const file=event.target.files?.[0];event.target.value='';if(!file)return
    const token=++uploadToken.current;setError('');setBusy(true)
    try{
      if(file.size>10*1024*1024)throw new Error('Choose an image smaller than 10 MB.')
      if(!/\.(png|jpe?g|webp|svg)$/i.test(file.name))throw new Error('Choose PNG, JPG, WebP or SVG artwork. PDF, AI and EPS files cannot be previewed here.')
      if(/\.svg$/i.test(file.name)){
        const svg=await file.text(),doc=new DOMParser().parseFromString(svg,'image/svg+xml')
        if(doc.querySelector('parsererror,script,foreignObject')||Array.from(doc.querySelectorAll('*')).some(el=>Array.from(el.attributes).some(a=>/^on/i.test(a.name)||(/href$/i.test(a.name)&&!a.value.startsWith('#'))||/url\(\s*['"]?(?!#)/i.test(a.value))))throw new Error('Use a self-contained SVG without scripts or external resources, or export it as PNG.')
      }
      const url=URL.createObjectURL(file)
      try{
        const img=new Image();await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject(new Error('This image is damaged or cannot be decoded. Try a PNG export.'));img.src=url})
        const scale=Math.min(1,1200/Math.max(img.naturalWidth,img.naturalHeight));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.naturalWidth*scale));c.height=Math.max(1,Math.round(img.naturalHeight*scale));c.getContext('2d')!.drawImage(img,0,0,c.width,c.height)
        const logo=c.toDataURL('image/png');if(logo.length>2800000)throw new Error('This image is too detailed to save locally. Upload a smaller PNG.')
        if(token===uploadToken.current){update({logo,logoName:file.name});setPreview(design.logoPlacement.side);setStatus('Logo added. Drag it on the preview, or use the placement controls.')}
      }finally{URL.revokeObjectURL(url)}
    }catch(e){if(token===uploadToken.current)setError(e instanceof Error?e.message:'Logo upload failed.')}finally{if(token===uploadToken.current)setBusy(false)}
  }
  const importDesign=async(event:ChangeEvent<HTMLInputElement>)=>{
    const file=event.target.files?.[0];event.target.value='';if(!file)return
    try{if(file.size>4*1024*1024)throw new Error();const next:unknown=JSON.parse(await file.text());if(!isDesign(next)||!presets.some(p=>p.id===next.productId))throw new Error();restore(next);setStatus('Design imported, including its artwork.')}catch{setError('Choose a valid SKAWA design JSON exported from this Design Lab.')}
  }
  // The downloaded proof uses the same renderer as the 2D preview (templated) or the same photo preview (others).
  const downloadPreview=async()=>{
    setExporting(true);setError('')
    try{const info={product,design,designId:savedId||undefined};const blob=template2d?await exportTemplated(template2d,info):await exportPhoto(info);downloadFile(blob,`skawa-${product.slug}-proof.png`);setStatus('Proof downloaded.')}
    catch{setError('Preview download failed. Try again after the artwork finishes loading.')}
    finally{setExporting(false)}
  }
  const undo=()=>{const last=history.at(-1);if(!last)return;setFuture(f=>[design,...f]);setHistory(h=>h.slice(0,-1));setDesign(last);setSavedId('');setStatus('')}
  const redo=()=>{if(!future[0])return;setHistory(h=>[...h,design]);setDesign(future[0]);setFuture(f=>f.slice(1));setSavedId('');setStatus('')}
  const shownArt=activeArt??(tab==='Text'?'textPlacement':tab==='Logos'?'logoPlacement':null)
  useEffect(()=>{if(template2d)preloadTemplate(template2d)},[template2d])
  const photoProofs=<ProofPair front={product.image} back={product.secondaryImage||product.image} art={art} textColor={design.textColor} font={design.font} logo={design.logo} rendered={false} active={shownArt} onGrab={beginArtDrag} onMove={moveArtPlacement} onEnd={endArtDrag}/>
  // Products with a 2D template get the composited proof; the rest keep the photo proof.
  const proofs=template2d?<Proof2D template={template2d} productName={product.name} design={design} active={shownArt} fallback={photoProofs} onGrab={beginArtDrag} onMove={moveZoneArt} onEnd={endArtDrag}/>:photoProofs
  // In 2D, templated products place artwork by print zone; 3D keeps the shared placements.
  const in2d=mode!=='3d'||noWebGL
  const zoned=in2d&&template2d?template2d:null
  // What the 2D preview can show: every control on a templated product must have a visible effect.
  const can=zoned?zoned.supports:{baseColor:true,trim:true,accent:true,pattern:true,logo:true,text:true}
  const photo2d=in2d&&!template2d
  const colorHelp=!in2d?'Colors apply directly to the garment preview. Choose Design to add a pattern or accent color.':zoned?'Colors apply to the garment in the 2D proof. Choose Design to add a pattern or accent color.':'This product has a photo preview in 2D. Your colors show as chips beside it and appear on your production proof.'
  const offPalette=zoned?.palette&&!zoned.palette.includes(design.color.toLowerCase())?nearestColor(zoned.palette,design.color):null
  const unsupported=(what:string)=><p className="dl-help">{what} {what.endsWith('s')?'are':'is'} not shown on the {product.name} 2D proof. Switch to 3D, or note it in your quote request.</p>
  const zoneFields=(kind:ZoneKind,label:string,mirror:boolean,onMirror:(on:boolean)=>void)=>{
    const value=zoned&&resolvePlacement(zoned,design,kind)
    return zoned&&value?<ZonePlacementFields label={label} kind={kind} template={zoned} value={value} onChange={p=>update({placements2d:withPlacement(design,zoned.id,kind,p)})} mirror={mirror} onMirror={onMirror}/>:null
  }
  // Print hints: contrast against the fabric under the artwork, and artwork resolution.
  const surfaces=(kind:ZoneKind)=>{
    const p=zoned&&resolvePlacement(zoned,design,kind)
    if(zoned&&p&&findZone(zoned,p.side,p.zone)?.surface==='trim'&&zoned.supports.trim)return [design.trim]
    return design.pattern!=='solid'?[design.color,design.accent]:[design.color]
  }
  const lowContrast=(ink:string|null|undefined,kind:ZoneKind)=>!!ink&&Math.min(...surfaces(kind).map(s=>contrast(ink,s)))<MIN_CONTRAST
  const printedLogoPx=(()=>{
    const p=zoned&&resolvePlacement(zoned,design,'logo'),zone=zoned&&p&&findZone(zoned,p.side,p.zone)
    if(zoned&&p&&zone&&logoInfo)return artBox(zone,{kind:'logo',ratio:logoInfo.height/Math.max(1,logoInfo.width)},p.scale,0,zoned.aspect).w*zoned.size[0]
    return design.logoPlacement.size/100*1200
  })()
  const textPx=(()=>{
    const p=zoned&&design.text?resolvePlacement(zoned,design,'text'):null,zone=zoned&&p&&findZone(zoned,p.side,p.zone)
    return zoned&&p&&zone?artBox(zone,{kind:'text',ratio:textRatio(design.text,design.font)},p.scale,0,zoned.aspect).size*zoned.size[0]:Infinity
  })()
  const textHints=[design.text&&lowContrast(design.textColor,'text')&&'Low contrast on this colour — try a lighter or darker ink.',textPx<MIN_TEXT_PX&&'This text prints small in this zone — shorten it or choose a wider zone.'].filter(Boolean)
  const logoHints=[logoInfo&&lowContrast(logoInfo.color,'logo')&&'Low contrast on this colour — try a lighter or darker ink.',logoInfo&&logoInfo.width<MIN_SHARPNESS*printedLogoPx&&'Artwork may print soft — upload a larger file (PNG/SVG).'].filter(Boolean)

  return <section className="design-lab" aria-label="Fightwear customizer">
    <header className="dl-heading"><div><span>SKAWA / DESIGN LAB</span><h2>MAKE IT YOURS.</h2><p>Your colors. Your artwork. Every angle.</p></div><div className="dl-history"><button onClick={undo} disabled={!history.length} aria-label="Undo design change"><ArrowLeft/></button><button onClick={redo} disabled={!future.length} aria-label="Redo design change"><ArrowRight/></button><button aria-label="Reset design" onClick={()=>{restore(defaultDesign(product));setStatus('Design reset. Use Undo to recover your previous design.')}}><RotateCcw/> Reset</button></div></header>
    <div className="dl-workspace">
      <div className="dl-preview-column"><div className="dl-stage">
        <div className="dl-preview-toolbar"><span>{mode==='3d'&&!noWebGL?'3D LIVE PREVIEW':'2D DESIGN PROOF'}</span><div><button aria-pressed={mode==='3d'} onClick={()=>{if(!canUseWebGL()){setNoWebGL(true);setMode('2d');setError('3D is unavailable on this device. Continue designing with the front and back proofs.');return}setNoWebGL(false);setError('');setMode('3d');setPreview('front')}}>3D</button><button aria-pressed={mode==='2d'} onClick={()=>{setMode('2d');setPreview(view==='back'?'back':'front')}}>2D</button></div></div>
        <div className="dl-canvas" role="group" aria-label={`Interactive ${product.name} preview. Drag a name or logo to move it. Drag it onto the back to place it there. Drag empty fabric to rotate in 3D.`}>
          {mode==='3d'&&!noWebGL&&frames?<PreviewBoundary fallback={<><div className="dl-preview-error">3D unavailable on this device. Your front and back proofs remain available.</div>{proofs}</>}><Suspense fallback={proofs}><Scene product={product} front={frames.front} back={frames.back} color={design.color} accent={design.accent} trim={design.trim} view={view} zoom={zoom} spin={spin&&!reducedMotion} art={art} onArtGrab={beginArtDrag} onArtMove={moveArtPlacement} onArtEnd={endArtDrag} onUnavailable={()=>{setNoWebGL(true);setError('3D is unavailable on this device. Continue designing with the front and back proofs.')}}/></Suspense></PreviewBoundary>:proofs}
        </div>
        {photo2d&&<div className="dl-photo-preview"><p className="dl-photo-badge">Photo preview — colors and patterns appear on your production proof</p><ul aria-label="Your colors">{([['Base',design.color],['Trim',design.trim],['Accent',design.accent]] as const).map(([name,hex])=><li key={name}><i style={{background:hex}}/>{name}<b>{hex.toUpperCase()}</b></li>)}{design.pattern!=='solid'&&<li className="dl-photo-preview__pattern">{design.pattern} pattern</li>}</ul></div>}
        {mode==='3d'&&<div className="dl-camera"><div role="group" aria-label="Preview angle">{['front','back','left','right'].map(side=><button key={side} aria-pressed={view===side} onClick={()=>setPreview(side)}>{side}</button>)}</div><div><button aria-label="Zoom out" disabled={zoom<=.8} onClick={()=>setZoom(z=>Math.max(.8,z-.15))}><ZoomOut/></button><button aria-label="Zoom in" disabled={zoom>=1.6} onClick={()=>setZoom(z=>Math.min(1.6,z+.15))}><ZoomIn/></button><button aria-label="Auto rotate preview" aria-pressed={spin} disabled={reducedMotion} onClick={()=>setSpin(s=>!s)}><RotateCw/></button></div></div>}
        <p className="dl-preview-note">{mode==='3d'?'Drag a name or logo to place it. Drag it around to the back to move it there. Drag empty fabric to rotate.':'Front and back design proofs. Drag a name or logo on the garment.'}<span>Production fit and print placement require an approved sample.</span></p>
        {rendering&&<span className="dl-updating" role="status">Updating preview…</span>}
      </div><div className="dl-product-caption"><img src={product.image} alt={`${product.name} catalog reference`}/><div><small>YOUR PRODUCT</small><h3>{product.name}</h3><span>{product.category} · {product.availability}</span></div><b>{product.price}<small>Base price / quote review</small></b></div></div>

      <div className="dl-editor"><h3>CUSTOMIZE YOUR GEAR</h3><div className="dl-tabs" role="tablist" aria-label="Design tools">{tabs.map((name,index)=><button key={name} id={`dl-tab-${name}`} role="tab" aria-selected={tab===name} aria-controls={`dl-panel-${name}`} tabIndex={tab===name?0:-1} onClick={()=>setTab(name)} onKeyDown={e=>{const next=e.key==='ArrowRight'?(index+1)%5:e.key==='ArrowLeft'?(index+4)%5:e.key==='Home'?0:e.key==='End'?4:-1;if(next>=0){e.preventDefault();setTab(tabs[next]);document.getElementById(`dl-tab-${tabs[next]}`)?.focus()}}}>{name}</button>)}</div>
      <div id={`dl-panel-${tab}`} role="tabpanel" aria-labelledby={`dl-tab-${tab}`} className="dl-panel">
      {tab==='Product'&&<><label>Choose product<select value={design.productId} onChange={e=>{const p=presets.find(p=>p.id===Number(e.target.value))!;const sizes=sizesFor(p);update({productId:p.id,material:p.material||'Performance stretch',size:defaultSize(sizes)||'One size'});setPreview('front')}}>{presets.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label><div className="dl-field-row"><label>Size<select value={design.size} onChange={e=>update({size:e.target.value})}>{sizesFor(product).map(size=><option key={size}>{size}</option>)}</select></label><label>Quantity<input aria-label="Quantity" type="number" min={1} max={10000} value={design.quantity} onChange={e=>update({quantity:Math.min(10000,Math.max(1,Math.round(Number(e.target.value)||1)))})}/></label></div>{can.baseColor&&<ColorField label="Base color" value={design.color} onChange={color=>update({color})} options={zoned?.palette}/>}{can.trim&&<ColorField label="Trim color" value={design.trim} onChange={trim=>update({trim})} options={zoned?.palette}/>}<div className="dl-hints" role="status">{offPalette&&<p className="dl-hint">{product.name} comes in {zoned!.palette!.length} competition colors. The proof shows the nearest one ({offPalette.toUpperCase()}) — choose a color above to confirm it.</p>}</div><p className="dl-help">{colorHelp}</p></>}
      {tab==='Design'&&<>{can.pattern?<><fieldset className="dl-patterns"><legend>Choose a design</legend><div>{patterns.map(pattern=><button aria-pressed={design.pattern===pattern} key={pattern} onClick={()=>update({pattern})}><i className={`dl-pattern-${pattern}`} style={{'--base':design.color,'--accent':design.accent} as CSSProperties}/>{pattern}</button>)}</div></fieldset>{can.accent&&<ColorField label="Accent color" value={design.accent} onChange={accent=>update({accent})} options={zoned?.palette}/>}</>:unsupported('Patterns')}<label>Fabric finish<select value={design.material} onChange={e=>update({material:e.target.value})}>{Array.from(new Set([product.material,'Performance stretch','Cotton weave','Matte technical knit',design.material])).filter(Boolean).map(m=><option key={m}>{m}</option>)}</select></label><label>Decoration method<select value={design.print} onChange={e=>update({print:e.target.value})}>{Array.from(new Set(['Sublimation','Screen print','Embroidery',design.print])).map(p=><option key={p}>{p}</option>)}</select></label><p className="dl-help">The preview shows artwork placement. Fabric and decoration availability are confirmed with your quote.</p></>}
      {tab==='Logos'&&(!can.logo?unsupported('A logo'):<><label className="dl-upload"><ImagePlus/><b>{busy?'Reading artwork…':'Upload your logo'}</b><span>PNG, JPG, WebP or SVG · Up to 10 MB</span><input disabled={busy} type="file" accept=".png,.jpg,.jpeg,.webp,.svg" aria-label="Upload logo" onChange={uploadLogo}/></label>{design.logo?<><div className="dl-logo-file"><img src={design.logo} alt="Uploaded logo"/><span>{design.logoName}</span><button aria-label="Remove logo" onClick={()=>update({logo:'',logoName:''})}><X/></button></div><div className="dl-hints" role="status">{logoHints.map(hint=><p key={String(hint)} className="dl-hint">{hint}</p>)}</div>{zoneFields('logo','Logo',art.mirrorLogo,mirrorLogo=>update({mirrorLogo}))??<PlacementFields label="Logo" value={design.logoPlacement} onChange={logoPlacement=>update({logoPlacement})} onView={setPreview} mirror={art.mirrorLogo} onMirror={mirrorLogo=>update({mirrorLogo})}/>}</>:<p className="dl-help">Transparent PNG or SVG works best. After uploading, choose front or back and adjust position, size and rotation.</p>}</>)}
      {tab==='Text'&&(!can.text?unsupported('Text'):<><label>Your text<input aria-label="Personalization text" placeholder="Your name, team or motto" maxLength={32} value={design.text} onChange={e=>update({text:e.target.value})}/></label><small>{design.text.length}/32 characters</small><label>Font<select value={design.font} onChange={e=>update({font:e.target.value})}>{fonts.map(f=><option key={f}>{f}</option>)}</select></label><ColorField label="Text color" value={design.textColor} onChange={textColor=>update({textColor})}/><div className="dl-hints" role="status">{textHints.map(hint=><p key={String(hint)} className="dl-hint">{hint}</p>)}</div>{zoneFields('text','Text',art.mirrorText,mirrorText=>update({mirrorText}))??<PlacementFields label="Text" value={design.textPlacement} onChange={textPlacement=>update({textPlacement})} onView={setPreview} mirror={art.mirrorText} onMirror={mirrorText=>update({mirrorText})}/>}<button className="dl-secondary" disabled={!design.text} onClick={()=>update({text:''})}>Remove text</button></>)}
      {tab==='Review'&&<><h4>YOUR DESIGN, READY TO REVIEW.</h4><dl className="dl-specs">{Object.entries({Product:product.name,Size:design.size,Quantity:design.quantity,Colors:`${design.color} / ${design.accent} / ${design.trim}`,Pattern:design.pattern,Fabric:design.material,Method:design.print,Text:design.text||'None',Logo:design.logoName||'None','2D preview':template2d?'Full color preview':'Photo preview'}).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><button className="dl-secondary" onClick={downloadPreview} disabled={exporting}><Download/> {exporting?'Preparing proof…':'Download front & back PNG'}</button><button className="dl-secondary" onClick={()=>downloadFile(new Blob([JSON.stringify(design,null,2)],{type:'application/json'}),'skawa-design.json')}><Download/> Export editable design</button><label className="dl-import"><Upload/> Import saved design<input type="file" accept=".json" aria-label="Import design" onChange={importDesign}/></label><label>Load a saved design<select value="" onChange={e=>{const item=savedList.find(d=>d.id===e.target.value);if(isDesign(item)&&presets.some(p=>p.id===item.productId)){restore(item);setSavedId(item.id);setStatus('Saved design loaded.')}else setError('This older design is missing editable artwork. Start a new design or import a current export.')}}><option value="">Select a design…</option>{savedList.map(d=><option key={d.id} value={d.id}>{d.id} · {d.product||'Custom gear'}</option>)}</select></label><p className="dl-help">Save keeps the complete design and logo in this browser. Export a file to back it up or open it on another device.</p></>}
      </div>
      <div className="dl-actions">{status&&<p className="dl-success" role="status"><Check/>{status}</p>}{error&&<p className="dl-error" role="alert">{error}</p>}<button className="dl-primary" disabled={busy} onClick={save}><Save/> {savedId?'DESIGN SAVED':'SAVE DESIGN'}</button><button className="dl-secondary" disabled={busy} onClick={()=>{const id=save();if(id)go(`/request-mockup?intent=custom-design&product=${product.slug}&design=${id}`)}}>REQUEST A QUOTE <ArrowRight/></button><p>Custom order pricing is confirmed after design review.</p></div>
      </div>
    </div>
  </section>
}
