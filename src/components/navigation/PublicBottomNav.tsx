import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, FileText, Search, QrCode, Headphones } from 'lucide-react'
import { cn } from '@/utils/cn'

const ITEMS = [
  { path: '/', label: 'Home', hindi: 'होम', icon: Home },
  { path: '/apply', label: 'Apply', hindi: 'आवेदन', icon: FileText },
  { path: '/status', label: 'Track', hindi: 'ट्रैक', icon: Search },
  { path: '/verify/ADWA-CARD-001', label: 'Verify', hindi: 'जांच', icon: QrCode },
  { path: '/support', label: 'Help', hindi: 'सहायता', icon: Headphones },
] as const

export function PublicBottomNav() {
  const location = useLocation()
  const { i18n } = useTranslation()
  const isHi = i18n.language === 'hi'

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t-2 border-neutral-200 bg-white safe-area-pb shadow-[0_-4px_12px_rgba(0,0,0,0.08)]"
      aria-label="Bottom navigation"
    >
      <div className="flex items-stretch justify-around">
        {ITEMS.map(({ path, label, hindi, icon: Icon }) => {
          const active = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path.split(':')[0])
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 min-h-[56px] min-w-0 px-1 transition-colors',
                active ? 'text-orange-600 bg-orange-50 font-extrabold' : 'text-neutral-600 hover:text-orange-500',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="text-xs font-bold truncate w-full text-center">
                {isHi ? hindi : label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
