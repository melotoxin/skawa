import type {Product} from '../types'

export type DesignSide = 'front' | 'back'
export type Pattern = 'solid' | 'slash' | 'stripe' | 'camo' | 'fade'
export type Placement = {side:DesignSide; x:number; y:number; size:number; rotation:number}
export type Design = {
  version:2; productId:number; color:string; accent:string; trim:string; pattern:Pattern;
  material:string; print:string; size:string; quantity:number;
  text:string; textColor:string; font:string; textPlacement:Placement;
  logo:string; logoName:string; logoPlacement:Placement;
}
export type SavedDesign = Design & {id:string; product:string; savedAt:string}
export const fonts = ['Impact', 'Arial', 'Georgia', 'monospace']
export const patterns:Pattern[] = ['solid','slash','stripe','camo','fade']
export const palette = ['#151515','#df202b','#174d79','#16612c','#d1a021','#f0f0ed']
export function defaultDesign(product:Product):Design {
  return {version:2,productId:product.id,color:'#151515',accent:'#df202b',trim:'#080808',pattern:'slash',
    material:product.material||'Performance stretch',print:'Sublimation',size:product.sizes[0]||'M',quantity:1,
    text:'YOUR NAME',textColor:'#ffffff',font:'Impact',textPlacement:{side:'front',x:50,y:27,size:8,rotation:0},
    logo:'',logoName:'',logoPlacement:{side:'front',x:65,y:60,size:18,rotation:0}}
}

// Normalized outlines generate actual beveled volumes. Replace with approved UV-mapped GLBs later.
export function outline(product:Product):[number,number][] {
  const kind=product.modelKind
  if(kind==='rashguard'||kind==='gi'||kind==='uniform') {
    const long=product.slug!=='short-sleeves'
    return [[-.34,1.12],[-.67,1.16],[-1.38,long?-.22:.65],[-1.04,long?-.44:.38],[-.65,.55],[-.64,-1.2],[.64,-1.2],[.65,.55],[1.04,long?-.44:.38],[1.38,long?-.22:.65],[.67,1.16],[.34,1.12],[.22,.86],[-.22,.86]]
  }
  if(kind==='gloves'||kind==='mma-gloves'||kind==='mitt')return [[-.55,1.15],[-.85,.85],[-.86,.1],[-1,-.12],[-.86,-.55],[-.57,-.6],[-.52,-1.15],[.45,-1.15],[.57,-.5],[.78,.15],[.75,.85],[.5,1.15]]
  if(kind==='belt'||kind==='wrap')return [[-1.4,.28],[-.22,.28],[-.3,1.1],[.14,1.12],[.35,.28],[1.4,.28],[1.4,-.1],[.4,-.1],[.75,-1.12],[.35,-1.25],[.05,-.16],[-.38,-1.22],[-.72,-1.1],[-.35,-.1],[-1.4,-.1]]
  if(kind==='bag')return [[-1.28,-1],[-1.28,.62],[-.8,.85],[-.6,1.18],[.6,1.18],[.8,.85],[1.28,.62],[1.28,-1]]
  if(kind==='shin')return [[-.55,1.25],[-.7,.6],[-.48,-.9],[-.7,-1.22],[.7,-1.22],[.48,-.9],[.7,.6],[.55,1.25]]
  if(kind==='mouthguard')return [[-1,.65],[-1,-.2],[-.65,-.7],[.65,-.7],[1,-.2],[1,.65],[.62,.65],[.52,-.25],[-.52,-.25],[-.62,.65]]
  const narrow=kind==='spats'
  return [[-1,1.1],[1,1.1],[narrow?.73:1.22,-1.2],[.22,-1.2],[0,-.3],[-.22,-1.2],[narrow?-.73:-1.22,-1.2]]
}

export function readDesigns():SavedDesign[] {
  try {const items=JSON.parse(localStorage.getItem('skawa-designs')||'[]');return Array.isArray(items)?items:[]}catch{return []}
}
export function isDesign(value:unknown):value is Design {
  if(!value||typeof value!=='object')return false
  const d=value as Design
  const hex=(s:unknown)=>typeof s==='string'&&/^#[\da-f]{6}$/i.test(s)
  const placement=(p:Placement)=>p&&['front','back'].includes(p.side)&&[p.x,p.y,p.size,p.rotation].every(Number.isFinite)&&p.x>=0&&p.x<=100&&p.y>=0&&p.y<=100&&p.size>=1&&p.size<=70&&Math.abs(p.rotation)<=180
  return d.version===2&&Number.isInteger(d.productId)&&hex(d.color)&&hex(d.accent)&&hex(d.trim)&&hex(d.textColor)&&patterns.includes(d.pattern)&&fonts.includes(d.font)&&typeof d.text==='string'&&d.text.length<=32&&typeof d.logo==='string'&&d.logo.length<3000000&&(!d.logo||/^data:image\/(png|jpeg|webp);base64,/.test(d.logo))&&typeof d.logoName==='string'&&typeof d.material==='string'&&typeof d.print==='string'&&typeof d.size==='string'&&Number.isInteger(d.quantity)&&d.quantity>=1&&d.quantity<=10000&&placement(d.textPlacement)&&placement(d.logoPlacement)
}

export function downloadFile(blob:Blob,name:string) {
  const url=URL.createObjectURL(blob),a=document.createElement('a')
  a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
}

/** Same artwork canvas drives the 2D proof and UV textures on both sides of the 3D mesh. */
export async function paintDesign(design:Design,product:Product,side:DesignSide,proof=false) {
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1024
  const ctx=canvas.getContext('2d')!
  const px=(v:number)=>(v+1.65)/3.3*1024,py=(v:number)=>(1.65-v)/3.3*1024
  if(proof){ctx.save();ctx.beginPath();outline(product).forEach(([x,y],i)=>i?ctx.lineTo(px(x),py(y)):ctx.moveTo(px(x),py(y)));ctx.closePath();ctx.clip()}
  ctx.fillStyle=design.color;ctx.fillRect(0,0,1024,1024)
  ctx.fillStyle=design.accent
  if(design.pattern==='slash')for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(40,360+i*95);ctx.lineTo(485,160+i*95);ctx.lineTo(185,490+i*95);ctx.closePath();ctx.fill()}
  if(design.pattern==='stripe'){ctx.fillRect(220,0,70,1024);ctx.fillRect(744,0,70,1024)}
  if(design.pattern==='camo')for(let i=0;i<65;i++){const x=(i*137)%1024,y=(i*227)%1024;ctx.globalAlpha=i%2?.35:.8;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+100,y+17);ctx.lineTo(x+140,y+65);ctx.lineTo(x+42,y+100);ctx.lineTo(x-26,y+37);ctx.fill()}
  ctx.globalAlpha=1
  if(design.pattern==='fade'){const g=ctx.createLinearGradient(0,250,0,900);g.addColorStop(0,design.color);g.addColorStop(1,design.accent);ctx.fillStyle=g;ctx.fillRect(0,0,1024,1024)}
  const upper=['rashguard','gi','uniform'].includes(product.modelKind||'')
  ctx.fillStyle=design.trim
  if(upper){ctx.fillRect(0,865,1024,45);if(product.modelKind==='gi'||product.modelKind==='uniform'){ctx.save();ctx.translate(512,370);ctx.rotate(-.22);ctx.fillRect(-28,-250,56,700);ctx.restore()}}
  else {ctx.fillRect(0,150,1024,90);ctx.fillRect(0,870,1024,30)}
  // Fine weave, generated locally; no texture request or hidden remote dependency.
  ctx.strokeStyle='rgba(255,255,255,.045)';ctx.lineWidth=1
  for(let n=0;n<1024;n+=design.material.toLowerCase().includes('cotton')?7:4){ctx.beginPath();ctx.moveTo(n,0);ctx.lineTo(n,1024);ctx.stroke()}
  if(design.logo&&design.logoPlacement.side===side){const img=new Image();await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject(new Error('Logo could not be rendered'));img.src=design.logo});const p=design.logoPlacement,w=p.size/100*1024,h=w*img.height/img.width;ctx.save();ctx.translate(p.x/100*1024,p.y/100*1024);ctx.rotate(p.rotation*Math.PI/180);ctx.drawImage(img,-w/2,-h/2,w,h);ctx.restore()}
  if(design.text&&design.textPlacement.side===side){const p=design.textPlacement;ctx.save();ctx.translate(p.x/100*1024,p.y/100*1024);ctx.rotate(p.rotation*Math.PI/180);ctx.fillStyle=design.textColor;ctx.font=`bold ${p.size*8}px ${design.font}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(design.text,0,0,680);ctx.restore()}
  if(proof)ctx.restore()
  return canvas
}
