import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { CreditCard, RefreshCw, Search, Download, Heart, Headphones, ArrowRight, CheckCircle } from 'lucide-react'
import { homeService } from '@/services'
import { Badge } from '@/components/common/Badge'
import { Spinner } from '@/components/common/Spinner'
import { ROUTES } from '@/constants'

const ICON_MAP: Record<string, React.ElementType> = {
  'id-card': CreditCard,
  'refresh-cw': RefreshCw,
  search: Search,
  download: Download,
  heart: Heart,
  headphones: Headphones,
}

const SERVICE_PATHS: Record<string, string> = {
  'driver-id': ROUTES.APPLY,
  'membership-renewal': ROUTES.RENEWAL,
  'app-tracking': ROUTES.TRACK,
  'download-id': ROUTES.DOWNLOADS,
  welfare: ROUTES.CONTACT,
  support: ROUTES.CONTACT,
}

export function ServicesPage() {
  const { t } = useTranslation('pages')
  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: homeService.getServices,
    staleTime: 1000 * 60 * 10,
  })

  return (
    <div>
      <div className="bg-[#0F4C81] py-16 md:py-20">
        <div className="container-wide text-center">
          <Badge variant="accent" className="mb-4">{t('services.badge')}</Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{t('services.title')}</h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">{t('services.subtitle')}</p>
        </div>
      </div>

      <section className="section-padding bg-white">
        <div className="container-wide">
          {isLoading ? <Spinner /> : (
            <div className="grid lg:grid-cols-2 gap-8">
              {(services ?? []).map((service, i) => {
                const Icon = ICON_MAP[service.icon] ?? CreditCard
                const path = SERVICE_PATHS[service.id] ?? ROUTES.SERVICES
                const colors = [
                  { bg: 'bg-blue-50', text: 'text-[#0F4C81]', badge: 'primary' as const },
                  { bg: 'bg-green-50', text: 'text-[#16A34A]', badge: 'secondary' as const },
                  { bg: 'bg-amber-50', text: 'text-amber-600', badge: 'accent' as const },
                  { bg: 'bg-purple-50', text: 'text-purple-600', badge: 'neutral' as const },
                  { bg: 'bg-rose-50', text: 'text-rose-600', badge: 'danger' as const },
                  { bg: 'bg-cyan-50', text: 'text-cyan-600', badge: 'neutral' as const },
                ]
                const color = colors[i % colors.length]

                return (
                  <div key={service.id} className="bg-white border border-neutral-100 rounded-2xl p-7 hover:shadow-md transition-all">
                    <div className="flex items-start gap-5">
                      <div className={`w-14 h-14 ${color.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                        <Icon size={26} className={color.text} />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-lg font-bold text-neutral-900 mb-2">{service.title}</h2>
                        <p className="text-sm text-neutral-600 mb-4 leading-relaxed">{service.description}</p>

                        <div className="mb-4">
                          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                            {t('services.eligibility')}
                          </div>
                          <p className="text-sm text-neutral-700 bg-neutral-50 px-3 py-2 rounded-lg">{service.eligibility}</p>
                        </div>

                        <div className="mb-5">
                          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                            {t('services.process')}
                          </div>
                          <ul className="space-y-1.5">
                            {service.process.map((step, si) => (
                              <li key={si} className="flex items-start gap-2 text-sm text-neutral-600">
                                <CheckCircle size={14} className={`mt-0.5 shrink-0 ${color.text}`} />
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Link
                          to={path}
                          className={`inline-flex items-center gap-2 text-sm font-semibold ${color.text} hover:opacity-80 transition-opacity`}
                        >
                          {t('services.getStarted')} <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
