import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { PublicNav } from '@/components/navigation/PublicNav'
import { PublicBottomNav } from '@/components/navigation/PublicBottomNav'
import { Footer } from '@/components/navigation/Footer'
import { WhatsAppFab } from '@/components/shared/WhatsAppFab'

export function PublicLayout() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col pb-nav-mobile overflow-x-hidden">
      <PublicNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <PublicBottomNav />
      <WhatsAppFab />
    </div>
  )
}
