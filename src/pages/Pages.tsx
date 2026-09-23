import {ArrowRight} from 'lucide-react'
import type {ReactNode} from 'react'
import Customizer from '../components/Customizer'
import {HomeFooter} from '../components/HomeRedesign'
import Nav from '../components/Nav'
import {Link} from '../routing'

export function PageFrame({children}:{children:ReactNode}){
  return <><Nav/>{children}<HomeFooter/></>
}

export function CustomizePage(){
  return <PageFrame><main className="inner-page customizer-page">
    <header className="page-hero compact sk-container" style={{paddingTop:120,paddingBottom:24}}>
      <span className="sk-eyebrow">DESIGN LAB</span>
      <h1 className="sk-display" style={{fontSize:'clamp(2.8rem,6vw,4.8rem)',marginTop:14}}>YOUR COLORS.<br/><em>YOUR MARK.</em></h1>
      <p style={{maxWidth:520,color:'#a8a8a4',lineHeight:1.7}}>Build a concept on a clean light canvas, save a unique design ID, and prepare a production quote request.</p>
    </header>
    <Customizer/>
  </main></PageFrame>
}

export function NotFound(){
  return <PageFrame><main className="not-found"><span>404</span><h1>OUTSIDE<br/><em>THE RING.</em></h1><p>That page doesn’t exist.</p><Link className="btn primary" to="/">RETURN HOME <ArrowRight/></Link></main></PageFrame>
}
