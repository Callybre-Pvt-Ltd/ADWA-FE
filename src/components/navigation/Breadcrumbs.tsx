import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, Home } from 'lucide-react'
import { getBreadcrumbTrail } from '@/routes/routes.data'

export function Breadcrumbs() {
  const location = useLocation()
  const { t } = useTranslation('nav')
  const trail = getBreadcrumbTrail(location.pathname)

  if (trail.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-sm text-neutral-500">
      <Link to="/" className="hover:text-neutral-900:text-neutral-100" aria-label="Home">
        <Home className="h-4 w-4" />
      </Link>
      {trail.map((route, i) => (
        <span key={route.key} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          {i === trail.length - 1 ? (
            <span className="text-neutral-900 font-medium">
              {t(route.label.replace('nav.', ''))}
            </span>
          ) : (
            <Link to={route.path.split(':')[0]} className="hover:text-neutral-900:text-neutral-100">
              {t(route.label.replace('nav.', ''))}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
