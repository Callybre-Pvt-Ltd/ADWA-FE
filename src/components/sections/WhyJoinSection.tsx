import { useTranslation } from 'react-i18next'
import { BadgeCheck, Database, Heart, RefreshCw, Phone, Award } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ROUTES } from '@/constants'

const benefits = [
  { iconKey: 'verifiedId', icon: BadgeCheck, color: '#0F4C81', bg: '#EFF6FF' },
  { iconKey: 'digitalRecords', icon: Database, color: '#7C3AED', bg: '#F5F3FF' },
  { iconKey: 'welfareSupport', icon: Heart, color: '#DC2626', bg: '#FEF2F2' },
  { iconKey: 'easyRenewal', icon: RefreshCw, color: '#16A34A', bg: '#F0FDF4' },
  { iconKey: 'emergency', icon: Phone, color: '#D97706', bg: '#FFFBEB' },
  { iconKey: 'national', icon: Award, color: '#0891B2', bg: '#ECFEFF' },
]

export function WhyJoinSection() {
  const { t } = useTranslation('home')

  return (
    <section className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — text + CTA */}
          <div>
            <p className="text-[#0F4C81] text-sm font-semibold uppercase tracking-widest mb-3">{t('whyJoin.title')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-5 leading-tight">
              {t('whyJoin.headline1')}<br />
              <span className="text-[#0F4C81]">{t('whyJoin.headline2')}</span>
            </h2>
            <p className="text-neutral-500 text-base leading-relaxed mb-8 max-w-md">
              {t('whyJoin.subtitle')}
            </p>
            <Link
              to={ROUTES.APPLY}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#0F4C81] text-white rounded-2xl font-semibold hover:bg-[#0a3563] transition-all shadow-lg shadow-blue-900/20 hover:-translate-y-0.5"
            >
              {t('whyJoin.cta')} <ArrowRight size={16} />
            </Link>

            {/* Quick stats */}
            <div className="mt-10 grid grid-cols-3 gap-4 pt-8 border-t border-neutral-100">
              {[
                { nKey: 'whyJoin.stat1Value', labelKey: 'whyJoin.stat1Label' },
                { nKey: 'whyJoin.stat2Value', labelKey: 'whyJoin.stat2Label' },
                { nKey: 'whyJoin.stat3Value', labelKey: 'whyJoin.stat3Label' },
              ].map(({ nKey, labelKey }) => (
                <div key={labelKey}>
                  <div className="text-2xl font-extrabold text-neutral-900">{t(nKey)}</div>
                  <div className="text-sm text-neutral-400 font-medium mt-0.5">{t(labelKey)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — benefit list with strong visual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {benefits.map(({ iconKey, icon: Icon, color, bg }) => (
              <div
                key={iconKey}
                className="group flex gap-3.5 p-4 rounded-2xl border border-neutral-100 hover:border-transparent hover:shadow-lg transition-all duration-200"
                onMouseEnter={e => (e.currentTarget.style.background = bg)}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-110"
                  style={{ background: bg }}
                >
                  <Icon size={19} style={{ color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 text-[15px] leading-tight mb-0.5">
                    {t(`whyJoin.${iconKey}`)}
                  </h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    {t(`whyJoin.${iconKey}Desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
