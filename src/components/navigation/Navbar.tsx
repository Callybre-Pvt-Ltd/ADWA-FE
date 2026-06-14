import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, X, Globe, ChevronDown } from 'lucide-react'
import { ROUTES } from '@/constants'
import { cn } from '@/lib/utils'
import i18n from '@/i18n'

const navItems = [
  { key: 'home', path: ROUTES.HOME },
  { key: 'apply', path: ROUTES.APPLY },
  { key: 'track', path: ROUTES.TRACK },
  { key: 'renewal', path: ROUTES.RENEWAL },
  { key: 'contact', path: ROUTES.CONTACT },
]

export function Navbar() {
  const { t } = useTranslation('common')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const currentLang = i18n.language === 'hi' ? 'हिं' : 'EN'

  const switchLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
    setLangOpen(false)
  }

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-white shadow-sm border-b border-neutral-100'
            : 'bg-white/95 backdrop-blur-md',
        )}
      >
        <div className="container-wide">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={ROUTES.HOME} className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-lg bg-[#0F4C81] flex items-center justify-center">
                <span className="text-white font-bold text-sm">AD</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-[#0F4C81] leading-tight">{t('footer.brandName')}</div>
                <div className="text-xs text-neutral-500 leading-tight">{t('footer.brandSub')}</div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.key}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    cn(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'text-[#0F4C81] bg-blue-50'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50',
                    )
                  }
                >
                  {t(`nav.${item.key}`)}
                </NavLink>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
                  aria-label={t('nav.language')}
                >
                  <Globe size={15} />
                  <span className="hidden sm:inline">{currentLang}</span>
                  <ChevronDown size={13} className={cn('transition-transform', langOpen && 'rotate-180')} />
                </button>
                {langOpen && (
                  <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-lg border border-neutral-100 py-1 z-50">
                    <button
                      onClick={() => switchLanguage('en')}
                      className={cn(
                        'w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 transition-colors',
                        i18n.language === 'en' ? 'text-[#0F4C81] font-semibold' : 'text-neutral-700',
                      )}
                    >
                      {t('lang.english')}
                    </button>
                    <button
                      onClick={() => switchLanguage('hi')}
                      className={cn(
                        'w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 transition-colors',
                        i18n.language === 'hi' ? 'text-[#0F4C81] font-semibold' : 'text-neutral-700',
                      )}
                    >
                      {t('lang.hindi')}
                    </button>
                  </div>
                )}
              </div>

              {/* Apply CTA */}
              <Link
                to={ROUTES.APPLY}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-[#0F4C81] text-white rounded-lg text-sm font-semibold hover:bg-[#0d3d6b] transition-colors"
              >
                {t('nav.applyNow')}
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-50 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 bottom-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 lg:hidden flex flex-col',
          mobileOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0F4C81] flex items-center justify-center">
              <span className="text-white font-bold text-xs">AD</span>
            </div>
            <span className="font-semibold text-[#0F4C81] text-sm">ADWA</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg text-neutral-400 hover:bg-neutral-50"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-4 py-3 rounded-xl text-sm font-medium mb-1 transition-colors',
                  isActive
                    ? 'text-[#0F4C81] bg-blue-50'
                    : 'text-neutral-700 hover:bg-neutral-50',
                )
              }
            >
              {t(`nav.${item.key}`)}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-100 space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => switchLanguage('en')}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-medium border transition-colors',
                i18n.language === 'en'
                  ? 'border-[#0F4C81] text-[#0F4C81] bg-blue-50'
                  : 'border-neutral-200 text-neutral-600',
              )}
            >
              {t('lang.english')}
            </button>
            <button
              onClick={() => switchLanguage('hi')}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-medium border transition-colors',
                i18n.language === 'hi'
                  ? 'border-[#0F4C81] text-[#0F4C81] bg-blue-50'
                  : 'border-neutral-200 text-neutral-600',
              )}
            >
              {t('lang.hindi')}
            </button>
          </div>
          <Link
            to={ROUTES.APPLY}
            className="flex items-center justify-center w-full py-3 bg-[#0F4C81] text-white rounded-xl text-sm font-semibold"
          >
            {t('nav.applyNow')}
          </Link>
        </div>
      </div>
    </>
  )
}
