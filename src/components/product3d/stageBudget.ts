/** Caps concurrent WebGL canvases — browsers typically allow ~8–16 contexts. */
const MAX_LIVE=4

type Entry={id:string;ratio:number;setLive:(live:boolean)=>void}

const entries=new Map<string,Entry>()

function recompute(){
  const ranked=[...entries.values()].sort((a,b)=>b.ratio-a.ratio)
  const winners=new Set(ranked.filter(e=>e.ratio>0.08).slice(0,MAX_LIVE).map(e=>e.id))
  for(const entry of entries.values()){
    entry.setLive(winners.has(entry.id))
  }
}

export function reportStageVisibility(id:string,ratio:number,setLive:(live:boolean)=>void){
  entries.set(id,{id,ratio,setLive})
  recompute()
}

export function releaseStageVisibility(id:string){
  entries.delete(id)
  recompute()
}
