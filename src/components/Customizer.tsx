import {Component,Suspense,lazy,useEffect,useMemo,useRef,useState,type ChangeEvent,type ReactNode,type CSSProperties} from 'react'
import {ArrowLeft,ArrowRight,Check,Download,ImagePlus,RotateCcw,RotateCw,Save,Upload,X,ZoomIn,ZoomOut} from 'lucide-react'
import {products} from '../data'
import {go} from '../routing'
import {defaultDesign,downloadFile,fonts,isDesign,paintDesign,palette,patterns,readDesigns,type Design,type DesignSide,type Placement,type SavedDesign} from '../lib/customDesign'
import '../design-lab.css'

const Scene=lazy(()=>import('./three/DesignPreview3D'))
const tabs=['Product','Design','Logos','Text','Review'] as const
type Tab=typeof tabs[number]
const presets=products.filter(p=>p.custom)
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
function ColorField({label,value,onChange}:{label:string;value:string;onChange:(color:string)=>void}){
  return <fieldset className="dl-colors"><legend>{label}</legend><div>{palette.map(hex=><button type="button" key={hex} aria-label={`${label} ${hex}`} aria-pressed={hex===value} style={{background:hex}} onClick={()=>onChange(hex)}>{hex===value&&<Check style={{color:hex==='#f0f0ed'?'#111':'white'}}/>}</button>)}<label className="dl-picker" title={`Choose any ${label.toLowerCase()}`}><input type="color" aria-label={`Custom ${label.toLowerCase()}`} value={value} onChange={e=>onChange(e.target.value)}/><span>+</span></label></div><small>{value.toUpperCase()}</small></fieldset>
}
function PlacementFields({label,value,onChange,onView}:{label:string;value:Placement;onChange:(p:Placement)=>void;onView:(side:DesignSide)=>void}){
  return <fieldset className="dl-placement"><legend>{label} placement</legend><label>Print side<select value={value.side} onChange={e=>{const side=e.target.value as DesignSide;onChange({...value,side});onView(side)}}><option value="front">Front</option><option value="back">Back</option></select></label>{(['x','y','size','rotation'] as const).map(key=><label key={key}>{({x:'Horizontal',y:'Vertical',size:'Size',rotation:'Rotation'})[key]}<output>{value[key]}{key==='rotation'?'°':'%'}</output><input type="range" aria-label={`${label} ${({x:'horizontal',y:'vertical',size:'size',rotation:'rotation'})[key]}`} min={key==='rotation'?-180:key==='size'?2:15} max={key==='rotation'?180:key==='size'?35:85} value={value[key]} onChange={e=>onChange({...value,[key]:Number(e.target.value)})}/></label>)}<button type="button" className="dl-secondary" onClick={()=>onChange({...value,x:50,y:50,rotation:0})}>Center {label.toLowerCase()}</button></fieldset>
}

export default function Customizer(){
  const[design,setDesign]=useState<Design>(initialDesign)
  const[tab,setTab]=useState<Tab>('Product')
  const[view,setView]=useState('perspective')
  const[mode,setMode]=useState<'3d'|'2d'>('3d')
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
  const[noWebGL,setNoWebGL]=useState(false)
  const uploadToken=useRef(0)
  const product=useMemo(()=>presets.find(p=>p.id===design.productId)||presets[0],[design.productId])
  const reducedMotion=useMemo(()=>matchMedia('(prefers-reduced-motion: reduce)').matches,[])
  const update=(patch:Partial<Design>)=>{setHistory(h=>[...h.slice(-19),design]);setFuture([]);setDesign(d=>({...d,...patch}));setSavedId('');setStatus('');setError('')}
  const setPreview=(side:string)=>{setView(side);setSpin(false)}
  useEffect(()=>{let active=true;setRendering(true);Promise.all([paintDesign(design,product,'front'),paintDesign(design,product,'back'),paintDesign(design,product,'front',true),paintDesign(design,product,'back',true)]).then(([front,back,pf,pb])=>{if(active){setFrames({front,back,proofFront:pf.toDataURL(),proofBack:pb.toDataURL()});setRendering(false)}}).catch(()=>{if(active){setRendering(false);setError('The preview could not render this artwork. Remove the logo and try another image.')}});return()=>{active=false}},[design,product])
  useEffect(()=>()=>{uploadToken.current++},[])
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
        if(token===uploadToken.current){update({logo,logoName:file.name});setPreview(design.logoPlacement.side);setStatus('Logo added. Use the placement controls to size, move and rotate it.')}
      }finally{URL.revokeObjectURL(url)}
    }catch(e){if(token===uploadToken.current)setError(e instanceof Error?e.message:'Logo upload failed.')}finally{if(token===uploadToken.current)setBusy(false)}
  }
  const importDesign=async(event:ChangeEvent<HTMLInputElement>)=>{
    const file=event.target.files?.[0];event.target.value='';if(!file)return
    try{if(file.size>4*1024*1024)throw new Error();const next:unknown=JSON.parse(await file.text());if(!isDesign(next)||!presets.some(p=>p.id===next.productId))throw new Error();restore(next);setStatus('Design imported, including its artwork.')}catch{setError('Choose a valid SKAWA design JSON exported from this Design Lab.')}
  }
  const downloadPreview=()=>{if(!frames)return;const c=document.createElement('canvas');c.width=2048;c.height=1120;const ctx=c.getContext('2d')!;ctx.fillStyle='#f1f1ef';ctx.fillRect(0,0,c.width,c.height);Promise.all([frames.proofFront,frames.proofBack].map(src=>new Promise<HTMLImageElement>((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src}))).then(([f,b])=>{ctx.drawImage(f,0,50);ctx.drawImage(b,1024,50);ctx.fillStyle='#161616';ctx.font='bold 26px Arial';ctx.fillText(`${product.name} · FRONT`,55,48);ctx.fillText('BACK',1079,48);ctx.font='20px Arial';ctx.fillText('SKAWA FIGHT · Design concept — final fit, color and print placement subject to production approval.',55,1085);c.toBlob(blob=>{if(blob)downloadFile(blob,'skawa-design-preview.png')},'image/png')}).catch(()=>setError('Preview download failed. Try again after the artwork finishes loading.'))}
  const undo=()=>{const last=history.at(-1);if(!last)return;setFuture(f=>[design,...f]);setHistory(h=>h.slice(0,-1));setDesign(last);setSavedId('');setStatus('')}
  const redo=()=>{if(!future[0])return;setHistory(h=>[...h,design]);setDesign(future[0]);setFuture(f=>f.slice(1));setSavedId('');setStatus('')}
  const proof=frames&&(view==='back'?frames.proofBack:frames.proofFront)
  const fallback=<div className="dl-flat">{proof?<img src={proof} alt={`${product.name} ${view==='back'?'back':'front'} design preview`}/>:<p role="status">Preparing your design…</p>}</div>

  return <section className="design-lab" aria-label="Fightwear customizer">
    <header className="dl-heading"><div><span>SKAWA / DESIGN LAB</span><h2>MAKE IT YOURS.</h2><p>Your colors. Your artwork. Every angle.</p></div><div className="dl-history"><button onClick={undo} disabled={!history.length} aria-label="Undo design change"><ArrowLeft/></button><button onClick={redo} disabled={!future.length} aria-label="Redo design change"><ArrowRight/></button><button aria-label="Reset design" onClick={()=>{restore(defaultDesign(product));setStatus('Design reset. Use Undo to recover your previous design.')}}><RotateCcw/> Reset</button></div></header>
    <div className="dl-workspace">
      <div className="dl-preview-column"><div className="dl-stage">
        <div className="dl-preview-toolbar"><span>{mode==='3d'&&!noWebGL?'3D LIVE PREVIEW':'2D DESIGN PROOF'}</span><div><button aria-pressed={mode==='3d'} onClick={()=>{setMode('3d');setPreview('front')}}>3D</button><button aria-pressed={mode==='2d'} onClick={()=>{setMode('2d');setPreview(view==='back'?'back':'front')}}>2D</button></div></div>
        <div className="dl-canvas" role="group" aria-label={`Interactive ${product.name} preview. Drag to rotate in 3D, or use the view buttons.`}>
          {mode==='3d'&&!noWebGL&&frames?<PreviewBoundary fallback={<><div className="dl-preview-error">3D unavailable on this device. Your 2D proof and editing controls remain available.</div>{fallback}</>}><Suspense fallback={fallback}><Scene product={product} front={frames.front} back={frames.back} color={design.color} view={view} zoom={zoom} spin={spin&&!reducedMotion} onUnavailable={()=>{setNoWebGL(true);setError('3D is unavailable on this device. Continue designing with the 2D proof.')}}/></Suspense></PreviewBoundary>:fallback}
        </div>
        <div className="dl-camera"><div role="group" aria-label="Preview angle">{(mode==='2d'?['front','back']:['front','back','left','right']).map(side=><button key={side} aria-pressed={view===side} onClick={()=>setPreview(side)}>{side}</button>)}</div>{mode==='3d'&&<div><button aria-label="Zoom out" disabled={zoom<=.8} onClick={()=>setZoom(z=>Math.max(.8,z-.15))}><ZoomOut/></button><button aria-label="Zoom in" disabled={zoom>=1.6} onClick={()=>setZoom(z=>Math.min(1.6,z+.15))}><ZoomIn/></button><button aria-label="Auto rotate preview" aria-pressed={spin} disabled={reducedMotion} onClick={()=>setSpin(s=>!s)}><RotateCw/></button></div>}</div>
        <p className="dl-preview-note">{mode==='3d'?'Drag to rotate · Demo 3D geometry':'Front & back design proof'}<span>Production fit and print placement require an approved sample.</span></p>
        {rendering&&<span className="dl-updating" role="status">Updating preview…</span>}
      </div><div className="dl-product-caption"><img src={product.image} alt={`${product.name} catalog reference`}/><div><small>YOUR PRODUCT</small><h3>{product.name}</h3><span>{product.category} · Custom order</span></div><b>{product.price}<small>Base price / quote review</small></b></div></div>

      <div className="dl-editor"><h3>CUSTOMIZE YOUR GEAR</h3><div className="dl-tabs" role="tablist" aria-label="Design tools">{tabs.map((name,index)=><button key={name} id={`dl-tab-${name}`} role="tab" aria-selected={tab===name} aria-controls={`dl-panel-${name}`} tabIndex={tab===name?0:-1} onClick={()=>setTab(name)} onKeyDown={e=>{const next=e.key==='ArrowRight'?(index+1)%5:e.key==='ArrowLeft'?(index+4)%5:e.key==='Home'?0:e.key==='End'?4:-1;if(next>=0){e.preventDefault();setTab(tabs[next]);document.getElementById(`dl-tab-${tabs[next]}`)?.focus()}}}>{name}</button>)}</div>
      <div id={`dl-panel-${tab}`} role="tabpanel" aria-labelledby={`dl-tab-${tab}`} className="dl-panel">
      {tab==='Product'&&<><label>Choose product<select value={design.productId} onChange={e=>{const p=presets.find(p=>p.id===Number(e.target.value))!;update({productId:p.id,material:p.material||'Performance stretch',size:p.sizes[0]||'M'});setPreview('front')}}>{presets.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label><div className="dl-field-row"><label>Size<select value={design.size} onChange={e=>update({size:e.target.value})}>{(product.sizes.length?product.sizes:['S','M','L','XL']).map(size=><option key={size}>{size}</option>)}</select></label><label>Quantity<input aria-label="Quantity" type="number" min={1} max={10000} value={design.quantity} onChange={e=>update({quantity:Math.min(10000,Math.max(1,Math.round(Number(e.target.value)||1)))})}/></label></div><ColorField label="Base color" value={design.color} onChange={color=>update({color})}/><ColorField label="Trim color" value={design.trim} onChange={trim=>update({trim})}/><p className="dl-help">Colors apply directly to the garment preview. Choose Design to add a pattern or accent color.</p></>}
      {tab==='Design'&&<><fieldset className="dl-patterns"><legend>Choose a design</legend><div>{patterns.map(pattern=><button aria-pressed={design.pattern===pattern} key={pattern} onClick={()=>update({pattern})}><i className={`dl-pattern-${pattern}`} style={{'--base':design.color,'--accent':design.accent} as CSSProperties}/>{pattern}</button>)}</div></fieldset><ColorField label="Accent color" value={design.accent} onChange={accent=>update({accent})}/><label>Fabric finish<select value={design.material} onChange={e=>update({material:e.target.value})}>{Array.from(new Set([product.material,'Performance stretch','Cotton weave','Matte technical knit',design.material])).filter(Boolean).map(m=><option key={m}>{m}</option>)}</select></label><label>Decoration method<select value={design.print} onChange={e=>update({print:e.target.value})}>{Array.from(new Set(['Sublimation','Screen print','Embroidery',design.print])).map(p=><option key={p}>{p}</option>)}</select></label><p className="dl-help">The preview shows artwork placement. Fabric and decoration availability are confirmed with your quote.</p></>}
      {tab==='Logos'&&<><label className="dl-upload"><ImagePlus/><b>{busy?'Reading artwork…':'Upload your logo'}</b><span>PNG, JPG, WebP or SVG · Up to 10 MB</span><input disabled={busy} type="file" accept=".png,.jpg,.jpeg,.webp,.svg" aria-label="Upload logo" onChange={uploadLogo}/></label>{design.logo?<><div className="dl-logo-file"><img src={design.logo} alt="Uploaded logo"/><span>{design.logoName}</span><button aria-label="Remove logo" onClick={()=>update({logo:'',logoName:''})}><X/></button></div><PlacementFields label="Logo" value={design.logoPlacement} onChange={logoPlacement=>update({logoPlacement})} onView={setPreview}/></>:<p className="dl-help">Transparent PNG or SVG works best. After uploading, choose front or back and adjust position, size and rotation.</p>}</>}
      {tab==='Text'&&<><label>Your text<input aria-label="Personalization text" placeholder="Your name, team or motto" maxLength={32} value={design.text} onChange={e=>update({text:e.target.value})}/></label><small>{design.text.length}/32 characters</small><label>Font<select value={design.font} onChange={e=>update({font:e.target.value})}>{fonts.map(f=><option key={f}>{f}</option>)}</select></label><ColorField label="Text color" value={design.textColor} onChange={textColor=>update({textColor})}/><PlacementFields label="Text" value={design.textPlacement} onChange={textPlacement=>update({textPlacement})} onView={setPreview}/><button className="dl-secondary" disabled={!design.text} onClick={()=>update({text:''})}>Remove text</button></>}
      {tab==='Review'&&<><h4>YOUR DESIGN, READY TO REVIEW.</h4><dl className="dl-specs">{Object.entries({Product:product.name,Size:design.size,Quantity:design.quantity,Colors:`${design.color} / ${design.accent} / ${design.trim}`,Pattern:design.pattern,Fabric:design.material,Method:design.print,Text:design.text||'None',Logo:design.logoName||'None'}).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><button className="dl-secondary" onClick={downloadPreview} disabled={!frames||rendering}><Download/> Download front & back PNG</button><button className="dl-secondary" onClick={()=>downloadFile(new Blob([JSON.stringify(design,null,2)],{type:'application/json'}),'skawa-design.json')}><Download/> Export editable design</button><label className="dl-import"><Upload/> Import saved design<input type="file" accept=".json" aria-label="Import design" onChange={importDesign}/></label><label>Load a saved design<select value="" onChange={e=>{const item=savedList.find(d=>d.id===e.target.value);if(isDesign(item)&&presets.some(p=>p.id===item.productId)){restore(item);setSavedId(item.id);setStatus('Saved design loaded.')}else setError('This older design is missing editable artwork. Start a new design or import a current export.')}}><option value="">Select a design…</option>{savedList.map(d=><option key={d.id} value={d.id}>{d.id} · {d.product||'Custom gear'}</option>)}</select></label><p className="dl-help">Save keeps the complete design and logo in this browser. Export a file to back it up or open it on another device.</p></>}
      </div>
      <div className="dl-actions">{status&&<p className="dl-success" role="status"><Check/>{status}</p>}{error&&<p className="dl-error" role="alert">{error}</p>}<button className="dl-primary" disabled={busy} onClick={save}><Save/> {savedId?'DESIGN SAVED':'SAVE DESIGN'}</button><button className="dl-secondary" disabled={busy} onClick={()=>{const id=save();if(id)go(`/request-mockup?intent=custom-design&product=${product.slug}&design=${id}`)}}>REQUEST A QUOTE <ArrowRight/></button><p>Custom order pricing is confirmed after design review.</p></div>
      </div>
    </div>
  </section>
}
