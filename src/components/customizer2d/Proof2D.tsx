import {useEffect,useLayoutEffect,useMemo,useRef,useState,type PointerEvent,type ReactNode,type RefObject} from 'react'
import type {Design,ZonePlacement} from '../../lib/customDesign'
import type {ArtKey} from '../../lib/artPlacement'
import {composeInput,placeAll,shownColor,type Placed} from '../../lib/customizer2d/art'
import {composeView,loadImage,loadView,type LoadedView} from '../../lib/customizer2d/compose'
import {ensureFont} from '../../lib/customizer2d/fonts'
import {artBox,dropZone,otherSide,uvAt,zonesOn,type ArtContent} from '../../lib/customizer2d/placement'
import type {Template2D,ViewSide,ZoneKind} from '../../lib/customizer2d/types'

const colorNames:Record<string,string>={'#151515':'black','#df202b':'red','#174d79':'blue','#16612c':'green','#d1a021':'gold','#f0f0ed':'white','#080808':'black','#ffffff':'white'}
const colorName=(hex:string)=>colorNames[hex.toLowerCase()]||hex.toUpperCase()
const kindOf:Record<ArtKey,ZoneKind>={textPlacement:'text',logoPlacement:'logo'}
const keyOf:Record<ZoneKind,ArtKey>={text:'textPlacement',logo:'logoPlacement'}
type Point=[number,number]

function View({side,template,view,design,placed,active,dragKind,productName,caption,scale,fontReady,canvasRef,onPointerDown,onPointerMove}:{side:ViewSide;template:Template2D;view:LoadedView|null;design:Design;placed:Placed[];active:ZoneKind|null;dragKind:ZoneKind|null;productName:string;caption:string;scale:number;fontReady:boolean;canvasRef:RefObject<HTMLCanvasElement|null>;onPointerDown:(event:PointerEvent<HTMLCanvasElement>)=>void;onPointerMove:(event:PointerEvent<HTMLCanvasElement>)=>void}){
  const frameRef=useRef<HTMLDivElement>(null),boxRef=useRef<HTMLDivElement>(null)
  const[drawn,setDrawn]=useState(false)
  // A box of the template's aspect ratio, fitted inside the frame and reserved before the layers arrive.
  useLayoutEffect(()=>{
    const frame=frameRef.current,box=boxRef.current
    if(!frame||!box)return
    const fit=()=>{const rect=frame.getBoundingClientRect(),w=Math.min(rect.width,rect.height*template.aspect);box.style.width=`${w}px`;box.style.height=`${w/template.aspect}px`}
    fit()
    const observer=new ResizeObserver(fit);observer.observe(frame);return()=>observer.disconnect()
  },[template.aspect])
  const color=shownColor(template,design.color),trim=shownColor(template,design.trim)
  // Recompose at most once per frame; wait for the text font so the proof never shows a fallback face.
  useEffect(()=>{
    const canvas=canvasRef.current
    if(!view||!canvas||!fontReady)return
    const id=requestAnimationFrame(()=>{
      composeView(view,composeInput(template,design,placed),canvas,scale)
      setDrawn(true)
    })
    return()=>cancelAnimationFrame(id)
  },[view,color,trim,design.accent,design.pattern,placed,scale,template,fontReady,canvasRef])
  const label=`${productName}, ${side} view. Base colour ${colorName(color)}${template.supports.trim?`, trim ${colorName(trim)}`:''}${template.supports.pattern&&design.pattern!=='solid'?`, ${design.pattern} pattern in ${colorName(design.accent)}`:''}${placed.length?`. Printed: ${placed.map(p=>`${p.kind==='text'?`“${design.text}”`:'logo'} on the ${p.instance.zone.label.toLowerCase()}`).join(', ')}`:''}.`
  const zones=dragKind?zonesOn(template,side).filter(zone=>zone.accepts.includes(dragKind)):[]
  return <figure><div className="dl-photo dl-proof2d__frame" ref={frameRef}><div className={`dl-proof2d__box${drawn?'':' is-loading'}`} ref={boxRef} aria-busy={!drawn}>
    <canvas ref={canvasRef} role="img" aria-label={drawn?label:`Loading ${side} view`} onPointerDown={onPointerDown} onPointerMove={onPointerMove}/>
    {zones.length>0&&<svg className="dl-proof2d__zones" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">{zones.map(zone=><polygon key={zone.id} points={zone.polygon.map(p=>p.join(',')).join(' ')}/>)}</svg>}
    {drawn&&placed.filter(p=>p.kind===active).map(p=><span key={`${p.kind}-${p.instance.zone.id}`} className="dl-art-frame is-on dl-proof2d__select" style={{left:`${p.centre[0]*100}%`,top:`${p.centre[1]*100}%`,width:`${p.box.w*100}%`,height:`${p.box.h*100}%`,transform:`translate(-50%,-50%) rotate(${p.instance.rotation}deg)`}}><i/><i/><i/><i/></span>)}
  </div></div><figcaption>{caption}</figcaption></figure>
}

/** Front and back proofs of a templated product, composited from its registered 2D layers. */
export default function Proof2D({template,productName,design,active,fallback,onGrab,onMove,onEnd}:{template:Template2D;productName:string;design:Design;active:ArtKey|null;fallback:ReactNode;onGrab:(key:ArtKey)=>void;onMove:(kind:ZoneKind,placement:ZonePlacement)=>void;onEnd:()=>void}){
  const[views,setViews]=useState<{id:string;front:LoadedView;back:LoadedView|null}|null>(null)
  const[failed,setFailed]=useState(false)
  const[logo,setLogo]=useState<HTMLImageElement|null>(null)
  const[scale,setScale]=useState(.5)
  const[fontFor,setFontFor]=useState('')
  const[fontTick,setFontTick]=useState(0)
  const[dragKind,setDragKind]=useState<ZoneKind|null>(null)
  const pairRef=useRef<HTMLDivElement>(null)
  const frontRef=useRef<HTMLCanvasElement>(null),backRef=useRef<HTMLCanvasElement>(null)
  const drag=useRef<{kind:ZoneKind;copy:boolean;side:ViewSide;zone:string;offset:Point;content:ArtContent;scale:number;rotation:number}|null>(null)
  const hasBack=Boolean(template.views.back)
  useEffect(()=>{
    let live=true
    setFailed(false)
    Promise.all([loadView(template,'front'),hasBack?loadView(template,'back'):Promise.resolve(null)]).then(([front,back])=>{if(live)setViews({id:template.id,front,back})}).catch(()=>{if(live)setFailed(true)})
    return()=>{live=false}
  },[template,hasBack])
  useEffect(()=>{
    let live=true
    if(!design.logo){setLogo(null);return}
    loadImage(design.logo).then(img=>{if(live)setLogo(img)}).catch(()=>{if(live)setLogo(null)})
    return()=>{live=false}
  },[design.logo])
  useEffect(()=>{let live=true;ensureFont(design.font).then(()=>{if(live)setFontFor(design.font)});return()=>{live=false}},[design.font])
  // A web font that finishes late re-measures and redraws the text.
  useEffect(()=>{const fonts=document.fonts;if(!fonts)return;const bump=()=>setFontTick(t=>t+1);fonts.addEventListener('loadingdone',bump);return()=>fonts.removeEventListener('loadingdone',bump)},[])
  // Render resolution follows the displayed size × device pixel ratio (capped at 2), in quarter steps.
  useEffect(()=>{
    const pair=pairRef.current
    if(!pair)return
    const measure=()=>{const box=pair.querySelector('.dl-proof2d__box');if(!box)return;const need=box.getBoundingClientRect().width*Math.min(2,devicePixelRatio||1)/template.size[0];setScale(Math.min(1,Math.max(.25,Math.ceil(need*4)/4)))}
    measure()
    const observer=new ResizeObserver(measure);observer.observe(pair);return()=>observer.disconnect()
  },[template.size])
  const fontReady=fontFor===design.font
  // fontReady/fontTick re-measure the text once its font has loaded.
  const placed=useMemo(()=>placeAll(template,design,logo),[template,design,logo,fontReady,fontTick])
  const [placedFront,placedBack]=useMemo(()=>[placed.filter(p=>p.instance.side==='front'),placed.filter(p=>p.instance.side==='back')],[placed])
  if(failed)return <>{fallback}</>
  const ready=views&&views.id===template.id?views:null
  const [W,H]=template.size

  const pointOf=(canvas:HTMLCanvasElement,clientX:number,clientY:number):Point|null=>{
    const rect=canvas.getBoundingClientRect()
    const x=(clientX-rect.left)/rect.width,y=(clientY-rect.top)/rect.height
    return x<0||y<0||x>1||y>1?null:[x,y]
  }
  const panelAt=(clientX:number,clientY:number)=>{
    for(const [canvas,side] of [[frontRef.current,'front'],[backRef.current,'back']] as const){
      const point=canvas&&pointOf(canvas,clientX,clientY)
      if(point)return {side,point}
    }
    return null
  }
  // Topmost artwork under a point (text prints over the logo), with a finger-sized margin.
  const pick=(side:ViewSide,[x,y]:Point)=>[...placed].reverse().find(p=>{
    if(p.instance.side!==side)return false
    const a=-p.instance.rotation*Math.PI/180,dx=(x-p.centre[0])*W,dy=(y-p.centre[1])*H,pad=W*.025
    const lx=dx*Math.cos(a)-dy*Math.sin(a),ly=dx*Math.sin(a)+dy*Math.cos(a)
    return Math.abs(lx)<=p.box.w*W/2+pad&&Math.abs(ly)<=p.box.h*H/2+pad
  })
  const finish=()=>{if(!drag.current)return;drag.current=null;setDragKind(null);for(const c of [frontRef.current,backRef.current])c?.classList.remove('dl-art-drag');onEnd()}
  const handlers=(side:ViewSide)=>({
    onPointerDown:(event:PointerEvent<HTMLCanvasElement>)=>{
      const point=pointOf(event.currentTarget,event.clientX,event.clientY)
      const hit=point&&pick(side,point)
      if(!point||!hit)return
      event.preventDefault()
      drag.current={kind:hit.kind,copy:hit.instance.copy,side,zone:hit.instance.zone.id,offset:[point[0]-hit.centre[0],point[1]-hit.centre[1]],content:hit.content,scale:hit.instance.scale,rotation:hit.instance.rotation}
      try{event.currentTarget.setPointerCapture(event.pointerId)}catch{/* pointer capture needs a browser-generated event */}
      event.currentTarget.classList.add('dl-art-drag')
      setDragKind(hit.kind)
      onGrab(keyOf[hit.kind])
    },
    onPointerMove:(event:PointerEvent<HTMLCanvasElement>)=>{
      if(drag.current)return
      const point=pointOf(event.currentTarget,event.clientX,event.clientY)
      event.currentTarget.classList.toggle('dl-art-hot',!!(point&&pick(side,point)))
    },
  })
  return <div className="dl-flat dl-flat--pair dl-proof2d" ref={pairRef} data-template={template.id} onPointerMove={event=>{
    const d=drag.current
    if(!d)return
    const panel=panelAt(event.clientX,event.clientY)
    // Artwork shown on both sides stays on the side it was grabbed from; its twin follows.
    const mirrored=placed.some(p=>p.kind===d.kind&&p.instance.copy)
    if(!panel||(mirrored&&panel.side!==d.side))return
    const centre:Point=[panel.point[0]-d.offset[0],panel.point[1]-d.offset[1]]
    const zone=dropZone(template,d.kind,panel.side,centre,{side:d.side,zone:d.zone},mirrored?z=>!!z.counterpart:undefined)
    if(!zone)return
    const [u,v]=uvAt(zone,centre,artBox(zone,d.content,d.scale,d.rotation,template.aspect))
    d.side=panel.side;d.zone=zone.id
    onMove(d.kind,d.copy&&zone.counterpart?{side:otherSide(panel.side),zone:zone.counterpart,u:1-u,v,scale:d.scale,rotation:-d.rotation}:{side:panel.side,zone:zone.id,u,v,scale:d.scale,rotation:d.rotation})
  }} onPointerUp={finish} onPointerCancel={finish}>
    <View key={`front-${template.id}`} side="front" template={template} view={ready?.front??null} design={design} placed={placedFront} active={active&&kindOf[active]} dragKind={dragKind} productName={productName} caption={hasBack?'front':'front only'} scale={scale} fontReady={fontReady} canvasRef={frontRef} {...handlers('front')}/>
    {hasBack&&<View key={`back-${template.id}`} side="back" template={template} view={ready?.back??null} design={design} placed={placedBack} active={active&&kindOf[active]} dragKind={dragKind} productName={productName} caption="back" scale={scale} fontReady={fontReady} canvasRef={backRef} {...handlers('back')}/>}
  </div>
}
