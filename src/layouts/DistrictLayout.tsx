import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { districtRoutes } from '@/routes/routes.data'
import { Sidebar } from '@/components/navigation/Sidebar'
import { BottomNav } from '@/components/navigation/BottomNav'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { useAuth } from '@/context/AuthContext'

export function DistrictLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <RequireAuth role="district" loginPath="/district/login">
      <div className="flex min-h-screen bg-neutral-50 text-neutral-900">
        <Sidebar
          routes={districtRoutes}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          portalLabel="District"
        />
        <div className="flex flex-1 flex-col min-w-0 pb-14 md:pb-0">
          <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-5 py-3 md:px-8">
            <p className="text-sm text-neutral-500 truncate">
              {user?.name}
            </p>
            <button
              type="button"
              onClick={() => {
                logout()
                navigate('/district/login')
              }}
              className="text-xs uppercase tracking-wider text-neutral-400 hover:text-neutral-900 transition-colors"
            >
              Sign out
            </button>
          </header>
          <main className="flex-1 px-5 py-8 md:px-10 md:py-10">
            <Outlet />
          </main>
        </div>
        <BottomNav routes={districtRoutes} />
      </div>
    </RequireAuth>
  )
}
