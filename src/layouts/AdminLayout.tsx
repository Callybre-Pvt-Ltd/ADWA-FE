import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { adminRoutes } from '@/routes/routes.data'
import { Sidebar } from '@/components/navigation/Sidebar'
import { BottomNav } from '@/components/navigation/BottomNav'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <RequireAuth role="admin" loginPath="/admin/login">
      <div className="flex min-h-screen bg-neutral-100">
        <Sidebar
          routes={adminRoutes}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          portalLabel="Admin Portal"
        />
        <div className="flex flex-1 flex-col min-w-0 pb-16 md:pb-0">
          <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 md:px-8 shadow-sm">
            <p className="text-sm text-neutral-600">
              Signed in as <span className="font-bold text-royal-800">{user?.name}</span>
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout()
                navigate('/admin/login')
              }}
            >
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </header>
          <main className="flex-1 px-4 py-6 md:px-8">
            <Breadcrumbs />
            <Outlet />
          </main>
        </div>
        <BottomNav routes={adminRoutes} />
      </div>
    </RequireAuth>
  )
}
