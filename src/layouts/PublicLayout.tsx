import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { PublicNav } from '@/components/navigation/PublicNav'
import { Footer } from '@/components/navigation/Footer'
import { WhatsAppFab } from '@/components/shared/WhatsAppFab'
import { CallFab } from '@/components/shared/CallFab'

export function PublicLayout() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <PublicNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFab />
      <CallFab />
    </div>
  )
}
