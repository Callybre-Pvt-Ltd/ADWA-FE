import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { RouteConfig } from '@/routes/routes.data'
import { getIcon } from '@/routes/iconMap'
import { cn } from '@/utils/cn'

interface BottomNavProps {
  routes: RouteConfig[]
}

export function BottomNav({ routes }: BottomNavProps) {
  const { t } = useTranslation('nav')
  const location = useLocation()
  const navRoutes = routes.filter((r) => r.showInNav).slice(0, 5)

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t-2 border-neutral-200 bg-white safe-area-pb shadow-[0_-4px_12px_rgba(0,0,0,0.08)]"
      aria-label="Bottom navigation"
    >
      <div className="flex items-stretch justify-around">
        {navRoutes.map((route) => {
          const Icon = getIcon(route.icon)
          const active = location.pathname === route.path
          return (
            <Link
              key={route.key}
              to={route.path}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 min-h-[56px] min-w-0 px-1 transition-colors',
                active ? 'text-orange-600 bg-orange-50 font-extrabold' : 'text-neutral-600 hover:text-orange-500',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="text-xs font-bold truncate w-full text-center">
                {t(route.label.replace('nav.', ''))}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
