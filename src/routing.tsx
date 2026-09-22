import {useEffect,useState,type AnchorHTMLAttributes,type MouseEvent} from 'react'

export function go(to:string){
  window.history.pushState({},'',to)
  window.dispatchEvent(new PopStateEvent('popstate'))
  const hash=new URL(to,window.location.href).hash
  if(hash)requestAnimationFrame(()=>document.querySelector(hash)?.scrollIntoView({behavior:'smooth'}))
  else window.scrollTo({top:0,behavior:'instant'})
}

export function Link({to,onClick,...props}:AnchorHTMLAttributes<HTMLAnchorElement>&{to:string}){
  const handle=(event:MouseEvent<HTMLAnchorElement>)=>{
    onClick?.(event)
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return
    event.preventDefault();go(to)
  }
  return <a href={to} onClick={handle} {...props}/>
}

export function usePath(){
  const[route,setRoute]=useState(()=>window.location.pathname+window.location.search)
  useEffect(()=>{const update=()=>setRoute(window.location.pathname+window.location.search);addEventListener('popstate',update);return()=>removeEventListener('popstate',update)},[])
  return route
}
