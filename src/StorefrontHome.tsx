import Nav from './components/Nav'
import SiteFooter from './components/SiteFooter'
import Hero from './components/home/Hero'
import AudienceSection from './components/home/AudienceSection'
import ProcessSection from './components/home/ProcessSection'
import CraftsmanshipSection from './components/home/CraftsmanshipSection'
import ProductShowcase from './components/home/ProductShowcase'
import CustomizerPreview from './components/home/CustomizerPreview'
import AcademySection from './components/home/AcademySection'
import PrivateLabelSection from './components/home/PrivateLabelSection'
import OffersBand from './components/home/OffersBand'
import ProofSection from './components/home/ProofSection'
import LogoWall from './components/home/LogoWall'
import FinalCTA from './components/home/FinalCTA'
import './components/home/home.css'

export default function StorefrontHome(){
  return (
    <>
      <Nav/>
      <main className="hp" id="main-content">
        <Hero/>
        <AudienceSection/>
        <ProcessSection/>
        <CraftsmanshipSection/>
        <ProductShowcase/>
        <CustomizerPreview/>
        <AcademySection/>
        <PrivateLabelSection/>
        <OffersBand/>
        <ProofSection/>
        <LogoWall/>
        <FinalCTA/>
      </main>
      <SiteFooter/>
    </>
  )
}
