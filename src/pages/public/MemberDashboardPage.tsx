import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { PageHero } from '@/components/shared/PageHero'
import { getSecondaryPublicRoutes } from '@/routes/routes.data'
import { getIcon } from '@/routes/iconMap'

export default function MemberDashboardPage() {
  const { t } = useTranslation(['nav', 'pages'])
  const links = getSecondaryPublicRoutes().filter((r) => r.key !== 'dashboard')

  return (
    <div className="bg-white">
      <PageHero title={t('memberDashboard')} subtitle={t('pages:memberDashboard.subtitle')} />
      <section className="section-padding hero-gradient">
        <div className="container-wide">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((route) => {
              const Icon = getIcon(route.icon)
              const path = route.key === 'verify' ? '/verify/ADWA-CARD-001' : route.path
              return (
                <Link
                  key={route.key}
                  to={path}
                  className="surface-card flex items-center gap-4 p-5 group"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-royal-100 text-royal-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-neutral-900">{t(route.label.replace('nav.', ''))}</p>
                    <p className="text-xs text-neutral-500 truncate">{route.meta?.title}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-orange-500 shrink-0" />
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
