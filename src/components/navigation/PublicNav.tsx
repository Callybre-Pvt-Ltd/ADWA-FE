import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Globe, ArrowRight } from 'lucide-react'
import { getPrimaryNavRoutes } from '@/routes/routes.data'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'
import { AdwaSeal } from '@/components/shared/AdwaSeal'
import { TopUtilityBar } from '@/components/navigation/TopUtilityBar'

export function PublicNav() {
  const [open, setOpen] = useState(false)
  const { t, i18n } = useTranslation('nav')
  const location = useLocation()
  const navRoutes = getPrimaryNavRoutes()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en')
  }

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  return (
    <header className="sticky top-0 z-40">
      <TopUtilityBar />

      <div className="bg-blue-900 shadow-lg shadow-blue-900/30">
        <div className="container-wide flex h-16 md:h-[72px] items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3 shrink-0 min-w-0">
            <AdwaSeal size="md" />
            <div className="min-w-0 leading-tight hidden sm:block">
              <p className="text-sm font-bold text-white truncate">All Drivers Welfare Association</p>
              <p className="text-xs text-white/75">Registered Under Govt. of India</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {navRoutes.map((route) => {
              const active = isActive(route.path)
              return (
                <Link
                  key={route.key}
                  to={route.path}
                  className={cn(
                    'px-4 py-2 text-base font-semibold text-white transition-colors border-b-[3px]',
                    active ? 'border-blue-400 text-white' : 'border-transparent hover:text-blue-100',
                  )}
                >
                  {t(route.label.replace('nav.', ''))}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLang}
              aria-label="Toggle language"
              className="rounded-full text-white hover:bg-white/10 h-10 w-10"
            >
              <Globe className="h-5 w-5" />
            </Button>
            <Link to="/apply" className="hidden sm:inline-flex">
              <Button
                variant="accent"
                className="rounded-full font-bold px-5 min-h-[44px]"
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
