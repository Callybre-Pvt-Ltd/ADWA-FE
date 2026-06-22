import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PanelLeft, PanelLeftClose } from 'lucide-react'
import type { RouteConfig } from '@/routes/routes.data'
import { getIcon } from '@/routes/iconMap'
import { cn } from '@/utils/cn'

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
        'hidden md:flex flex-col border-r border-neutral-200 bg-white transition-all',
        collapsed ? 'w-14' : 'w-52',
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-neutral-100 px-3">
        {!collapsed && (
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400">
            {portalLabel}
          </span>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label="Toggle sidebar"
          className="flex h-8 w-8 items-center justify-center rounded text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50"
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-0.5" aria-label="Sidebar navigation">
        {sidebarRoutes.map((route) => {
          const Icon = getIcon(route.icon)
          const active = location.pathname === route.path
          return (
            <Link
              key={route.key}
              to={route.path}
              title={collapsed ? t(route.label.replace('nav.', '')) : undefined}
              className={cn(
                'flex items-center gap-2.5 rounded px-2.5 py-2 text-sm transition-colors min-h-[40px]',
                active
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
                collapsed && 'justify-center px-2',
              )}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />
              {!collapsed && (
                <span className="truncate">{t(route.label.replace('nav.', ''))}</span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-neutral-100 p-2">
        <Link
          to="/"
          className={cn(
            'flex items-center justify-center rounded px-2 py-2 text-xs text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50',
            !collapsed && 'justify-start px-2.5',
          )}
        >
          {!collapsed && '← Public site'}
          {collapsed && '←'}
        </Link>
      </div>
    </aside>
  )
}
