import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, PanelLeftClose, PanelLeft } from 'lucide-react'
import type { RouteConfig } from '@/routes/routes.data'
import { getIcon } from '@/routes/iconMap'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  routes: RouteConfig[]
  collapsed: boolean
  onToggle: () => void
  portalLabel: string
}

export function Sidebar({ routes, collapsed, onToggle, portalLabel }: SidebarProps) {
  const { t } = useTranslation('nav')
  const location = useLocation()
  const sidebarRoutes = routes.filter((r) => r.showInSidebar)

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r border-neutral-200 bg-white transition-all shadow-sm',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-4 bg-royal-800">
        {!collapsed && (
          <span className="font-bold text-sm text-white">{portalLabel}</span>
        )}
        <Button variant="ghost" size="icon" onClick={onToggle} aria-label="Toggle sidebar" className="rounded-full text-white hover:bg-white/15">
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>
      <nav className="flex-1 p-2 space-y-1" aria-label="Sidebar navigation">
        {sidebarRoutes.map((route) => {
          const Icon = getIcon(route.icon)
          const active = location.pathname === route.path
          return (
            <Link
              key={route.key}
              to={route.path}
              title={collapsed ? t(route.label.replace('nav.', '')) : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all min-h-[44px]',
                active
                  ? 'bg-royal-700 text-white shadow-sm'
                  : 'text-neutral-700 hover:bg-royal-50 hover:text-royal-800',
                collapsed && 'justify-center px-2',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {!collapsed && t(route.label.replace('nav.', ''))}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-neutral-200 p-2 bg-neutral-50">
        <Link
          to="/"
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-white hover:text-royal-700 transition-colors',
            collapsed && 'justify-center',
          )}
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          {!collapsed && 'Public Site'}
        </Link>
      </div>
    </aside>
  )
}
