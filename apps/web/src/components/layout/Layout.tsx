import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { WhatsAppFAB } from './WhatsAppFAB'
import { CustomCursor } from '../ui/CustomCursor'

export default function Layout() {
  return (
    <>
      <CustomCursor />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFAB />
    </>
  )
}
