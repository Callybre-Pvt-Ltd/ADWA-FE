import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { CreditCard, RefreshCw, Search, Download, Heart, Headphones, ArrowUpRight } from 'lucide-react'
import { homeService } from '@/services'
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
  welfare: ROUTES.ABOUT,
  support: ROUTES.CONTACT,
}

const CARD_STYLES = [
  { bg: 'bg-[#0F4C81]', icon: 'bg-white/20', iconText: 'text-white', title: 'text-white', desc: 'text-blue-200', link: 'text-blue-200 hover:text-white', featured: true },
  { bg: 'bg-white', icon: 'bg-green-50', iconText: 'text-[#16A34A]', title: 'text-neutral-900', desc: 'text-neutral-500', link: 'text-[#16A34A]', featured: false },
  { bg: 'bg-white', icon: 'bg-amber-50', iconText: 'text-amber-600', title: 'text-neutral-900', desc: 'text-neutral-500', link: 'text-amber-600', featured: false },
  { bg: 'bg-[#0f172a]', icon: 'bg-white/10', iconText: 'text-white', title: 'text-white', desc: 'text-neutral-400', link: 'text-neutral-300 hover:text-white', featured: true },
  { bg: 'bg-white', icon: 'bg-rose-50', iconText: 'text-rose-500', title: 'text-neutral-900', desc: 'text-neutral-500', link: 'text-rose-500', featured: false },
  { bg: 'bg-white', icon: 'bg-purple-50', iconText: 'text-purple-600', title: 'text-neutral-900', desc: 'text-neutral-500', link: 'text-purple-600', featured: false },
]

export function ServicesSection() {
  const { t } = useTranslation('home')
  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: homeService.getServices,
    staleTime: 1000 * 60 * 10,
  })

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container-wide">
        {/* Header — left-aligned, asymmetric */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <p className="text-[#0F4C81] text-sm font-semibold uppercase tracking-widest mb-2">{t('services.title')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 max-w-md leading-tight">
              {t('services.subtitle')}
            </h2>
          </div>
          <Link
            to={ROUTES.SERVICES}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F4C81] hover:underline shrink-0"
          >
            {t('services.viewAll')} <ArrowUpRight size={15} />
          </Link>
        </div>

        {/* Bento-style grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(services ?? []).map((service, i) => {
            const Icon = ICON_MAP[service.icon] ?? CreditCard
            const path = SERVICE_PATHS[service.id] ?? ROUTES.SERVICES
            const style = CARD_STYLES[i % CARD_STYLES.length]
            const border = style.bg === 'bg-white' ? 'border border-neutral-100' : ''

            return (
              <Link
                key={service.id}
                to={path}
                className={`group relative rounded-3xl p-6 ${style.bg} ${border} flex flex-col gap-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-200 overflow-hidden`}
              >
                {/* Top row: icon + arrow */}
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 ${style.icon} rounded-2xl flex items-center justify-center`}>
                    <Icon size={22} className={style.iconText} />
                  </div>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${style.icon}`}>
                    <ArrowUpRight size={15} className={style.iconText} />
                  </div>
                </div>

                {/* Text */}
                <div>
                  <h3 className={`font-bold text-base mb-1.5 ${style.title}`}>{service.title}</h3>
                  <p className={`text-[15px] leading-relaxed ${style.desc}`}>{service.description}</p>
                </div>

                {/* Bottom link */}
                <div className={`text-sm font-semibold mt-auto ${style.link} flex items-center gap-1`}>
                  {t('services.getStarted')} <ArrowUpRight size={12} />
                </div>

                {/* Decorative corner blob for featured */}
                {style.featured && (
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/5 rounded-full" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
