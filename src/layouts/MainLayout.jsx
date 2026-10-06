import { useLocation } from 'react-router-dom'
import TopBar from '../components/TopBar/TopBar.jsx'
import Navbar from '../components/Navbar/Navbar.jsx'
import Footer from '../components/Footer/Footer.jsx'
import TabBar from '../components/TabBar/TabBar.jsx'
import NotificationToaster from '../components/NotificationToaster/NotificationToaster.jsx'

// Auth sahifalari to‘liq ekranda — header va footer’siz
const AUTH_ROUTES = ['/kirish', '/royxatdan-otish', '/parolni-tiklash']

export default function MainLayout({ children }) {
  const { pathname } = useLocation()
  if (AUTH_ROUTES.includes(pathname)) return <main>{children}</main>

  const hideFooter = pathname.startsWith('/xabarlar') || pathname.startsWith('/xarita')

  return (
    <div className={`app ${hideFooter ? 'app--chat' : ''}`}>
      <header className="app-header">
        <TopBar />
        <Navbar />
      </header>
      <main>{children}</main>
      {hideFooter ? null : <Footer />}
      <TabBar />
      <NotificationToaster />
    </div>
  )
}
