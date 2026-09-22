import StorefrontHome from './StorefrontHome'
import {CustomizePage,NotFound} from './pages/Pages'
import {AcademyPage,LeadRequestPage,PrivateLabelPage,ProcessPage,SampleKitPage} from './pages/MarketingPages'
import ProductDetailPage from './pages/ProductDetailPage'
import TrackOrderPage from './pages/TrackOrderPage'
import {AboutPage,AccountPage} from './pages/UtilityPages'
import CommerceCatalogPage from './pages/CommerceCatalogPage'
import SelectedFightwearPage from './pages/SelectedFightwearPage'
import PageTransition from './components/PageTransition'
import {usePath} from './routing'

export default function App(){
 const route=usePath()
 const path=route.split('?')[0]
 let page
 if(path==='/')page=<StorefrontHome/>
 else if(path==='/shop')page=<CommerceCatalogPage/>
 else if(path.startsWith('/product/'))page=<ProductDetailPage route={path}/>
 else if(path==='/customize')page=<CustomizePage/>
 else if(path==='/track')page=<TrackOrderPage/>
 else if(path==='/academy')page=<AcademyPage/>
 else if(path==='/private-label')page=<PrivateLabelPage/>
 else if(path==='/process')page=<ProcessPage/>
 else if(path==='/sample-kit')page=<SampleKitPage/>
 else if(path==='/request-mockup')page=<LeadRequestPage/>
 else if(path==='/about')page=<AboutPage/>
 else if(path==='/account')page=<AccountPage/>
 else if(path==='/selected-fightwear'||path==='/work'||path.startsWith('/selected-fightwear/'))page=<SelectedFightwearPage route={path}/>
 else page=<NotFound/>
 return <PageTransition route={route}>{page}</PageTransition>
}
