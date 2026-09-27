import {ArrowRight,ArrowUpRight} from 'lucide-react'
import {useState,type FormEvent} from 'react'
import {Link} from '../routing'
import {footerColumns,socialProfiles} from './home/content'
import './site-footer.css'

const NEWSLETTER_KEY='skawa-newsletter'

export default function SiteFooter(){
  const [joined,setJoined]=useState('')
  const [error,setError]=useState('')
  const profiles=socialProfiles.filter((profile):profile is {label:string;url:string}=>Boolean(profile.url))

  const subscribe=(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault()
    const form=event.currentTarget
    const email=String(new FormData(form).get('email')||'').trim()
    if(!/^\S+@\S+\.\S+$/.test(email)){setError('Enter a valid email address.');return}
    try{
      const list=JSON.parse(localStorage.getItem(NEWSLETTER_KEY)||'[]') as string[]
      localStorage.setItem(NEWSLETTER_KEY,JSON.stringify([...new Set([...list,email])]))
    }catch{/* storage unavailable: keep the confirmation in the UI */}
    setError('')
    setJoined(email)
    form.reset()
  }

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <Link to="/" aria-label="SKAWA Fight home" className="site-footer__logo">
              <img src="/images/brand/skawa-logo-dark.png" alt="SKAWA Fight" width={160} height={41} loading="lazy"/>
            </Link>
            <p className="site-footer__tagline">Custom gear for a <span>stronger tomorrow.</span></p>
          </div>
          <form className="site-footer__news" onSubmit={subscribe} noValidate>
            <label htmlFor="site-footer-email">Notes on new kits and academy runs</label>
            <div>
              <input id="site-footer-email" name="email" type="email" autoComplete="email" placeholder="Email address" aria-invalid={Boolean(error)} aria-describedby="site-footer-news-status"/>
              <button type="submit" aria-label="Subscribe"><ArrowRight aria-hidden="true"/></button>
            </div>
            <p id="site-footer-news-status" role="status">{error||(joined?`Thanks — ${joined} is on the list.`:'No spam. Unsubscribe anytime.')}</p>
          </form>
        </div>

        <nav className="site-footer__cols" aria-label="Footer">
          {footerColumns.map(column=><div key={column.title}>
            <h2>{column.title}</h2>
            <ul>{column.links.map(link=><li key={link.label}><Link to={link.to}>{link.label}</Link></li>)}</ul>
          </div>)}
          {profiles.length>0&&<div>
            <h2>Social</h2>
            <ul>{profiles.map(profile=><li key={profile.label}><a href={profile.url} target="_blank" rel="noreferrer">{profile.label}<ArrowUpRight aria-hidden="true"/></a></li>)}</ul>
          </div>}
          <div className="site-footer__start">
            <h2>Start a project</h2>
            <p>One brief covers the mockup, the sample and the quote.</p>
            <Link className="site-footer__cta" to="/request-mockup?intent=footer_project">Get started<ArrowRight aria-hidden="true"/></Link>
          </div>
        </nav>

        <div className="site-footer__bar">
          <small>© {new Date().getFullYear()} SKAWA Fight. All rights reserved.</small>
          <ul>
            <li><Link to="/privacy">Privacy</Link></li>
            <li><Link to="/terms">Terms</Link></li>
            <li><Link to="/cookies">Cookies</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
