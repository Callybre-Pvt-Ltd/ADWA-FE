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
  collapsedLabel?: string
  onSignOut?: () => void
}

export function Sidebar({ routes, collapsed, onToggle, portalLabel, collapsedLabel, onSignOut }: SidebarProps) {
  const { t: tNav, i18n } = useTranslation('nav')
  const isHi = i18n.language === 'hi'
  const location = useLocation()
  const sidebarRoutes = routes.filter((r) => r.showInSidebar)

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r border-white/15 bg-blue-950 text-blue-100/70 transition-all sticky top-0 h-screen',
        collapsed ? 'w-14' : 'w-52',
      )}
    >
      <div className="flex h-[68px] items-center justify-between border-b border-white/15 px-3">
        {!collapsed ? (
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-400 truncate">
              {portalLabel}
            </span>
          </div>
        ) : (
          <div className="flex justify-center w-full">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/30 text-xs font-extrabold text-orange-400 shadow-sm shadow-orange-500/10">
              {collapsedLabel || (isHi ? 'ए' : 'A')}
            </span>
          </div>
        )}
        {!collapsed && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={tNav('toggleSidebar')}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-blue-300/70 hover:text-white hover:bg-blue-900/50"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center py-2 border-b border-white/10">
          <button
            type="button"
            onClick={onToggle}
            aria-label={tNav('toggleSidebar')}
            className="flex h-8 w-8 items-center justify-center rounded text-blue-300/70 hover:text-white hover:bg-blue-900/50"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        </div>
      )}

      <nav className="flex-1 p-2 space-y-0.5" aria-label="Sidebar navigation">
        {sidebarRoutes.map((route) => {
          const Icon = getIcon(route.icon)
          const active = location.pathname === route.path
          return (
            <Link
              key={route.key}
              to={route.path}
              title={collapsed ? tNav(route.label.replace('nav.', '')) : undefined}
              className={cn(
                'flex items-center gap-2.5 rounded px-2.5 py-2 text-sm transition-colors min-h-[40px]',
                active
                  ? 'bg-blue-900/80 text-orange-400 border-l-[3px] border-orange-500 font-semibold shadow-sm'
                  : 'text-blue-100/70 hover:bg-blue-900/40 hover:text-white',
                collapsed && 'justify-center px-2 border-l-0',
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0 opacity-90" aria-hidden="true" />
              {!collapsed && (
                <span className="truncate">{tNav(route.label.replace('nav.', ''))}</span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/15 p-2 space-y-1.5">
        <Link
          to="/"
          className={cn(
            'flex items-center justify-center rounded px-2.5 py-2 text-xs text-blue-300 hover:text-white hover:bg-blue-900/40 transition-colors',
            !collapsed && 'justify-start px-2.5',
          )}
        >
          {collapsed ? (
            <span className="h-4.5 w-4.5 flex items-center justify-center font-bold text-base leading-none">←</span>
          ) : (
            <span>{tNav('backToPublic')}</span>
          )}
        </Link>

        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className={cn(
              'flex w-full items-center justify-center rounded px-2.5 py-2 text-xs text-red-400 hover:text-red-200 hover:bg-red-950/20 transition-colors cursor-pointer',
              !collapsed && 'justify-start px-2.5 gap-2.5',
            )}
          >
            <svg className="h-4.5 w-4.5 shrink-0 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
            </svg>
            {!collapsed && <span className="font-bold">{isHi ? 'साइन आउट' : 'Sign out'}</span>}
          </button>
        )}
      </div>
    </aside>
  )
}
