import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Globe, ArrowRight, Check, Building2, Lock } from 'lucide-react'
import { getPrimaryNavRoutes } from '@/routes/routes.data'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'
import { AdwaSeal } from '@/components/shared/AdwaSeal'

export function PublicNav() {
  const [open, setOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [portalOpen, setPortalOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)
  const { t, i18n } = useTranslation('nav')
  const location = useLocation()
  const navRoutes = getPrimaryNavRoutes()
  const isHi = i18n.language === 'hi'

  const [prevPath, setPrevPath] = useState(location.pathname)
  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname)
    setOpen(false)
  }

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
      if (portalRef.current && !portalRef.current.contains(event.target as Node)) {
        setPortalOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-blue-900 shadow-lg shadow-blue-900/30">
        <div className="container-wide flex h-16 md:h-[72px] items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <AdwaSeal size="md" />
            <div className="min-w-0 leading-tight block">
              <p className="text-xs sm:text-sm font-bold text-white whitespace-normal">{t('title')}</p>
              <p className="text-[10px] sm:text-xs text-white/75 whitespace-normal">{t('subtitle')}</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
            {navRoutes.map((route) => {
              const active = isActive(route.path)
              return (
                <Link
                  key={route.key}
                  to={route.path}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium text-white transition-all duration-250 border-b-[3px]',
                    active
                      ? 'border-orange-500 text-orange-100 font-semibold'
                      : 'border-transparent hover:text-orange-300 hover:border-orange-400/40',
                  )}
                >
                  {t(route.label.replace('nav.', ''))}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-1.5 shrink-0">
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <Button
                variant="ghost"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="Select language"
                className={cn(
                  'rounded-full text-white hover:bg-white/10 px-2.5 py-2 transition-colors h-10 flex items-center gap-1 text-xs sm:text-sm font-medium',
                  dropdownOpen && 'bg-white/10'
                )}
              >
                <Globe className="h-4 w-4 sm:h-4.5 sm:w-4.5 shrink-0" />
                <span>{t('language')}</span>
              </Button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 mt-2 w-48 rounded-xl bg-white p-1.5 shadow-xl border border-neutral-100 focus:outline-none z-50"
                  >
                    <button
                      onClick={() => {
                        void i18n.changeLanguage('en')
                        setDropdownOpen(false)
                      }}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors',
                        i18n.language === 'en'
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base leading-none">🇬🇧</span>
                        <span>English</span>
                      </span>
                      {i18n.language === 'en' && <Check className="h-4 w-4 shrink-0 text-blue-600" />}
                    </button>
                    <button
                      onClick={() => {
                        void i18n.changeLanguage('hi')
                        setDropdownOpen(false)
                      }}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors',
                        i18n.language === 'hi'
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base leading-none">🇮🇳</span>
                        <span>हिन्दी (Hindi)</span>
                      </span>
                      {i18n.language === 'hi' && <Check className="h-4 w-4 shrink-0 text-blue-600" />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Login Dropdown */}
            <div
              ref={portalRef}
              className="relative hidden md:block"
              onMouseEnter={() => setPortalOpen(true)}
              onMouseLeave={() => setPortalOpen(false)}
            >
              <Button
                variant="ghost"
                className={cn(
                  'rounded-full text-white hover:bg-white/10 font-medium px-3 text-sm flex items-center gap-1 transition-colors h-10',
                  portalOpen && 'bg-white/10'
                )}
                onClick={() => setPortalOpen(!portalOpen)}
              >
                <span>{isHi ? 'लॉगिन' : 'Login'}</span>
                <svg className={cn("h-3.5 w-3.5 transition-transform duration-200", portalOpen && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Button>

              <AnimatePresence>
                {portalOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 mt-2 w-48 rounded-xl bg-white p-1.5 shadow-xl border border-neutral-100 focus:outline-none z-50"
                  >
                    <Link
                      to="/district/login"
                      onClick={() => setPortalOpen(false)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      <Building2 className="h-4 w-4 shrink-0 text-blue-600" />
                      <span>{t('districtLogin')}</span>
                    </Link>
                    <Link
                      to="/admin/login"
                      onClick={() => setPortalOpen(false)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      <Lock className="h-4 w-4 shrink-0 text-blue-600" />
                      <span>{t('adminLogin')}</span>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/apply" className="hidden sm:inline-flex">
              <Button
                variant="accent"
                className="rounded-full font-bold px-6 min-h-[44px] bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 border-0"
              >
                {t('apply')} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full text-white hover:bg-white/10 h-10 w-10"
              onClick={() => setOpen(!open)}
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flag-stripe" aria-hidden="true" />

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="lg:hidden fixed inset-x-0 top-[calc(4rem+3px)] bottom-0 z-30 bg-white px-4 py-6 flex flex-col gap-2 overflow-y-auto shadow-xl"
            aria-label="Mobile navigation"
          >
            {navRoutes.map((route) => {
              const active = isActive(route.path)
              return (
                <Link
                  key={route.key}
                  to={route.path}
                  className={cn(
                    'flex items-center rounded-xl px-5 py-4 text-lg font-bold min-h-[56px]',
                    active ? 'bg-blue-600 text-white' : 'text-neutral-800 bg-neutral-50 hover:bg-blue-50',
                  )}
                >
                  {t(route.label.replace('nav.', ''))}
                </Link>
              )
            })}

            {/* Mobile Login Portals section inside menu */}
            <div className="border-t border-neutral-100 mt-4 pt-4 flex flex-col gap-2">
              <p className="text-xs font-bold text-neutral-400 px-5 uppercase tracking-wider">{isHi ? 'पोर्टल लॉगिन' : 'Login Portals'}</p>
              <Link to="/district/login" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full rounded-xl min-h-[48px] text-base font-bold justify-start px-5 border-neutral-200 text-neutral-700 gap-3">
                  <Building2 className="h-5 w-5 shrink-0 text-neutral-500" />
                  {t('districtLogin')}
                </Button>
              </Link>
              <Link to="/admin/login" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full rounded-xl min-h-[48px] text-base font-bold justify-start px-5 border-neutral-200 text-neutral-700 gap-3">
                  <Lock className="h-5 w-5 shrink-0 text-neutral-500" />
                  {t('adminLogin')}
                </Button>
              </Link>
            </div>

            <Link to="/apply" className="mt-4">
              <Button variant="accent" className="w-full rounded-xl min-h-[56px] text-lg font-bold">
                {t('apply')} <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
