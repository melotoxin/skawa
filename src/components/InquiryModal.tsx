import {useEffect,useRef,useState,type FormEvent} from 'react'
import {X} from 'lucide-react'

export default function InquiryModal({open,onClose}:{open:boolean;onClose:()=>void}){
  const [reference,setReference]=useState('')
  const cardRef=useRef<HTMLDivElement>(null)
  const closeRef=useRef(onClose)
  useEffect(()=>{closeRef.current=onClose},[onClose])
  useEffect(()=>{
    if(!open)return
    const previous=document.activeElement instanceof HTMLElement?document.activeElement:null
    const overflow=document.body.style.overflow
    document.body.style.overflow='hidden'
    cardRef.current?.querySelector<HTMLElement>('input')?.focus()
    const onKeyDown=(event:KeyboardEvent)=>{if(event.key==='Escape')closeRef.current()}
    addEventListener('keydown',onKeyDown)
    return()=>{
      document.body.style.overflow=overflow
      removeEventListener('keydown',onKeyDown)
      setReference('')
      previous?.focus()
    }
  },[open])
  if(!open)return null
  const submit=(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault()
    const form=new FormData(event.currentTarget)
    const id=`SK-${Math.random().toString(36).slice(2,8).toUpperCase()}`
    localStorage.setItem('skawa-last-request',JSON.stringify({
      id,
      intent:'wholesale_apply',
      route:'Academy collection',
      business:String(form.get('academy')||''),
      name:String(form.get('name')||''),
      email:String(form.get('email')||''),
      createdAt:new Date().toISOString(),
    }))
    setReference(id)
  }
  return (
    <div className="sk-modal" role="presentation">
      <button type="button" className="sk-modal__backdrop" aria-label="Close application" onClick={onClose}/>
      <div ref={cardRef} className="sk-modal__card" role="dialog" aria-modal="true" aria-labelledby="sk-modal-title">
        <button type="button" className="sk-modal__close" aria-label="Close" onClick={onClose}><X/></button>
        {reference?(
          <>
            <p className="sk-eyebrow">ACADEMY APPLICATION</p>
            <h2 id="sk-modal-title">Request {reference} is saved.</h2>
            <p>We have the academy name and contact on this browser. The SKAWA team reviews wholesale applications before pricing is confirmed.</p>
            <button type="button" className="sk-btn sk-btn--red" onClick={onClose}>Close</button>
          </>
        ):(
          <form onSubmit={submit}>
            <p className="sk-eyebrow">ACADEMY APPLICATION</p>
            <h2 id="sk-modal-title">Get a free mockup.</h2>
            <p>Tell us the academy. We’ll open a wholesale brief for a kit mockup.</p>
            <label>Academy name<input name="academy" required autoComplete="organization" placeholder="Academy or gym"/></label>
            <label>Your name<input name="name" required autoComplete="name" placeholder="Coach or buyer"/></label>
            <label>Email<input name="email" type="email" required autoComplete="email" placeholder="you@academy.com"/></label>
            <button className="sk-btn sk-btn--red" type="submit">Submit application</button>
          </form>
        )}
      </div>
    </div>
  )
}
