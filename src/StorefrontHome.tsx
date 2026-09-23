import Nav from './components/Nav'
import {
  HomeCategories,
  HomeClients,
  HomeFinalCta,
  HomeFooter,
  HomeHero,
  HomeManufacturing,
  HomeMockup,
  HomePaths,
  HomeTestimonials,
} from './components/HomeRedesign'

export default function StorefrontHome(){
  return (
    <>
      <Nav/>
      <main className="hr-home" id="main-content">
        <HomeHero/>
        <HomePaths/>
        <HomeCategories/>
        <HomeManufacturing/>
        <HomeMockup/>
        <HomeClients/>
        <HomeTestimonials/>
        <HomeFinalCta/>
      </main>
      <HomeFooter/>
    </>
  )
}
