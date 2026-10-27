import { useState } from 'react'
import Hero from '../components/Hero/Hero.jsx'
import QuickLinks from '../components/QuickLinks/QuickLinks.jsx'
import CategoryGrid from '../components/CategoryGrid/CategoryGrid.jsx'
import AdBanner from '../components/AdBanner/AdBanner.jsx'
import PromoCarousel from '../components/PromoCarousel/PromoCarousel.jsx'
import SportComplexes from '../components/SportComplexes/SportComplexes.jsx'
import Reels from '../components/Reels/Reels.jsx'
import Campaigns from '../components/Campaigns/Campaigns.jsx'
import SportNews from '../components/SportNews/SportNews.jsx'
import Partners from '../components/Partners/Partners.jsx'
import { useSeo } from '../hooks/useSeo.js'
import { sportEvents } from '../data/campaigns.js'

export default function HomePage() {
  useSeo()
  const [activeTab, setActiveTab] = useState('jobs')

  return (
    <>
      <QuickLinks />
      <Hero activeTab={activeTab} onTabChange={setActiveTab} />
      <CategoryGrid activeTab={activeTab} />
      <PromoCarousel />
      <SportComplexes />
      <SportNews id="yangiliklar" />
      <Reels />
      <Campaigns id="tadbirlar" items={sportEvents} />
      <AdBanner slot="home" />
      <Partners />
    </>
  )
}
