import { tr } from '../i18n/index.js'
import { useLocation } from 'react-router-dom'
import TopBar from '../components/TopBar/TopBar.jsx'
import Navbar from '../components/Navbar/Navbar.jsx'
import Footer from '../components/Footer/Footer.jsx'
import TabBar from '../components/TabBar/TabBar.jsx'
import NotificationToaster from '../components/NotificationToaster/NotificationToaster.jsx'
import { catalogSource } from '../services/catalog.js'
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary.jsx'
import ScrollManager from '../components/ScrollManager/ScrollManager.jsx'

// Auth sahifalari to‘liq ekranda — header va footer’siz
const AUTH_ROUTES = ['/kirish', '/royxatdan-otish', '/parolni-tiklash']

export default function MainLayout({ children }) {
  const { pathname } = useLocation()
  if (AUTH_ROUTES.includes(pathname)) {
    return (
      <main>
        <ScrollManager />
        <ErrorBoundary resetKey={pathname}>{children}</ErrorBoundary>
      </main>
    )
  }

  const isMap = pathname.startsWith('/xarita')
  const hideFooter = isMap

  return (
    <div
      className={`app ${hideFooter ? 'app--fullscreen' : ''} ${pathname === '/' ? 'app--home' : ''} ${isMap ? 'app--map' : ''}`}
    >
      <ScrollManager />
      <header className="app-header">
        <TopBar />
        <Navbar />
      </header>
      {catalogSource === 'offline' && (
        <div className="app-offline" role="alert">
          {tr('Server bilan aloqa yo‘q — ma’lumotlar ko‘rsatilmayapti.')}
          <button type="button" onClick={() => window.location.reload()}>
            {tr('Qayta urinish')}
          </button>
        </div>
      )}
      <main>
        <ErrorBoundary resetKey={pathname}>{children}</ErrorBoundary>
      </main>
      {hideFooter ? null : <Footer />}
      <TabBar />
      <NotificationToaster />
    </div>
  )
}
