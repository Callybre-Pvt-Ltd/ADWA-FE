import { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Globe, Check, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminRoutes } from '@/routes/routes.data'
import { Sidebar } from '@/components/navigation/Sidebar'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { useAuth } from '@/context/AuthContext'
import { AdwaSeal } from '@/components/shared/AdwaSeal'
import { getIcon } from '@/routes/iconMap'
import { cn } from '@/utils/cn'

function LangToggle() {
  const { t, i18n: i18nInst } = useTranslation('dashboard')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div
      ref={ref}
      className="relative z-50 py-1"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-bold text-white transition-all duration-250 border border-white/20 active:scale-95 cursor-pointer ${
          open ? 'bg-white/20 border-white/30' : 'bg-white/10 hover:bg-white/20 hover:border-white/30'
        }`}
        aria-label={t('dashboard.language')}
      >
        <Globe className="h-3.5 w-3.5 shrink-0 text-white/90" />
        <span>{i18nInst.language === 'en' ? 'English' : 'हिन्दी'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-1 w-36 rounded-xl bg-white p-1.5 shadow-xl border border-neutral-100 focus:outline-none z-50"
          >
            <button
              onClick={() => {
                void i18nInst.changeLanguage('en')
                setOpen(false)
              }}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-bold transition-colors cursor-pointer ${
                i18nInst.language === 'en'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-sm leading-none">🇬🇧</span>
                <span>English</span>
              </span>
              {i18nInst.language === 'en' && <Check className="h-3.5 w-3.5 shrink-0 text-blue-600" />}
            </button>
            <button
              onClick={() => {
                void i18nInst.changeLanguage('hi')
                setOpen(false)
              }}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-bold transition-colors cursor-pointer ${
                i18nInst.language === 'hi'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-sm leading-none">🇮🇳</span>
                <span>हिन्दी</span>
              </span>
              {i18nInst.language === 'hi' && <Check className="h-3.5 w-3.5 shrink-0 text-blue-600" />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { i18n } = useTranslation('dashboard')
  const { t: tNav } = useTranslation('nav')
  const isHi = i18n.language === 'hi'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <RequireAuth role="admin" loginPath="/admin/login">
      <div className="flex min-h-screen bg-neutral-50 text-neutral-900">
        {/* Desktop sidebar */}
        <Sidebar
          routes={adminRoutes}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          portalLabel={tNav('portalAdmin')}
          collapsedLabel={isHi ? 'ए' : 'A'}
          onSignOut={() => { logout(); navigate('/admin/login') }}
        />

        <div className="flex flex-1 flex-col min-w-0">
          {/* Topbar — full on mobile, slim on desktop */}
          <div
            className="z-30 flex flex-col w-full shrink-0"
            style={{ position: 'sticky', top: 0 }}
          >
            <header className="flex items-center justify-between gap-3 bg-blue-900 text-white px-4 py-3 md:px-6 md:py-2.5 shadow-lg shadow-blue-900/10">
              {/* Left: brand mark */}
              <div className="flex items-center gap-2.5 min-w-0">
                <AdwaSeal size="sm" />
                <div className="min-w-0 leading-tight">
                  <p className="text-xs sm:text-sm font-extrabold text-white whitespace-nowrap truncate max-w-[140px] sm:max-w-none">
                    {tNav('title')}
                  </p>
                  <p className="text-[10px] text-white/70 whitespace-nowrap truncate">
                    {user?.name === 'Super Admin' && isHi ? 'सुपर एडमिन' : (user?.name ?? tNav('portalAdmin'))}
                  </p>
                </div>
              </div>

              {/* Right: lang toggle + mobile toggle */}
              <div className="flex shrink-0 items-center gap-2.5">
                <LangToggle />

                {/* Mobile menu toggle */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 md:hidden transition-all active:scale-95 cursor-pointer"
                  aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                >
                  {mobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
                </button>
              </div>
            </header>
            <div className="flag-stripe" aria-hidden="true" />
          </div>

          <div className="relative flex-1 flex flex-col">
            {/* Mobile Menu Drawer */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.nav
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18, ease: 'easeInOut' }}
                  className="md:hidden fixed inset-x-0 top-[53px] bottom-0 z-40 bg-blue-950 px-4 py-6 flex flex-col gap-2 overflow-y-auto shadow-2xl border-t border-blue-900"
                  aria-label="Mobile navigation"
                >
                  {adminRoutes.filter(r => r.showInSidebar).map((route) => {
                    const active = location.pathname === route.path
                    const Icon = getIcon(route.icon)
                    return (
                      <Link
                        key={route.key}
                        to={route.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3.5 rounded-xl px-5 py-4 text-sm font-black transition-all duration-200',
                          active
                            ? 'bg-blue-900 text-orange-400 border-l-4 border-orange-500 shadow-inner'
                            : 'text-blue-100/80 bg-blue-900/20 hover:bg-blue-900/40',
                        )}
                      >
                        <Icon className="h-4.5 w-4.5 shrink-0 text-orange-400/90" />
                        <span>{tNav(route.label.replace('nav.', ''))}</span>
                      </Link>
                    )
                  })}
                  
                  {/* Public site link in drawer */}
                  <div className="mt-auto pt-6 border-t border-blue-900/60 space-y-3">
                    <Link
                      to="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-900/40 border border-white/10 py-3.5 text-xs font-black text-blue-300 hover:bg-blue-900/60 transition-all"
                    >
                      <span>{tNav('backToPublic')}</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        logout()
                        navigate('/admin/login')
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600/10 border border-red-500/20 py-3.5 text-xs font-black text-red-400 hover:bg-red-600/20 transition-all cursor-pointer"
                    >
                      <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                      </svg>
                      {isHi ? 'साइन आउट' : 'Sign out'}
                    </button>
                  </div>
                </motion.nav>
              )}
            </AnimatePresence>

            <main className="flex-1 px-4 py-5 md:px-8 md:py-8">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}
