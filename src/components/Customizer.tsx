import {
  AlertTriangle,
  Check,
  ChevronUp,
  FileText,
  Image as ImageIcon,
  Move,
  RotateCcw,
  SlidersHorizontal,
  Upload,
  X,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'
import {products} from '../data'
import {Link} from '../routing'
import '../customizer.css'

type View = 'FRONT' | 'BACK' | 'SIDE'
type ToolTab = 'PRODUCT' | 'DESIGN' | 'LOGOS' | 'TEXT' | 'REVIEW'
type Artwork = {
  name:string
  url:string
  kind:'raster'|'vector'|'document'
  width?:number
  height?:number
}

const colorOptions=[
  {name:'Midnight black',hex:'#0c0c0c',asset:'/images/products/fight-short-1.png'},
  {name:'Fight red',hex:'#d51e25',asset:'/images/products/full-sleeves-1.png'},
  {name:'Deep navy',hex:'#174d79',asset:'/images/products/short-sleeves-1.png'},
  {name:'Academy green',hex:'#16612c',asset:'/images/products/bjj-gi-1.png'},
  {name:'Championship gold',hex:'#d1a021',asset:'/images/products/fight-short-1.png'},
  {name:'Competition white',hex:'#f0f0ed',asset:'/images/products/short-sleeves-1.png'},
] as const

const productPresets=products.filter(product=>product.custom).map(product=>({
  id:product.id,
  label:product.name,
  color:product.color,
  image:product.image,
}))

const tabs:ToolTab[]=['PRODUCT','DESIGN','LOGOS','TEXT','REVIEW']
const views:View[]=['FRONT','BACK','SIDE']
const slug=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')

const printZones={
  'right-leg':{label:'Right leg',view:'FRONT' as View,x:68,y:58,minX:55,maxX:82,minY:38,maxY:79,maxScale:110},
  'left-leg':{label:'Left leg',view:'FRONT' as View,x:32,y:58,minX:18,maxX:45,minY:38,maxY:79,maxScale:110},
  'waistband':{label:'Front waistband',view:'FRONT' as View,x:50,y:27,minX:32,maxX:68,minY:19,maxY:36,maxScale:82},
  'rear-panel':{label:'Rear panel',view:'BACK' as View,x:50,y:53,minX:27,maxX:73,minY:35,maxY:70,maxScale:120},
  'side-panel':{label:'Side panel',view:'SIDE' as View,x:50,y:55,minX:34,maxX:66,minY:32,maxY:76,maxScale:88},
} as const
type PrintZone=keyof typeof printZones

function requestedProduct(){
  const params=new URLSearchParams(window.location.search)
  const requested=params.get('product')||params.get('id')||''
  if(!requested)return products.find(product=>product.custom)||products[0]
  return products.find(product=>String(product.id)===requested||product.slug===requested||slug(product.name)===slug(requested))||products.find(product=>product.custom)||products[0]
}

function presetForProduct(productId:number){
  return productPresets.find(preset=>preset.id===productId)||productPresets[0]
}

function SchematicShorts({view,color}:{view:Exclude<View,'FRONT'>;color:string}){
  if(view==='SIDE')return <svg className="garment-schematic side-schematic" viewBox="0 0 250 360" aria-hidden="true">
    <defs><linearGradient id="sideShade" x1="0" x2="1"><stop stopColor={color}/><stop offset=".55" stopColor="#353535"/><stop offset="1" stopColor="#080808"/></linearGradient></defs>
    <path d="M76 48 Q126 34 177 49 L184 89 167 295 118 321 82 296 91 108 72 88Z" fill="url(#sideShade)" stroke="#242424" strokeWidth="4"/>
    <path d="M78 65 Q127 51 180 66" fill="none" stroke="#c9c9c4" strokeWidth="10" opacity=".78"/>
    <path d="M153 92 169 286" fill="none" stroke="#e2232a" strokeWidth="3" opacity=".75"/>
    <text x="122" y="84" textAnchor="middle" fill="#eee" fontSize="15" fontWeight="800">SKAWA</text>
  </svg>
  return <svg className="garment-schematic back-schematic" viewBox="0 0 420 360" aria-hidden="true">
    <defs><linearGradient id="backShade" x1="0" x2="1"><stop stopColor="#090909"/><stop offset=".48" stopColor={color}/><stop offset="1" stopColor="#090909"/></linearGradient></defs>
    <path d="M76 55 Q210 31 344 55 L355 103 328 317 230 317 210 233 190 317 92 317 65 103Z" fill="url(#backShade)" stroke="#242424" strokeWidth="5"/>
    <path d="M72 78 Q210 52 348 78" fill="none" stroke="#d9d9d4" strokeWidth="13" opacity=".75"/>
    <path d="M210 91 210 230" fill="none" stroke="#4b4b4b" strokeWidth="3" strokeDasharray="8 7"/>
    <text x="210" y="93" textAnchor="middle" fill="#eee" fontSize="20" fontWeight="800">SKAWA</text>
  </svg>
}

export default function Customizer(){
  const initialProduct=useMemo(requestedProduct,[])
  const initialPreset=presetForProduct(initialProduct.id)
  const[productId,setProductId]=useState(initialProduct.id)
  const[color,setColor]=useState<string>(initialPreset.color)
  const[view,setView]=useState<View>('FRONT')
  const[tab,setTab]=useState<ToolTab>('PRODUCT')
  const[material,setMaterial]=useState('Performance micro-stretch')
  const[print,setPrint]=useState('Sublimation')
  const[zone,setZone]=useState<PrintZone>('right-leg')
  const[text,setText]=useState('YOUR NAME')
  const[artwork,setArtwork]=useState<Artwork|null>(null)
  const[positionX,setPositionX]=useState<number>(printZones['right-leg'].x)
  const[positionY,setPositionY]=useState<number>(printZones['right-leg'].y)
  const[artworkScale,setArtworkScale]=useState<number>(72)
  const[rotation,setRotation]=useState<number>(0)
  const[fileIssue,setFileIssue]=useState('')
  const[saveIssue,setSaveIssue]=useState('')
  const[saved,setSaved]=useState('')
  const[drawerOpen,setDrawerOpen]=useState(false)
  const drawerToggleRef=useRef<HTMLButtonElement>(null)
  const toolPanelRef=useRef<HTMLDivElement>(null)
  const restoreDrawerFocusRef=useRef(false)

  const selectedProduct=products.find(product=>product.id===productId)||products[0]
  const selectedColor=colorOptions.find(option=>option.hex===color)||colorOptions[0]
  const zoneRule=printZones[zone]
  const isLowResolution=Boolean(artwork?.kind==='raster'&&artwork.width&&artwork.height&&(artwork.width<1200||artwork.height<1200))
  const stageAspectRatio=4/3
  const artworkAspectRatio=artwork?.width&&artwork.height?Math.min(3,Math.max(.35,artwork.width/artwork.height)):1
  const artworkWidthPercent=18*(artworkScale/100)
  const artworkHeightPercent=artworkWidthPercent*stageAspectRatio/artworkAspectRatio
  const rotationRadians=rotation*Math.PI/180
  const artworkHalfWidth=(Math.abs(artworkWidthPercent*Math.cos(rotationRadians))+Math.abs((artworkHeightPercent/stageAspectRatio)*Math.sin(rotationRadians)))/2
  const artworkHalfHeight=(Math.abs((artworkWidthPercent*stageAspectRatio)*Math.sin(rotationRadians))+Math.abs(artworkHeightPercent*Math.cos(rotationRadians)))/2
  const isOutsidePrintArea=Boolean(artwork&&(positionX-artworkHalfWidth<zoneRule.minX||positionX+artworkHalfWidth>zoneRule.maxX||positionY-artworkHalfHeight<zoneRule.minY||positionY+artworkHalfHeight>zoneRule.maxY||artworkScale>zoneRule.maxScale))
  const wrongView=Boolean(artwork&&view!==zoneRule.view)
  const placementVisible=view===zoneRule.view

  useEffect(()=>()=>{if(artwork?.url)URL.revokeObjectURL(artwork.url)},[artwork?.url])

  useEffect(()=>{
    const syncProduct=()=>{
      const product=requestedProduct()
      const preset=presetForProduct(product.id)
      setProductId(product.id)
      setColor(preset.color)
    }
    window.addEventListener('popstate',syncProduct)
    return()=>window.removeEventListener('popstate',syncProduct)
  },[])

  useEffect(()=>{
    if(!drawerOpen){
      if(restoreDrawerFocusRef.current){
        restoreDrawerFocusRef.current=false
        requestAnimationFrame(()=>drawerToggleRef.current?.focus({preventScroll:true}))
      }
      return
    }
    const panel=toolPanelRef.current
    const compact=window.matchMedia('(max-width: 760px)').matches
    const previousOverflow=document.body.style.overflow
    if(compact)document.body.style.overflow='hidden'
    const focusable=()=>Array.from(panel?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')||[]).filter(element=>element.offsetParent!==null)
    if(compact)requestAnimationFrame(()=>focusable()[0]?.focus())
    const handleKey=(event:globalThis.KeyboardEvent)=>{
      if(event.key==='Escape'){
        restoreDrawerFocusRef.current=true
        setDrawerOpen(false)
        return
      }
      if(event.key!=='Tab'||!compact)return
      const items=focusable()
      if(!items.length)return
      const first=items[0]
      const last=items[items.length-1]
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
    }
    window.addEventListener('keydown',handleKey)
    return()=>{
      window.removeEventListener('keydown',handleKey)
      if(compact)document.body.style.overflow=previousOverflow
    }
  },[drawerOpen])

  const closeDrawer=()=>{
    restoreDrawerFocusRef.current=true
    setDrawerOpen(false)
  }

  const selectProduct=(id:number,colorValue:string)=>{
    setProductId(id)
    setColor(colorValue)
    setView('FRONT')
    setSaved('')
    setSaveIssue('')
  }

  const selectZone=(nextZone:PrintZone)=>{
    const next=printZones[nextZone]
    setZone(nextZone)
    setPositionX(next.x)
    setPositionY(next.y)
    setArtworkScale(Math.min(72,next.maxScale))
    setRotation(0)
    setView(next.view)
    setSaved('')
    setSaveIssue('')
  }

  const upload=(event:ChangeEvent<HTMLInputElement>)=>{
    const selected=event.target.files?.[0]
    if(!selected)return
    setFileIssue('')
    const extension=selected.name.split('.').pop()?.toLowerCase()||''
    const supported=['png','jpg','jpeg','svg','pdf','ai','eps']
    if(!supported.includes(extension)){
      setFileIssue('Unsupported artwork format. Upload PNG, JPG, SVG, PDF, AI or EPS.')
      event.target.value=''
      return
    }
    if(selected.size>10*1024*1024){
      setFileIssue('Artwork exceeds the 10MB review limit. Export a smaller file or contact production support.')
      event.target.value=''
      return
    }
    const url=URL.createObjectURL(selected)
    if(['png','jpg','jpeg'].includes(extension)){
      const image=new window.Image()
      image.onload=()=>setArtwork({name:selected.name,url,kind:'raster',width:image.naturalWidth,height:image.naturalHeight})
      image.onerror=()=>{URL.revokeObjectURL(url);setFileIssue('This image could not be read. Re-export it and try again.')}
      image.src=url
    }else if(extension==='svg'){
      setArtwork({name:selected.name,url,kind:'vector'})
    }else{
      URL.revokeObjectURL(url)
      setArtwork({name:selected.name,url:'',kind:'document'})
    }
    setSaved('')
    setSaveIssue('')
    event.target.value=''
  }

  const clearArtwork=()=>{
    setArtwork(null)
    setFileIssue('')
    setSaved('')
    setSaveIssue('')
  }

  const reset=()=>{
    const preset=presetForProduct(initialProduct.id)
    setProductId(initialProduct.id)
    setColor(preset.color)
    setView('FRONT')
    setTab('PRODUCT')
    setMaterial('Performance micro-stretch')
    setPrint('Sublimation')
    setZone('right-leg')
    setText('YOUR NAME')
    setArtwork(null)
    setPositionX(printZones['right-leg'].x)
    setPositionY(printZones['right-leg'].y)
    setArtworkScale(72)
    setRotation(0)
    setSaved('')
    setFileIssue('')
    setSaveIssue('')
    setDrawerOpen(false)
  }

  const save=()=>{
    const id=`SKW-${new Date().getFullYear()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`
    const design={id,productId,product:selectedProduct.name,color:selectedColor.name,colorHex:color,view,material,print,zone,text,artwork:artwork?.name||'',artworkFilePersisted:false,positionX,positionY,artworkScale,rotation,needsArtworkReview:isLowResolution||isOutsidePrintArea,savedAt:new Date().toISOString()}
    try{
      const stored=JSON.parse(localStorage.getItem('skawa-designs')||'[]')
      const designs=Array.isArray(stored)?stored:[]
      localStorage.setItem('skawa-designs',JSON.stringify([...designs,design]))
      setSaveIssue('')
      setSaved(id)
    }catch{
      setSaved('')
      setSaveIssue('This browser could not store the design. Keep this page open and request a quote instead.')
    }
  }

  const moveTab=(event:KeyboardEvent<HTMLButtonElement>,current:number)=>{
    let next=current
    if(event.key==='ArrowRight')next=(current+1)%tabs.length
    else if(event.key==='ArrowLeft')next=(current-1+tabs.length)%tabs.length
    else if(event.key==='Home')next=0
    else if(event.key==='End')next=tabs.length-1
    else return
    event.preventDefault()
    setTab(tabs[next])
    const tabButtons=event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    requestAnimationFrame(()=>tabButtons?.[next]?.focus())
  }

  const moveView=(event:KeyboardEvent<HTMLButtonElement>,current:number)=>{
    let next=current
    if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(current+1)%views.length
    else if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(current-1+views.length)%views.length
    else if(event.key==='Home')next=0
    else if(event.key==='End')next=views.length-1
    else return
    event.preventDefault()
    setView(views[next])
    const viewButtons=event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button')
    requestAnimationFrame(()=>viewButtons?.[next]?.focus())
  }

  const artworkStyle={
    left:`${positionX}%`,
    top:`${positionY}%`,
    width:`${artworkWidthPercent}%`,
    height:`${artworkHeightPercent}%`,
    transform:`translate(-50%, -50%) rotate(${rotation}deg)`,
  } as CSSProperties
  const guideStyle={
    left:`${zoneRule.minX}%`,
    top:`${zoneRule.minY}%`,
    width:`${zoneRule.maxX-zoneRule.minX}%`,
    height:`${zoneRule.maxY-zoneRule.minY}%`,
  } as CSSProperties

  return <section id="customizer" className="customizer section">
    <div className="eyebrow">02 / DESIGN LAB</div>
    <div className="section-head">
      <h2>MAKE IT<br/><em>YOURS.</em></h2>
      <p>Build a visual brief, add your identity and save a unique design reference for quoting.</p>
    </div>

    <div className={`customizer-app ref-customizer ${drawerOpen?'drawer-active':''}`}>
      <div className="design-stage">
        <div className="product-thumbs" role="group" aria-label="Fight shorts styles">
          {productPresets.map(preset=><button type="button" key={preset.id} className={productId===preset.id?'active':''} aria-pressed={productId===preset.id} aria-label={`Use ${preset.label}`} onClick={()=>selectProduct(preset.id,preset.color)}><img src={preset.image} alt=""/><span>{preset.label}</span></button>)}
        </div>

        <div className="view-tabs" role="group" aria-label="Garment preview view">
          {views.map((item,index)=><button type="button" key={item} aria-pressed={view===item} className={view===item?'active':''} onKeyDown={event=>moveView(event,index)} onClick={()=>setView(item)}>{item}</button>)}
        </div>

        <div id="garment-preview" className={`shorts-stage customizer-stage-view view-${view.toLowerCase()}`} role="group" aria-label={`${view.toLowerCase()} garment ${view==='FRONT'?'reference visual':'placement schematic'}`}>
          {view==='FRONT'
            ?<img className="garment-front" src={selectedColor.asset||selectedProduct.image} alt={`${selectedProduct.name}, front reference product visual`}/>
            :<><SchematicShorts view={view} color={color}/><span className="schematic-badge" aria-hidden="true">SCHEMATIC</span></>}
          {placementVisible&&<span className="print-zone-guide" aria-hidden="true" style={guideStyle}/>} 
          {placementVisible&&artwork?.url&&<img className={`artwork-on-garment ${isOutsidePrintArea?'outside':''}`} style={artworkStyle} src={artwork.url} alt={`${artwork.name} placement preview`}/>} 
          {placementVisible&&artwork?.kind==='document'&&<span className={`document-artwork-marker ${isOutsidePrintArea?'outside':''}`} style={artworkStyle} aria-label={`${artwork.name} production-file placement marker`}><FileText aria-hidden="true"/><small>PRODUCTION FILE</small></span>}
          {view==='FRONT'&&text&&<span className="customizer-name">{text}</span>}
          {wrongView&&<div className="stage-placement-note" role="status"><ImageIcon aria-hidden="true"/><span>Artwork is assigned to the {zoneRule.view.toLowerCase()} view.</span><button type="button" onClick={()=>setView(zoneRule.view)}>SHOW {zoneRule.view}</button></div>}
        </div>

        <div className="preview-caption">
          <b>{view} {view==='FRONT'?'REFERENCE VISUAL':'PLACEMENT SCHEMATIC'}</b>
          <span>{view==='FRONT'?'Product photography is a placement reference; selected color is conceptual.':'Illustrated guide only — shape, seams and color are approximate, not product photography.'}</span>
        </div>
        <button type="button" className="reset" onClick={reset}><RotateCcw aria-hidden="true"/> Reset design</button>
      </div>

      {drawerOpen&&<button className="mobile-drawer-backdrop" type="button" aria-label="Close design tools" onClick={closeDrawer}/>} 
      <button ref={drawerToggleRef} type="button" className="mobile-tool-toggle" aria-expanded={drawerOpen} aria-controls="customizer-tools" onClick={()=>drawerOpen?closeDrawer():setDrawerOpen(true)}><SlidersHorizontal aria-hidden="true"/> DESIGN TOOLS <ChevronUp aria-hidden="true"/></button>

      <div ref={toolPanelRef} id="customizer-tools" className={`tool-panel ${drawerOpen?'drawer-open':''}`} role={drawerOpen?'dialog':'region'} aria-modal={drawerOpen?true:undefined} aria-label="Design tools">
        <div className="tool-panel-heading">
          <h3>CUSTOMIZE YOUR FIGHT SHORTS</h3>
          <button type="button" className="drawer-close" aria-label="Close design tools" onClick={closeDrawer}><X aria-hidden="true"/></button>
        </div>

        <div className="tabs" role="tablist" aria-label="Customization tools">
          {tabs.map((item,index)=><button id={`customizer-tab-${item.toLowerCase()}`} aria-controls={`customizer-panel-${item.toLowerCase()}`} type="button" role="tab" aria-selected={tab===item} tabIndex={tab===item?0:-1} className={tab===item?'active':''} onKeyDown={event=>moveTab(event,index)} onClick={()=>setTab(item)} key={item}>{item}</button>)}
        </div>

        <div id="customizer-panel-product" role="tabpanel" aria-labelledby="customizer-tab-product" tabIndex={0} hidden={tab!=='PRODUCT'} className="customizer-tool-content">
          <p className="field-label">CHOOSE COLOR</p>
          <div className="swatches named-swatches" role="group" aria-label="Available garment colors">
            {colorOptions.map(option=><button type="button" key={option.hex} aria-label={`Select ${option.name}`} aria-pressed={color===option.hex} title={option.name} onClick={()=>{setColor(option.hex);setSaved('');setSaveIssue('')}} className={color===option.hex?'selected':''} style={{background:option.hex}}><span>{option.name}</span></button>)}
          </div>
          <p className="selection-readout"><span aria-hidden="true" style={{background:color}}/> {selectedColor.name}</p>
          <label htmlFor="material">MATERIAL</label>
          <select id="material" value={material} onChange={event=>{setMaterial(event.target.value);setSaved('');setSaveIssue('')}}><option>Performance micro-stretch</option><option>Lightweight fight satin</option><option>Recycled technical weave</option></select>
          <div className="tool-note"><b>SELECTED PRODUCT</b><p>{selectedProduct.name}. Visuals are placement references; production colors are confirmed during proofing.</p></div>
        </div>

        <div id="customizer-panel-design" role="tabpanel" aria-labelledby="customizer-tab-design" tabIndex={0} hidden={tab!=='DESIGN'} className="customizer-tool-content">
          <label htmlFor="print-zone">PRINT ZONE</label>
          <select id="print-zone" value={zone} onChange={event=>selectZone(event.target.value as PrintZone)}>{Object.entries(printZones).map(([value,item])=><option value={value} key={value}>{item.label} · {item.view.toLowerCase()}</option>)}</select>
          <label htmlFor="print-method">DECORATION METHOD</label>
          <select id="print-method" value={print} onChange={event=>{setPrint(event.target.value);setSaved('');setSaveIssue('')}}><option>Sublimation</option><option>Embroidery</option><option>Screen print</option><option>Woven patch</option></select>
          <div className="tool-note"><b>PRODUCTION NOTE</b><p>{print} compatibility is confirmed after the artwork, fabric, detail size and order quantity are reviewed.</p></div>
        </div>

        <div id="customizer-panel-logos" role="tabpanel" aria-labelledby="customizer-tab-logos" tabIndex={0} hidden={tab!=='LOGOS'} className="customizer-tool-content">
          {!artwork&&<label className="upload"><Upload aria-hidden="true"/> UPLOAD ARTWORK<input aria-label="Upload a logo or production artwork" aria-describedby="artwork-upload-help" onChange={upload} type="file" accept=".png,.jpg,.jpeg,.pdf,.svg,.ai,.eps"/></label>}
          <small id="artwork-upload-help">PNG, JPG, SVG, PDF, AI or EPS · 10MB maximum · 1200px minimum recommended for raster files. The preview stays in this browser session; saving records its name and placement, not the source file.</small>
          {fileIssue&&<div className="validation-message error" role="alert"><X aria-hidden="true"/><div><b>FILE NOT ACCEPTED</b><span>{fileIssue}</span></div></div>}
          {artwork&&<div className="artwork-file-card">
            <div className="artwork-thumbnail">{artwork.url?<img src={artwork.url} alt=""/>:<FileText aria-hidden="true"/>}</div>
            <div><b>{artwork.name}</b><span>{artwork.kind==='raster'?`${artwork.width} × ${artwork.height}px`:artwork.kind==='vector'?'Vector artwork':'Production artwork file'}</span></div>
            <button type="button" aria-label="Remove uploaded artwork" onClick={clearArtwork}><X aria-hidden="true"/></button>
          </div>}
          {artwork&&<fieldset className="placement-controls">
            <legend className="placement-title"><Move aria-hidden="true"/><b>ARTWORK PLACEMENT</b><span>{printZones[zone].label}</span></legend>
            <label htmlFor="artwork-x">Horizontal <output htmlFor="artwork-x">{positionX}%</output></label>
            <input id="artwork-x" type="range" min="5" max="95" value={positionX} aria-valuetext={`${positionX} percent`} onChange={event=>{setPositionX(Number(event.target.value));setSaved('');setSaveIssue('')}}/>
            <label htmlFor="artwork-y">Vertical <output htmlFor="artwork-y">{positionY}%</output></label>
            <input id="artwork-y" type="range" min="10" max="90" value={positionY} aria-valuetext={`${positionY} percent`} onChange={event=>{setPositionY(Number(event.target.value));setSaved('');setSaveIssue('')}}/>
            <label htmlFor="artwork-scale">Scale <output htmlFor="artwork-scale">{artworkScale}%</output></label>
            <input id="artwork-scale" type="range" min="30" max="140" value={artworkScale} aria-valuetext={`${artworkScale} percent`} onChange={event=>{setArtworkScale(Number(event.target.value));setSaved('');setSaveIssue('')}}/>
            <label htmlFor="artwork-rotation">Rotation <output htmlFor="artwork-rotation">{rotation}°</output></label>
            <input id="artwork-rotation" type="range" min="-180" max="180" value={rotation} aria-valuetext={`${rotation} degrees`} onChange={event=>{setRotation(Number(event.target.value));setSaved('');setSaveIssue('')}}/>
            <button type="button" className="center-artwork" onClick={()=>selectZone(zone)}>RESET TO SAFE AREA</button>
          </fieldset>}
        </div>

        <div id="customizer-panel-text" role="tabpanel" aria-labelledby="customizer-tab-text" tabIndex={0} hidden={tab!=='TEXT'} className="customizer-tool-content">
          <label htmlFor="design-text">FRONT PERSONALIZATION</label>
          <input id="design-text" className="tool-input" maxLength={18} value={text} aria-describedby="design-text-help" onChange={event=>{setText(event.target.value.toUpperCase());setSaved('');setSaveIssue('')}}/>
          <small id="design-text-help">{text.length}/18 characters · Previewed on the front waistband. Final typography, spacing and placement are confirmed in the production proof.</small>
        </div>

        <div id="customizer-panel-review" role="tabpanel" aria-labelledby="customizer-tab-review" tabIndex={0} hidden={tab!=='REVIEW'} className="customizer-tool-content">
          <div className="review-list" role="list">
            <span role="listitem"><Check aria-hidden="true"/><b>{selectedProduct.name}</b></span>
            <span role="listitem"><Check aria-hidden="true"/>{selectedColor.name} · {material}</span>
            <span role="listitem"><Check aria-hidden="true"/>{printZones[zone].label} · {print}</span>
            <span role="listitem" className={artwork?'':'muted'}>{artwork?<Check aria-hidden="true"/>:<ImageIcon aria-hidden="true"/>}{artwork?artwork.name:'Artwork is optional'}</span>
            <span role="listitem"><Check aria-hidden="true"/>{text||'No personalization text'}</span>
            {(isLowResolution||isOutsidePrintArea)&&<span role="listitem" className="needs-review"><AlertTriangle aria-hidden="true"/>Artwork needs production review</span>}
          </div>
        </div>

        {(isLowResolution||isOutsidePrintArea||wrongView)&&<div className="customizer-warnings" aria-live="polite" aria-atomic="false">
          {isLowResolution&&<div className="validation-message warning"><AlertTriangle aria-hidden="true"/><div><b>RASTER ARTWORK MAY PRINT SOFT</b><span>Use a file at least 1200px wide and tall, or upload vector artwork for the cleanest result.</span></div></div>}
          {isOutsidePrintArea&&<div id="artwork-boundary-warning" className="validation-message warning"><AlertTriangle aria-hidden="true"/><div><b>ARTWORK EXTENDS OUTSIDE THE PRINT AREA</b><span>Move, rotate or scale the artwork until it sits inside the dotted {zoneRule.label.toLowerCase()} guide.</span></div></div>}
          {wrongView&&<div className="validation-message info"><ImageIcon aria-hidden="true"/><div><b>VIEW DOES NOT MATCH SELECTED ZONE</b><span>Switch to {zoneRule.view.toLowerCase()} to review the {zoneRule.label.toLowerCase()} placement accurately.</span></div></div>}
        </div>}
      </div>

      <aside className="summary" aria-label="Design summary">
        <span>{selectedProduct.price==='Quote only'?'PRICING':'ESTIMATED PRICE'}</span><h3>{selectedProduct.price}</h3>
        <dl><div><dt>Product</dt><dd>{selectedProduct.name}</dd></div><div><dt>Color</dt><dd>{selectedColor.name}</dd></div><div><dt>Print zone</dt><dd>{zoneRule.label}</dd></div><div><dt>Method</dt><dd>{print}</dd></div><div><dt>Artwork</dt><dd>{artwork?'Added':'Not added'}</dd></div></dl>
        {saved&&<div className="design-saved" role="status"><Check aria-hidden="true"/><div><small>DESIGN SAVED</small><b>{saved}</b></div></div>}
        {saveIssue&&<div className="save-issue" role="alert"><AlertTriangle aria-hidden="true"/><span>{saveIssue}</span></div>}
        <button type="button" className="btn primary" onClick={save}>SAVE DESIGN</button>
        <Link className="btn ghost" to={`/request-mockup?intent=custom-design&product=${slug(selectedProduct.name)}`}>REQUEST QUOTE</Link>
        <small>Estimate shown for interface demonstration. Placement is a visual brief, not a production proof. Final artwork, color and pricing require review.</small>
      </aside>
    </div>
  </section>
}
