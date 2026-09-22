import {ArrowRight} from 'lucide-react'
import type {ReactNode} from 'react'
import Customizer from '../components/Customizer'
import Nav from '../components/Nav'
import {Link} from '../routing'

export function PageFrame({children}:{children:ReactNode}){
  return <><Nav/>{children}<MiniFooter/></>
}

function MiniFooter(){
  return <footer className="mini-footer">
    <div className="logo logo--image">
      <img className="logo__mark logo__mark--light" src="/images/brand/skawa-logo-light.png" alt="SKAWA" width={160} height={41} decoding="async" loading="lazy"/>
    </div>
    <p>Custom fightwear · Academy programs · Private-label manufacturing</p>
    <Link to="/request-mockup">REQUEST A FREE MOCKUP <ArrowRight/></Link>
    <small>© 2026 SKAWA FIGHT · FRONTEND DEMO</small>
  </footer>
}

export function CustomizePage(){
  return <PageFrame><main className="inner-page customizer-page">
    <header className="page-hero compact"><div className="eyebrow">DESIGN LAB / 02</div><h1>YOUR COLORS.<br/><em>YOUR MARK.</em></h1><p>Build a concept, save a unique design ID, and prepare a production quote request.</p></header>
    <Customizer/>
  </main></PageFrame>
}

export function NotFound(){
  return <PageFrame><main className="not-found"><span>404</span><h1>OUTSIDE<br/><em>THE RING.</em></h1><p>That page doesn’t exist.</p><Link className="btn primary" to="/">RETURN HOME <ArrowRight/></Link></main></PageFrame>
}
