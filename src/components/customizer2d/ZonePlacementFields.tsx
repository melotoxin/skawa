import type {ZonePlacement} from '../../lib/customDesign'
import {findZone,zonesOn} from '../../lib/customizer2d/placement'
import type {Template2D,ZoneKind} from '../../lib/customizer2d/types'

const sliders=[['u','Horizontal',0,100],['v','Vertical',0,100],['scale','Size',15,100],['rotation','Rotation',-180,180]] as const

/** Placement controls for a templated product in 2D: a print zone, then position, size and rotation within it. */
export default function ZonePlacementFields({label,kind,template,value,onChange,mirror,onMirror}:{label:string;kind:ZoneKind;template:Template2D;value:ZonePlacement;onChange:(p:ZonePlacement)=>void;mirror:boolean;onMirror:(on:boolean)=>void}){
  const zone=findZone(template,value.side,value.zone)
  const twin=Boolean(zone?.counterpart&&template.views.back)
  const shown=(key:typeof sliders[number][0])=>key==='rotation'?value.rotation:Math.round(value[key]*100)
  return <fieldset className="dl-placement"><legend>{label} placement</legend>
    <label>Placement zone<select aria-label={`${label} placement zone`} value={`${value.side}:${value.zone}`} onChange={e=>{const [side,id]=e.target.value.split(':') as [ZonePlacement['side'],string];onChange({...value,side,zone:id,u:.5,v:.5})}}>{(['front','back'] as const).map(side=>{const zones=zonesOn(template,side).filter(z=>z.accepts.includes(kind));return zones.length?<optgroup key={side} label={side==='front'?'Front':'Back'}>{zones.map(z=><option key={z.id} value={`${side}:${z.id}`}>{z.label}</option>)}</optgroup>:null})}</select></label>
    <label className="dl-check"><input type="checkbox" checked={mirror&&twin} disabled={!twin} onChange={e=>onMirror(e.target.checked)}/>Show on both sides</label>
    <p className="dl-help">{twin?`On, this ${label.toLowerCase()} also prints on the matching ${zone?.counterpart?findZone(template,value.side==='front'?'back':'front',zone.counterpart)?.label.toLowerCase():'zone'}.`:'This zone has no matching zone on the other side.'}</p>
    {sliders.map(([key,name,min,max])=><label key={key}>{name}<output>{shown(key)}{key==='rotation'?'°':'%'}</output><input type="range" aria-label={`${label} ${name.toLowerCase()}`} min={min} max={max} value={shown(key)} onChange={e=>{const n=Number(e.target.value);onChange({...value,[key]:key==='rotation'?n:n/100})}}/></label>)}
    <button type="button" className="dl-secondary" onClick={()=>onChange({...value,u:.5,v:.5,rotation:0})}>Center {label.toLowerCase()} in zone</button>
    <p className="dl-help">Drag it on the proof. Drop it on another zone, or on the other view, to move it there.</p>
  </fieldset>
}
