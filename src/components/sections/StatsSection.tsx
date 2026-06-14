import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Users, UserCheck, RefreshCw, MapPin } from 'lucide-react'
import { homeService } from '@/services'

const ICONS: Record<string, React.ElementType> = {
  users: Users,
  'user-check': UserCheck,
  'refresh-cw': RefreshCw,
  'map-pin': MapPin,
}

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const animated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true
        const duration = 1600
        const start = performance.now()
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1)
          const ease = 1 - Math.pow(1 - progress, 3)
          setValue(Math.round(ease * target))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.4 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  const formatted = value >= 1000000
    ? `${(value / 100000).toFixed(0)}L`
    : value >= 1000
    ? `${(value / 1000).toFixed(0)}K`
    : `${value}`

  return (
    <div ref={ref} className="text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900">
      {formatted}<span className="text-[#0F4C81]">{suffix}</span>
    </div>
  )
}

const ACCENT_COLORS = [
  { border: 'border-[#0F4C81]', iconBg: 'bg-[#0F4C81]', labelColor: 'text-[#0F4C81]' },
  { border: 'border-[#16A34A]', iconBg: 'bg-[#16A34A]', labelColor: 'text-[#16A34A]' },
  { border: 'border-amber-500', iconBg: 'bg-amber-500', labelColor: 'text-amber-600' },
  { border: 'border-purple-600', iconBg: 'bg-purple-600', labelColor: 'text-purple-600' },
]

export function StatsSection() {
  const { t } = useTranslation('home')
  const { data: stats } = useQuery({
    queryKey: ['statistics'],
    queryFn: homeService.getStatistics,
    staleTime: 1000 * 60 * 10,
  })

  const labelMap: Record<string, string> = {
    drivers: t('stats.registeredDrivers'),
    members: t('stats.activeMembers'),
    renewals: t('stats.renewalsCompleted'),
    states: t('stats.statesCovered'),
  }

  const items = stats ?? [
    { id: 'drivers', value: 1250000, suffix: '+', icon: 'users' },
    { id: 'members', value: 890000, suffix: '+', icon: 'user-check' },
    { id: 'renewals', value: 340000, suffix: '+', icon: 'refresh-cw' },
    { id: 'states', value: 28, suffix: '', icon: 'map-pin' },
  ]

  return (
    <section className="py-16 md:py-20 bg-[#0F4C81] relative overflow-hidden">
      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 translate-y-1/2" />

      <div className="container-wide relative">
        <div className="text-center mb-12">
          <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-2">{t('stats.subtitle')}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">{t('stats.title')}</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {items.map((stat, i) => {
            const Icon = ICONS[stat.icon] ?? Users
            const ac = ACCENT_COLORS[i % ACCENT_COLORS.length]
            return (
              <div
                key={stat.id}
                className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/15 hover:bg-white/15 transition-all group"
              >
                <div className={`w-10 h-10 ${ac.iconBg} rounded-2xl flex items-center justify-center mb-5 opacity-90 group-hover:scale-110 transition-transform`}>
                  <Icon size={18} className="text-white" />
                </div>
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                <div className="text-blue-200 text-sm font-medium mt-2">
                  {labelMap[stat.id] ?? stat.id}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
