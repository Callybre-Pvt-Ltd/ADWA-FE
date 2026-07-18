import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { districtRoutes } from '@/routes/routes.data'
import { Sidebar } from '@/components/navigation/Sidebar'
import { BottomNav } from '@/components/navigation/BottomNav'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { useAuth } from '@/context/AuthContext'
function LangToggle() {
  const { t, i18n: i18nInst } = useTranslation('dashboard')
  const lang = i18nInst.language

  const toggle = () => {
    const next = lang === 'en' ? 'hi' : 'en'
    void i18nInst.changeLanguage(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex h-10 min-w-[72px] items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-600 shadow-sm transition hover:border-blue-300 hover:text-blue-700 active:scale-95"
      aria-label={t('dashboard.language')}
    >
      <span className="text-base leading-none">{lang === 'en' ? '🇮🇳' : '🇬🇧'}</span>
      <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
    </button>
  )
}

export function DistrictLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { t } = useTranslation('dashboard')
  const { t: tNav } = useTranslation('nav')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <RequireAuth role="district" loginPath="/district/login">
      <div className="flex min-h-screen bg-neutral-50 text-neutral-900">
        {/* Desktop sidebar */}
        <Sidebar
          routes={districtRoutes}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          portalLabel={tNav('portalDistrict')}
        />

        <div className="flex flex-1 flex-col min-w-0 pb-16 md:pb-0">
          {/* Topbar */}
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3 md:px-6 md:py-2.5 shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-[11px] font-black text-white md:hidden">
                D
              </div>
              <span className="truncate text-sm font-semibold text-neutral-700 md:text-xs md:text-neutral-400 md:font-normal">
                {user?.name ?? t('dashboard.districtSubtitle')}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <LangToggle />
              <button
                type="button"
                onClick={() => { logout(); navigate('/district/login') }}
                className="hidden rounded px-2.5 py-1 text-xs text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 md:block"
              >
                {t('dashboard.signOut')}
              </button>
              <button
                type="button"
                onClick={() => { logout(); navigate('/district/login') }}
                aria-label={t('dashboard.signOut')}
                className="flex h-11 w-11 items-center justify-center rounded text-neutral-400 hover:text-red-500 md:hidden"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                </svg>
              </button>
            </div>
          </header>

          <main className="flex-1 px-4 py-5 md:px-8 md:py-8">
            <Outlet />
          </main>
        </div>

        <BottomNav routes={districtRoutes} />
      </div>
    </RequireAuth>
  )
}
