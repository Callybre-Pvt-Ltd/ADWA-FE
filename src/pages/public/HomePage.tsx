import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  CreditCard, MapPin, CheckCircle2, RefreshCw, ArrowRight,
  FileText, Upload, Wallet, Shield, Star, ChevronLeft, ChevronRight,
  Search, QrCode, FileCheck, Heart, Phone,
} from 'lucide-react'
import { fadeInUp, staggerContainer, popIn, slideInRight } from '@/utils/animations'
import { useStatistics, useTestimonials } from '@/hooks/useTeam'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { BilingualLabel } from '@/components/shared/BilingualLabel'
import { CountUp } from '@/components/shared/CountUp'
import { AdwaSeal } from '@/components/shared/AdwaSeal'
import { HeroIdCard } from '@/components/shared/HeroIdCard'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'

const MEMBERS = [
  { roleEn: 'Patron',            roleHi: 'संरक्षक',         nameEn: 'Prakash Kumar Singh',    nameHi: 'प्रकाश कुमार सिंह' },
  { roleEn: 'State President',   roleHi: 'प्रदेश अध्यक्ष',  nameEn: 'Akhilesh Puri Goswami',  nameHi: 'अखिलेश पुरी गोस्वामी', mobile: '9977282547' },
  { roleEn: 'Vice President',    roleHi: 'उपाध्यक्ष',       nameEn: 'Rajkumar Vishwakarma',   nameHi: 'राजकुमार विश्वकर्मा',  mobile: '9589074870' },
  { roleEn: 'General Secretary', roleHi: 'महासचिव',         nameEn: 'Subhash Wakodey',        nameHi: 'सुभाष वाकोड़े',         mobile: '9977540136' },
  { roleEn: 'Joint Secretary',   roleHi: 'संयुक्त सचिव',   nameEn: 'Patiram Davre',          nameHi: 'पतिराम दावरे',          mobile: '8085072711' },
  { roleEn: 'Treasurer',         roleHi: 'कोषाध्यक्ष',     nameEn: 'Kanshiram Sen',          nameHi: 'कांशीराम सेन',          mobile: '9131534674' },
  { roleEn: 'Committee Advisor', roleHi: 'कमेटी सलाहकार',  nameEn: 'Sukbhan Singh Yadav',    nameHi: 'सुकभान सिंह यादव',     mobile: '9131291915' },
  { roleEn: 'Spokesperson',      roleHi: 'प्रवक्ता',        nameEn: 'Abdul Razik',            nameHi: 'अब्दुल राजिक',          mobile: '9893542039' },
  { roleEn: 'Publicity Minister',roleHi: 'प्रचार मंत्री',  nameEn: 'Vijay Kumar Yadav',      nameHi: 'विजय कुमार यादव',      mobile: '7089107154' },
  { roleEn: 'Media In-charge',   roleHi: 'मीडिया प्रभारी', nameEn: 'Jitendra Meena',         nameHi: 'जितेन्द्र मीणा',        mobile: '7509777952' },
] as const

const STAT_ICONS = [CreditCard, MapPin, CheckCircle2, RefreshCw] as const
const STEP_ICONS = [FileText, Upload, Wallet, CheckCircle2] as const
const BENEFIT_ICONS = [Shield, FileCheck, Heart, RefreshCw] as const

const QUICK_ACTIONS = [
  {
    to: '/apply',
    icon: CreditCard,
    titleKey: 'quickActions.apply.title',
    hindiKey: 'quickActions.apply.hindi',
    accent: '#1D4ED8',
    iconBg: '#DBEAFE',
    iconShadow: 'rgba(29, 78, 216, 0.25)',
  },
  {
    to: '/status',
    icon: Search,
    titleKey: 'quickActions.track.title',
    hindiKey: 'quickActions.track.hindi',
    accent: '#F97316',
    iconBg: '#FFEDD5',
    iconShadow: 'rgba(249, 115, 22, 0.25)',
  },
  {
    to: '/renewal',
    icon: RefreshCw,
    titleKey: 'quickActions.renew.title',
    hindiKey: 'quickActions.renew.hindi',
    accent: '#16A34A',
    iconBg: '#DCFCE7',
    iconShadow: 'rgba(22, 163, 74, 0.25)',
  },
  {
    to: '/verify/ADWA-CARD-001',
    icon: QrCode,
    titleKey: 'quickActions.verify.title',
    hindiKey: 'quickActions.verify.hindi',
    accent: '#D97706',
    iconBg: '#FEF3C7',
    iconShadow: 'rgba(217, 119, 6, 0.25)',
  },
] as const

function QuickActionCard({
  to,
  icon: Icon,
  title,
  hindi,
  accent,
  iconBg,
  iconShadow,
}: {
  to: string
  icon: typeof CreditCard
  title: string
  hindi: string
  accent: string
  iconBg: string
  iconShadow: string
}) {
  const style = {
    '--card-accent': accent,
    '--icon-bg': iconBg,
    '--icon-color': accent,
    '--icon-shadow': iconShadow,
  } as CSSProperties

  return (
    <Link to={to} className="quick-action-card group flex flex-col min-h-[150px] p-5" style={style}>
      <div className="icon-circle-vivid h-16 w-16 mb-4 group-hover:scale-110 transition-transform duration-200">
        <Icon className="h-8 w-8" aria-hidden="true" />
      </div>
      <BilingualLabel english={title} hindi={hindi} size="sm" className="flex-1" />
      <div
        className="mt-3 self-end flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 group-hover:scale-110"
        style={{ backgroundColor: iconBg, color: accent }}
      >
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </div>
    </Link>
  )
}

export default function HomePage() {
  const { t, i18n } = useTranslation('home')
  const isHi = i18n.language === 'hi'
  const stats = useStatistics()
  const testimonials = useTestimonials()
  const [testimonialIdx, setTestimonialIdx] = useState(0)

  const steps = t('steps.items', { returnObjects: true }) as Array<{ title: string; hindi: string; hint: string }>

  return (
    <div className="bg-neutral-50">
      {/* Hero */}
      <section className="hero-bg relative">
        <div className="container-wide relative z-10 section-padding pb-16 md:pb-20">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <motion.div {...popIn} className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-5">
                <span className="trust-badge">
                  <CheckCircle2 className="h-4 w-4 text-green-400" aria-hidden="true" />
                  {t('hero.badge')}
                </span>
              </div>

              <div className="flex justify-center lg:justify-start items-center gap-3 mb-5">
                <AdwaSeal size="lg" />
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-bold text-blue-200">Registered Welfare Association</p>
                  <p className="text-xs text-white/60">ADWA/2019/INDIA</p>
                </div>
              </div>

              <h1 className="text-[2rem] sm:text-4xl md:text-5xl font-extrabold text-white leading-[1.1] tracking-tight">
                {t('hero.title')}
                <span className="block mt-1 bg-gradient-to-r from-orange-300 to-orange-400 bg-clip-text text-transparent">
                  {t('hero.titleHighlight')}
                </span>
              </h1>

              <p className="mt-4 text-xl font-semibold text-orange-200">{t('hero.hindiLine')}</p>
              <p className="mt-2 text-base text-blue-100/90">{t('hero.subtitleShort')}</p>

              <div className="mt-8 flex flex-col gap-3 max-w-md mx-auto lg:mx-0">
                <Button asChild size="lg" className="w-full rounded-xl shadow-lg shadow-blue-900/40 text-lg">
                  <Link to="/apply">
                    <CreditCard className="h-6 w-6" />
                    {t('hero.applyButton')}
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="w-full rounded-xl bg-white/10 border-2 border-white/40 text-white hover:bg-white/20 backdrop-blur-sm text-lg"
                >
                  <Link to="/status">
                    <Search className="h-6 w-6" />
                    {t('hero.trackButton')}
                  </Link>
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-3">
                {[t('hero.trustFree'), t('hero.trustSteps')].map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" aria-hidden="true" />
                    {label}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div {...slideInRight} className="flex justify-center lg:justify-end">
              <HeroIdCard />
            </motion.div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="relative z-10 leading-none" aria-hidden="true">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 25C840 30 960 30 1080 25C1200 20 1320 10 1380 5L1440 0V60H0Z" fill="#F8FAFC" />
          </svg>
        </div>
      </section>

      {/* Stats band */}
      <section className="stats-band py-10 md:py-14 -mt-1">
        <div className="container-wide relative z-10">
          <SectionHeading
            title={t('stats.title')}
            subtitle={t('stats.subtitle')}
            align="center"
            light
            className="mb-8"
          />
          {stats.isLoading ? (
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}</div>
          ) : stats.isError ? (
            <ErrorState onRetry={() => stats.refetch()} />
          ) : (
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="grid gap-4 grid-cols-2 lg:grid-cols-4"
            >
              {stats.data?.map((s, i) => {
                const Icon = STAT_ICONS[i % STAT_ICONS.length]
                const colors = ['#1D4ED8', '#F97316', '#16A34A', '#D97706']
                const bgs = ['#DBEAFE', '#FFEDD5', '#DCFCE7', '#FEF3C7']
                const color = colors[i % colors.length]
                const bg = bgs[i % bgs.length]
                return (
                  <motion.div
                    key={s.id}
                    variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                    className="stat-card-glass p-5 md:p-6 text-center"
                  >
                    <div
                      className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: bg, color }}
                    >
                      <Icon className="h-7 w-7" aria-hidden="true" />
                    </div>
                    <p className="text-2xl md:text-4xl font-extrabold tabular-nums" style={{ color }}>
                      {typeof s.value === 'number' && s.id !== 'days' ? (
                        <CountUp end={s.value} suffix={s.suffix ?? ''} />
                      ) : (
                        <>{s.value}{s.suffix ?? ''}</>
                      )}
                    </p>
                    <p className="mt-1 text-sm md:text-base font-bold text-neutral-700">{s.label}</p>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* Quick actions */}
      <section className="section-padding">
        <div className="container-wide">
          <SectionHeading title={t('quickActions.title')} subtitle={t('quickActions.subtitle')} align="center" />
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {QUICK_ACTIONS.map(({ to, icon, titleKey, hindiKey, accent, iconBg, iconShadow }) => (
              <QuickActionCard
                key={to}
                to={to}
                icon={icon}
                title={t(titleKey)}
                hindi={t(hindiKey)}
                accent={accent}
                iconBg={iconBg}
                iconShadow={iconShadow}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <SectionHeading title={t('steps.title')} subtitle={t('steps.subtitle')} align="center" />
          <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-blue-200 via-orange-200 to-green-200" aria-hidden="true" />
            {steps.map((step, i) => {
              const Icon = STEP_ICONS[i]
              const hues = ['#1D4ED8', '#F97316', '#16A34A', '#D97706']
              const hue = hues[i]
              return (
                <motion.div key={step.title} {...fadeInUp} transition={{ delay: i * 0.08 }} className="step-card text-center relative">
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-5xl font-black leading-none select-none opacity-10"
                    style={{ color: hue }}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <div
                    className="relative z-10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg"
                    style={{ backgroundColor: hue, boxShadow: `0 8px 20px ${hue}40` }}
                  >
                    <Icon className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <BilingualLabel english={step.title} hindi={step.hindi} size="md" align="center" />
                  <span
                    className="inline-block mt-3 rounded-full px-3 py-1 text-sm font-bold"
                    style={{ backgroundColor: `${hue}15`, color: hue }}
                  >
                    {step.hint}
                  </span>
                </motion.div>
              )
            })}
          </div>
          <div className="mt-10 text-center">
            <Button asChild size="lg" className="rounded-xl shadow-lg shadow-blue-600/30 px-10">
              <Link to="/apply">
                {t('steps.cta')} <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding bg-gradient-to-b from-blue-50 to-neutral-50">
        <div className="container-wide">
          <SectionHeading title={t('whyJoin.title')} subtitle={t('whyJoin.subtitle')} align="center" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(['verifiedId', 'digitalRecords', 'welfareSupport', 'easyRenewal'] as const).map((key, i) => {
              const Icon = BENEFIT_ICONS[i]
              const accents = ['#1D4ED8', '#F97316', '#16A34A', '#D97706']
              const bgs = ['#DBEAFE', '#FFEDD5', '#DCFCE7', '#FEF3C7']
              return (
                <motion.div
                  key={key}
                  {...fadeInUp}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="surface-card p-6 hover:shadow-lg transition-shadow"
                  style={{ borderTop: `4px solid ${accents[i]}` }}
                >
                  <div
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: bgs[i], color: accents[i] }}
                  >
                    <Icon className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-blue-900">{t(`whyJoin.${key}`)}</h3>
                  <p className="mt-2 text-base text-neutral-600 leading-relaxed">{t(`whyJoin.${key}Desc`)}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Members */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <SectionHeading
            title={isHi ? 'हमारे पदाधिकारी' : 'Our Office Bearers'}
            subtitle={isHi ? 'ऑल ड्राईवर्स कल्याण संगठन, मध्यप्रदेश के समर्पित सदस्य' : 'Dedicated members of All Drivers Welfare Association, M.P.'}
            align="center"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {MEMBERS.map((m, i) => (
              <motion.div
                key={i}
                {...fadeInUp}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -3 }}
                className="rounded-2xl border-2 border-neutral-200 bg-white p-5 flex flex-col gap-2 hover:border-blue-400 hover:shadow-lg transition-all duration-200"
              >
                <span className="self-start text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full leading-tight">
                  {isHi ? m.roleHi : m.roleEn}
                </span>
                <div className="mt-1">
                  <p className="text-base font-black text-neutral-900 leading-snug">
                    {isHi ? m.nameHi : m.nameEn}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {isHi ? m.nameEn : m.nameHi}
                  </p>
                </div>
                {'mobile' in m && m.mobile && (
                  <a
                    href={`tel:${m.mobile}`}
                    className="mt-auto flex items-center gap-1.5 text-xs text-blue-700 font-semibold hover:text-blue-900 transition-colors"
                  >
                    <Phone size={12} /> {m.mobile}
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-gradient-to-b from-neutral-50 to-blue-50">
        <div className="container-wide max-w-2xl">
          <SectionHeading title={t('testimonials.title')} subtitle={t('testimonials.subtitle')} align="center" />
          {testimonials.isLoading ? <SkeletonCard /> : testimonials.data && (
            <motion.div {...popIn} className="surface-card p-8 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-blue-600 to-green-500" aria-hidden="true" />
              <div className="flex gap-1 justify-center mb-5">
                {Array.from({ length: testimonials.data[testimonialIdx]?.rating ?? 5 }).map((_, i) => (
                  <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-center text-lg md:text-xl text-neutral-800 leading-relaxed">&ldquo;{testimonials.data[testimonialIdx]?.content}&rdquo;</p>
              <p className="mt-5 text-center text-lg font-bold text-blue-900">{testimonials.data[testimonialIdx]?.name}</p>
              <p className="text-center text-base text-neutral-600">{testimonials.data[testimonialIdx]?.role}, {testimonials.data[testimonialIdx]?.state}</p>
              <div className="mt-6 flex justify-center gap-3">
                <Button variant="outline" size="icon" onClick={() => setTestimonialIdx((i) => (i - 1 + testimonials.data!.length) % testimonials.data!.length)}><ChevronLeft className="h-5 w-5" /></Button>
                <Button variant="outline" size="icon" onClick={() => setTestimonialIdx((i) => (i + 1) % testimonials.data!.length)}><ChevronRight className="h-5 w-5" /></Button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section py-16 md:py-20 relative">
        <div className="container-wide text-center relative z-10">
          <motion.div {...fadeInUp}>
            <div className="section-accent-bar section-accent-bar-light mx-auto" />
            <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">{t('cta.title')}</h2>
            <p className="mt-4 text-base md:text-lg text-blue-100 max-w-xl mx-auto">{t('cta.subtitle')}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {[t('cta.trust1'), t('cta.trust2'), t('cta.trust3')].map((chip) => (
                <span key={chip} className="trust-badge text-sm">{chip}</span>
              ))}
            </div>
            <div className="mt-8">
              <Button asChild size="lg" variant="accent" className="min-w-[260px] rounded-xl text-lg shadow-xl shadow-orange-500/30 hover:scale-105 transition-transform">
                <Link to="/apply">{t('cta.button')} <ArrowRight className="h-5 w-5" /></Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
