import './globals.css'
import Header from '../components/Header'
import BreakingTicker from '../components/BreakingTicker'
import Footer from '../components/Footer'
import MobileBottomNav from '../components/MobileBottomNav'

export const metadata = {
  title: {
    default: 'Literasisultra - Platform Berita Digital Profesional',
    template: '%s | Literasisultra'
  },
  description: 'Platform berita digital modern untuk informasi, berita, dan artikel edukatif Sulawesi Tenggara.',
  openGraph: {
    siteName: 'Literasisultra',
    type: 'website',
    locale: 'id_ID'
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23DC2626'/><text x='50' y='72' font-size='64' font-weight='900' text-anchor='middle' fill='white' font-family='Arial'>L</text></svg>"
  },
  verification: {
    google: 'WTaDr-mEpUoL0Aj9CKHx9LsG6mmTPcTQrbcie2fec7c'
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <BreakingTicker />
        <Header />
        <main>{children}</main>
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  )
}
