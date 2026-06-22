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
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-neutral-200 bg-white safe-area-pb"
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
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 min-h-[52px] text-[10px] uppercase tracking-wide',
                active ? 'text-neutral-900' : 'text-neutral-400',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="truncate max-w-[56px]">{t(route.label.replace('nav.', ''))}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
