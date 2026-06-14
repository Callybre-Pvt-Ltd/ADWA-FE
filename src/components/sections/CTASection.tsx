import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, ShieldCheck, Clock, Users } from 'lucide-react'
import { ROUTES } from '@/constants'

export function CTASection() {
  const { t } = useTranslation('home')

  const trust = [
    { icon: ShieldCheck, labelKey: 'cta.trust1', color: 'text-emerald-400' },
    { icon: Clock, labelKey: 'cta.trust2', color: 'text-amber-400' },
    { icon: Users, labelKey: 'cta.trust3', color: 'text-blue-300' },
  ]

  return (
    <section className="py-20 md:py-28 bg-[#0a0f1c] relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#0F4C81]/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-900/30 rounded-full blur-3xl" />

      <div className="container-wide relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/15 rounded-full text-xs text-blue-300 font-semibold uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            {t('cta.badge')}
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5">
            {t('cta.title')}
          </h2>
          <p className="text-lg text-neutral-400 mb-10 max-w-xl mx-auto leading-relaxed">
            {t('cta.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link
              to={ROUTES.APPLY}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#0F4C81] rounded-2xl text-base font-bold hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/40 hover:-translate-y-0.5"
            >
              {t('cta.button')}
              <ArrowRight size={18} />
            </Link>
            <Link
              to={ROUTES.ABOUT}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white rounded-2xl text-base font-semibold hover:bg-white/10 hover:border-white/30 transition-all"
            >
              {t('cta.secondary')}
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            {trust.map(({ icon: Icon, labelKey, color }) => (
              <div key={labelKey} className="flex items-center gap-2">
                <Icon size={15} className={color} />
                <span className="text-xs text-neutral-400 font-medium">{t(labelKey)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
