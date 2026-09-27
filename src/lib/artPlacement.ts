import type {DesignSide,Placement} from './customDesign'

export type ArtKey = 'textPlacement' | 'logoPlacement'
export type ArtTarget = {
  text:string
  textPlacement:Placement
  hasLogo:boolean
  logoPlacement:Placement
  logoAspect:number
  mirrorText:boolean
  mirrorLogo:boolean
}

const clamp=(n:number)=>Math.round(Math.min(100,Math.max(0,n)))

function hits(px:number,py:number,placement:Placement,w:number,h:number){
  const cx=placement.x/100*1024,cy=placement.y/100*1024
  const a=-placement.rotation*Math.PI/180
  const dx=px-cx,dy=py-cy
  const lx=dx*Math.cos(a)-dy*Math.sin(a)
  const ly=dx*Math.sin(a)+dy*Math.cos(a)
  return Math.abs(lx)<=w/2&&Math.abs(ly)<=h/2
}

function textBox(text:string,placement:Placement){
  const font=placement.size*8
  const width=Math.min(680,Math.max(font,text.length*font*0.58))
  return {w:width+72,h:font*1.45+48}
}

function logoBox(placement:Placement,aspect:number){
  const w=placement.size/100*1024+56
  return {w,h:w*Math.max(aspect,.2)+56}
}

/** Text is painted over the logo, so a shared point grabs the name first. */
export function pickArt(x:number,y:number,art:ArtTarget,side:DesignSide):ArtKey|null{
  if(art.text&&(art.mirrorText||art.textPlacement.side===side)){
    const box=textBox(art.text,art.textPlacement)
    if(hits(x,y,art.textPlacement,box.w,box.h))return 'textPlacement'
  }
  if(art.hasLogo&&(art.mirrorLogo||art.logoPlacement.side===side)){
    const box=logoBox(art.logoPlacement,art.logoAspect)
    if(hits(x,y,art.logoPlacement,box.w,box.h))return 'logoPlacement'
  }
  return null
}

export function moveArt(placement:Placement,canvasX:number,canvasY:number,offsetX:number,offsetY:number,side:DesignSide):Placement{
  return {...placement,side,x:clamp((canvasX-offsetX)/1024*100),y:clamp((canvasY-offsetY)/1024*100)}
}
