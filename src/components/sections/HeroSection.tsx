import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Search, ShieldCheck, CheckCircle } from 'lucide-react'
import { ROUTES } from '@/constants'

function IDCardVisual() {
  const { t } = useTranslation('home')

  return (
    <div className="relative w-full max-w-sm mx-auto select-none">
      <div className="absolute inset-0 bg-[#0F4C81]/20 rounded-3xl blur-3xl scale-90 translate-y-6" />

      <div className="relative bg-[#0F4C81] rounded-3xl p-6 shadow-2xl shadow-blue-900/40">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-xs">AD</span>
            </div>
            <div>
              <div className="text-white/60 text-[10px] uppercase tracking-widest leading-none">{t('hero.cardAllDrivers')}</div>
              <div className="text-white font-bold text-xs leading-none mt-0.5">{t('hero.cardWelfareAssoc')}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-[#16A34A] px-2.5 py-1 rounded-full">
            <CheckCircle size={11} className="text-white" />
            <span className="text-white text-[10px] font-semibold">{t('hero.cardVerified')}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
            <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
              <circle cx="24" cy="18" r="8" fill="white" opacity="0.7" />
              <ellipse cx="24" cy="38" rx="14" ry="8" fill="white" opacity="0.7" />
            </svg>
          </div>
          <div>
            <div className="text-white font-bold text-base leading-tight">Rajesh Kumar</div>
            <div className="text-white/60 text-sm mt-0.5">{t('hero.cardDriverType')}</div>
            <div className="text-white/40 text-[10px] mt-1 font-mono">DL-UP14-2019-00234</div>
          </div>
        </div>

        <div className="h-px bg-white/10 mb-4" />

        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { labelKey: 'hero.cardBlood', value: 'O+' },
            { labelKey: 'hero.cardState', value: 'U.P.' },
            { labelKey: 'hero.cardRTO', value: 'UP14' },
          ].map(({ labelKey, value }) => (
            <div key={labelKey}>
              <div className="text-white/40 text-[9px] uppercase tracking-wider">{t(labelKey)}</div>
              <div className="text-white font-semibold text-sm">{value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white/10 rounded-xl px-3 py-2.5 flex items-center justify-between">
          <span className="text-white/50 text-[10px] uppercase tracking-wider">{t('hero.cardRefNo')}</span>
          <span className="text-white font-mono text-xs font-semibold tracking-wider">ADWA-2025-R4K9M2</span>
        </div>
      </div>

      <div className="absolute -left-6 top-10 bg-white rounded-2xl shadow-xl px-3.5 py-2.5 flex items-center gap-2 border border-neutral-100">
        <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
          <CheckCircle size={14} className="text-[#16A34A]" />
        </div>
        <div>
          <div className="text-[10px] text-neutral-400 leading-none">{t('hero.chipMembers')}</div>
          <div className="text-sm font-bold text-neutral-900 leading-tight">12L+</div>
        </div>
      </div>

      <div className="absolute -right-5 bottom-14 bg-white rounded-2xl shadow-xl px-3.5 py-2.5 flex items-center gap-2 border border-neutral-100">
        <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L8.5 5H13L9.5 7.5L11 12L7 9L3 12L4.5 7.5L1 5H5.5L7 1Z" fill="#0F4C81" />
          </svg>
        </div>
        <div>
          <div className="text-[10px] text-neutral-400 leading-none">{t('hero.chipStates')}</div>
          <div className="text-sm font-bold text-neutral-900 leading-tight">28</div>
        </div>
      </div>

      <div className="absolute -bottom-4 left-8 bg-amber-400 rounded-xl shadow-lg px-3 py-1.5">
        <span className="text-amber-900 text-[10px] font-bold uppercase tracking-wider">{t('hero.chipDigitalIndia')}</span>
      </div>
    </div>
  )
}

export function HeroSection() {
  const { t } = useTranslation('home')

  return (
    <section className="relative overflow-hidden bg-white min-h-[90vh] flex items-center">
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-50 rounded-full opacity-60" />
      <div className="absolute -bottom-60 -left-20 w-[400px] h-[400px] bg-blue-50 rounded-full opacity-40" />

      <div
        className="absolute top-0 right-0 w-72 h-72 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(#0F4C81 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />

      <div className="container-wide relative py-16 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-7">
              <ShieldCheck size={13} className="text-[#0F4C81]" />
              <span className="text-[#0F4C81] text-xs font-semibold tracking-wide">{t('hero.badge')}</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-[64px] font-extrabold text-neutral-900 mb-5 leading-[1.05] tracking-tight">
              {t('hero.title')}<br />
              <span className="text-[#0F4C81]">
                {t('hero.titleHighlight')}
              </span>
            </h1>

            <p className="text-lg text-neutral-500 mb-9 leading-relaxed max-w-[480px]">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link
                to={ROUTES.APPLY}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-[#0F4C81] text-white rounded-2xl text-base font-bold hover:bg-[#0a3563] transition-all shadow-xl shadow-blue-900/25 hover:-translate-y-0.5 hover:shadow-blue-900/35"
              >
                {t('hero.applyButton')}
                <ArrowRight size={18} />
              </Link>
              <Link
                to={ROUTES.TRACK}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 border-2 border-neutral-200 text-neutral-700 rounded-2xl text-base font-semibold hover:border-[#0F4C81]/30 hover:bg-blue-50/50 transition-all"
              >
                <Search size={18} />
                {t('hero.trackButton')}
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-5 pt-2 border-t border-neutral-100">
              <div className="flex -space-x-2.5">
                {['#0F4C81', '#16A34A', '#F59E0B', '#7C3AED', '#DC2626'].map((c, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold"
                    style={{ backgroundColor: c }}
                  >
                    {['R', 'S', 'M', 'G', 'A'][i]}
                  </div>
                ))}
              </div>
              <div className="text-sm text-neutral-500">
                <span className="font-semibold text-neutral-900">{t('hero.socialProofCount')}</span>{' '}
                {t('hero.socialProof')}
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} width="13" height="13" viewBox="0 0 12 12" fill="#F59E0B">
                    <path d="M6 1l1.4 3.1H11L8.2 6.3l1 3.2L6 7.6 2.8 9.5l1-3.2L1 4.1h3.6z"/>
                  </svg>
                ))}
                <span className="text-xs text-neutral-500 ml-1">4.9 / 5</span>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 flex justify-center lg:justify-end pr-0 lg:pr-8">
            <IDCardVisual />
          </div>
        </div>
      </div>
    </section>
  )
}
