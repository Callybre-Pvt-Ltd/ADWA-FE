import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  MapPin, CheckCircle2, Shield, Phone, Users, Award, Building2, Truck, Mail,
} from 'lucide-react'
import { fadeInUp, staggerContainer, popIn, slideInRight } from '@/utils/animations'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { AdwaSeal } from '@/components/shared/AdwaSeal'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { CONTACT_INFO, SOCIAL_LINKS } from '@/constants'

const ORG_STATS = [
  { id: '1', labelEn: 'Founded', labelHi: 'स्थापना', display: '2026' },
  { id: '2', labelEn: 'Districts (M.P.)', labelHi: 'जिले (म.प्र.)', display: '55' },
  { id: '3', labelEn: 'Registry No.', labelHi: 'पंजीकरण क्रमांक', display: '01/01/01/43116/26' },
  { id: '4', labelEn: 'State', labelHi: 'राज्य', display: 'M.P.' },
] as const

const PATRON = {
  roleEn: 'Patron', roleHi: 'संरक्षक',
  nameEn: 'Prakash Kumar Singh', nameHi: 'प्रकाश कुमार सिंह',
  photo: '/members/prakash-kumar-singh.webp',
}

const PRESIDENT = {
  roleEn: 'State President', roleHi: 'प्रदेश अध्यक्ष',
  nameEn: 'Akhilesh Puri Goswami', nameHi: 'अखिलेश पुरी गोस्वामी',
  photo: '/members/akhilesh-puri-goswami.webp',
}

const SENIOR_MEMBERS = [
  { roleEn: 'Vice President',    roleHi: 'उपाध्यक्ष',      nameEn: 'Rajkumar Vishwakarma', nameHi: 'राजकुमार विश्वकर्मा', photo: '/members/rajkumar-vishwakarma.webp' },
  { roleEn: 'General Secretary', roleHi: 'महासचिव',        nameEn: 'Subhash Wakodey',      nameHi: 'सुभाष वाकोड़े',        photo: '/members/subhash-wakode.webp' },
  { roleEn: 'Joint Secretary',   roleHi: 'संयुक्त सचिव',  nameEn: 'Patiram Davre',        nameHi: 'पतिराम दावरे',         photo: '/members/patiram-daore.webp' },
  { roleEn: 'Treasurer',         roleHi: 'कोषाध्यक्ष',    nameEn: 'Kanshiram Sen',        nameHi: 'कांशीराम सेन',         photo: '/members/kashiram-sen.webp' },
]

const COMMITTEE_MEMBERS = [
  { roleEn: 'Committee Advisor', roleHi: 'कमेटी सलाहकार', nameEn: 'Sukbhan Singh Yadav',  nameHi: 'सुकभान सिंह यादव',    photo: '/members/sukhman-singh-yadav.webp' },
  { roleEn: 'Spokesperson',      roleHi: 'प्रवक्ता',       nameEn: 'Abdul Razik',          nameHi: 'अब्दुल राजिक',         photo: '/members/abdul-rajik.webp' },
  { roleEn: 'Publicity Minister',roleHi: 'प्रचार मंत्री', nameEn: 'Vijay Kumar Yadav',    nameHi: 'विजय कुमार यादव',     photo: '/members/vijay-singh.webp' },
  { roleEn: 'Media In-charge',   roleHi: 'मीडिया प्रभारी',nameEn: 'Jitendra Meena',       nameHi: 'जितेन्द्र मीणा',       photo: '/members/jitendra-meena.webp' },
]

function MemberPhoto({ src, name, size = 'md' }: { src: string; name: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClass = { sm: 'h-20 w-20', md: 'h-24 w-24', lg: 'h-32 w-32', xl: 'h-40 w-40' }[size]
  return (
    <div className={`${sizeClass} rounded-full overflow-hidden border-4 border-white shadow-lg bg-white shrink-0 mx-auto`}>
      <img
        src={src}
        alt={name}
        className="w-full h-full object-cover object-top transition-transform duration-300 hover:scale-105"
        loading="lazy"
        decoding="async"
        onError={(e) => {
          const el = e.currentTarget
          el.style.display = 'none'
          const p = el.parentElement
          if (p) p.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:900;color:#93c5fd">${name.charAt(0)}</div>`
        }}
      />
    </div>
  )
}

export default function HomePage() {
  const { t, i18n } = useTranslation('home')
  const isHi = i18n.language === 'hi'

  return (
    <div className="bg-neutral-50">

      {/* ── HERO: Org Portfolio ── */}
      <section className="hero-bg relative overflow-hidden">
        {/* Background video — truck driving through night (Mixkit free license) */}
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          {/* "Driving a truck through the night" — Mixkit free stock */}
          <source src="https://assets.mixkit.co/videos/17228/17228-720.mp4" type="video/mp4" />
          {/* Fallback: night traffic interior view */}
          <source src="https://assets.mixkit.co/videos/42039/42039-720.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay so text stays readable over video */}
        <div className="absolute inset-0 bg-blue-950/75 z-[1] pointer-events-none" aria-hidden="true" />
        {/* Colour tint blobs on top of video — Saffron & Green from logo */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-orange-500/15 blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none z-[2]" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-green-500/15 blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none z-[2]" aria-hidden="true" />

        <div className="container-wide relative z-10 section-padding pb-20 md:pb-28">
          <div className="grid gap-12 lg:grid-cols-2 items-center">

            {/* Left: Org identity */}
            <motion.div {...popIn} className="text-center lg:text-left">
              {/* Flag stripe */}
              <div className="flex justify-center lg:justify-start mb-6">
                <div className="flex items-center gap-1 rounded-full overflow-hidden border border-white/20">
                  <span className="px-3 py-1 text-xs font-bold bg-orange-500 text-white">भारत</span>
                  <span className="px-3 py-1 text-xs font-bold bg-white text-neutral-800">INDIA</span>
                  <span className="px-3 py-1 text-xs font-bold bg-green-600 text-white">🇮🇳</span>
                </div>
              </div>

              {/* Seal + name */}
              <div className="flex justify-center lg:justify-start items-center gap-4 mb-6">
                <AdwaSeal size="lg" />
                <div className="text-left">
                  <p className="text-lg sm:text-xl font-black text-white leading-tight">
                    {isHi ? 'ऑल ड्राइवर्स वेलफेयर' : 'All Drivers Welfare'}
                  </p>
                  <p className="text-lg sm:text-xl font-black text-orange-300 leading-tight">
                    {isHi ? 'एसोसिएशन' : 'Association'}
                  </p>
                  <p className="text-xs text-white/50 mt-0.5">
                    {isHi
                      ? `पंजीकरण क्रमांक: ${CONTACT_INFO.registryNumber} · म.प्र.`
                      : `Reg. ${CONTACT_INFO.registryNumber} · M.P.`}
                  </p>
                </div>
              </div>

              <p className="text-2xl font-bold text-orange-200 leading-snug mb-2">
                {isHi ? 'ऑल ड्राइवर्स कल्याण संगठन' : 'All Drivers Welfare Association'}
              </p>
              <p className="text-base text-blue-100/80 max-w-md mx-auto lg:mx-0 leading-relaxed">
                {isHi
                  ? 'एक पंजीकृत कल्याण संघ जो मध्य प्रदेश में पेशेवर ड्राइवरों की सेवा कर रहा है — 2 जून 2026 से आधिकारिक पहचान, कल्याण सहायता और डिजिटल सेवाएं प्रदान कर रहा है।'
                  : 'A registered welfare association serving professional drivers across Madhya Pradesh — providing official identity, welfare support, and digital services since 2 June 2026.'}
              </p>

              {/* Org trust chips */}
              <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-2">
                {[
                  { icon: Award, labelEn: 'Govt. Recognised', labelHi: 'सरकार मान्यता प्राप्त' },
                  { icon: MapPin, labelEn: '55 Districts (M.P.)', labelHi: '55 जिले (म.प्र.)' },
                  { icon: Building2, labelEn: 'Since 2026', labelHi: '2026 से स्थापित' },
                ].map(({ icon: Icon, labelEn, labelHi }) => (
                  <span key={labelEn} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
                    <Icon className="h-3.5 w-3.5 text-orange-300" aria-hidden="true" />
                    {isHi ? labelHi : labelEn}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0">
                <Button
                  asChild
                  size="lg"
                  className="flex-1 rounded-xl bg-white/10 border-2 border-white/40 text-white hover:bg-white/20 backdrop-blur-sm text-base"
                >
                  <Link to="/about">
                    <Building2 className="h-5 w-5" />
                    {isHi ? 'ADWA के बारे में' : 'About ADWA'}
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Angled transition → stats band */}
        <div className="relative z-10 leading-none" aria-hidden="true">
          <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <defs>
              <linearGradient id="divGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#172554" />
                <stop offset="50%" stopColor="#1e40af" />
                <stop offset="100%" stopColor="#172554" />
              </linearGradient>
            </defs>
            {/* Sharp diagonal cut with thin orange accent line */}
            <polygon points="0,56 1440,0 1440,56" fill="url(#divGrad)" />
            <line x1="0" y1="56" x2="1440" y2="0" stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.5" />
          </svg>
        </div>
      </section>

      {/* Stats band */}
      <section className="stats-band py-10 md:py-14">
        <div className="container-wide relative z-10">
          <SectionHeading
            title={t('stats.title')}
            subtitle={t('stats.subtitle')}
            align="center"
            light
            className="mb-8"
          />
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="grid gap-4 grid-cols-2 lg:grid-cols-4"
          >
            {ORG_STATS.map((s, i) => {
                const StatIcons = [Building2, MapPin, CheckCircle2, Truck]
                const Icon = StatIcons[i % StatIcons.length]
                const colors = ['#F97316', '#1D4ED8', '#16A34A', '#D97706']
                const bgs = ['#FFEDD5', '#DBEAFE', '#DCFCE7', '#FEF3C7']
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
                    <p className="text-xl md:text-2xl font-extrabold tabular-nums break-all" style={{ color }}>
                      {s.display}
                    </p>
                    <p className="mt-1 text-sm md:text-base font-bold text-neutral-700">{isHi ? s.labelHi : s.labelEn}</p>
                  </motion.div>
                )
            })}
          </motion.div>
        </div>
      </section>

      {/* Official association facts */}
      <AssociationFactsSection isHi={isHi} />

      {/* Mission */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <motion.div {...fadeInUp}>
              <SectionHeading
                title={isHi ? 'हमारा मिशन' : 'Our Mission'}
                subtitle={isHi ? 'मध्य प्रदेश के पेशेवर ड्राइवरों के लिए' : 'For professional drivers of Madhya Pradesh'}
                align="left"
              />
              <p className="mt-4 text-base text-neutral-600 leading-relaxed">
                {isHi
                  ? 'ADWA मध्य प्रदेश में पेशेवर ड्राइवरों के कल्याण और सशक्तिकरण के लिए समर्पित है। हम आधिकारिक मान्यता, डिजिटल पहचान और सहायता प्रणाली प्रदान करते हैं जो ड्राइवरों और उनके परिवारों की रक्षा करते हैं।'
                  : 'ADWA is dedicated to the welfare and empowerment of professional drivers across Madhya Pradesh. We provide official recognition, digital identity, and support systems that protect drivers and their families.'}
              </p>
              <p className="mt-3 text-base text-neutral-600 leading-relaxed">
                {isHi
                  ? 'मध्य प्रदेश के 55 जिलों में, हमारे सदस्य पेशेवर पहचान, कल्याणकारी लाभों और नीतिगत मामलों में एक एकीकृत आवाज़ के लिए ADWA पर भरोसा करते हैं।'
                  : 'Across 55 districts of Madhya Pradesh, our members rely on ADWA for their professional identity, welfare benefits, and a unified voice in policy matters.'}
              </p>
              <div className="mt-6 grid grid-cols-3 gap-4">
                {[
                  { value: '2026', labelEn: 'Founded', labelHi: 'स्थापना', cls: 'bg-orange-50 text-orange-600' },
                  { value: '55', labelEn: 'Districts', labelHi: 'जिले', cls: 'bg-blue-50 text-blue-700' },
                  { value: 'M.P.', labelEn: 'State', labelHi: 'राज्य', cls: 'bg-green-50 text-green-700' },
                ].map(({ value, labelEn, labelHi, cls }) => (
                  <div key={labelEn} className={cn("rounded-xl p-4 text-center", cls)}>
                    <p className="text-2xl font-black">{value}</p>
                    <p className="text-xs font-semibold text-neutral-500 mt-0.5">{isHi ? labelHi : labelEn}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...slideInRight} className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, titleEn: 'Driver Welfare', titleHi: 'ड्राइवर कल्याण', color: '#1D4ED8', bg: '#DBEAFE' },
                { icon: Award, titleEn: 'Official Recognition', titleHi: 'आधिकारिक मान्यता', color: '#D97706', bg: '#FEF3C7' },
                { icon: Users, titleEn: 'Community', titleHi: 'समुदाय', color: '#16A34A', bg: '#DCFCE7' },
                { icon: Building2, titleEn: 'Registered Body', titleHi: 'पंजीकृत संस्था', color: '#F97316', bg: '#FFEDD5' },
              ].map(({ icon: Icon, titleEn, titleHi, color, bg }, i) => (
                <motion.div
                  key={titleEn}
                  {...fadeInUp}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ y: -3 }}
                  className="rounded-2xl border border-neutral-200 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: bg, color }}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900 text-sm">{isHi ? titleHi : titleEn}</p>
                    <p className="text-xs text-neutral-500">{isHi ? titleEn : titleHi}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* OFFICE BEARERS — HIERARCHICAL */}
      <section className="section-padding bg-gradient-to-b from-blue-50 to-neutral-50">
        <div className="container-wide">
          <SectionHeading
            title={isHi ? 'हमारे पदाधिकारी' : 'Our Office Bearers'}
            subtitle={isHi ? 'ऑल ड्राईवर्स कल्याण संगठन, मध्यप्रदेश' : 'All Drivers Welfare Association, Madhya Pradesh'}
            align="center"
          />

          {/* Tier 1 — Patron */}
          <motion.div {...fadeInUp} className="mt-8 flex justify-center">
            <div className="relative flex flex-col items-center bg-white rounded-3xl border-2 border-orange-200 shadow-lg px-8 py-6 w-full max-w-[260px]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-black px-4 py-1 rounded-full shadow whitespace-nowrap">
                {isHi ? PATRON.roleHi : PATRON.roleEn}
              </div>
              <MemberPhoto src={PATRON.photo} name={PATRON.nameEn} size="xl" />
              <p className="mt-4 text-base font-black text-neutral-900 text-center leading-tight">{isHi ? PATRON.nameHi : PATRON.nameEn}</p>
              <p className="text-xs text-neutral-400 text-center mt-0.5">{isHi ? PATRON.nameEn : PATRON.nameHi}</p>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-blue-200" aria-hidden="true" />
            </div>
          </motion.div>

          {/* Tier 2 — President */}
          <motion.div {...fadeInUp} transition={{ delay: 0.08 }} className="mt-8 flex justify-center">
            <div className="relative flex flex-col items-center bg-white rounded-3xl border-2 border-blue-300 shadow-lg px-8 py-6 w-full max-w-[260px]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-700 text-white text-xs font-black px-4 py-1 rounded-full shadow whitespace-nowrap">
                {isHi ? PRESIDENT.roleHi : PRESIDENT.roleEn}
              </div>
              <MemberPhoto src={PRESIDENT.photo} name={PRESIDENT.nameEn} size="xl" />
              <p className="mt-4 text-base font-black text-neutral-900 text-center leading-tight">{isHi ? PRESIDENT.nameHi : PRESIDENT.nameEn}</p>
              <p className="text-xs text-neutral-400 text-center mt-0.5">{isHi ? PRESIDENT.nameEn : PRESIDENT.nameHi}</p>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-blue-200" aria-hidden="true" />
            </div>
          </motion.div>

          {/* Tier 3 — VP, Gen Sec, Joint Sec, Treasurer with logo-aligned color cycles */}
          <motion.div {...fadeInUp} transition={{ delay: 0.14 }} className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {SENIOR_MEMBERS.map((m, i) => {
              const seniorThemes = [
                { border: 'border-blue-100 hover:border-blue-300', tag: 'bg-blue-50 text-blue-700 border-blue-100/50' },
                { border: 'border-orange-100 hover:border-orange-300', tag: 'bg-orange-50 text-orange-600 border-orange-100/50' },
                { border: 'border-green-100 hover:border-green-300', tag: 'bg-green-50 text-green-700 border-green-100/50' },
                { border: 'border-blue-100 hover:border-blue-300', tag: 'bg-blue-50 text-blue-700 border-blue-100/50' },
              ]
              const theme = seniorThemes[i % seniorThemes.length]
              return (
                <motion.div key={m.nameEn} {...fadeInUp} transition={{ delay: 0.18 + i * 0.05 }}
                  className={cn("flex flex-col items-center bg-white rounded-3xl border shadow-md p-6 text-center hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300", theme.border)}
                >
                  <MemberPhoto src={m.photo} name={m.nameEn} size="md" />
                  <span className={cn("mt-4 inline-block text-xs font-bold px-3 py-1 rounded-full leading-tight border", theme.tag)}>
                    {isHi ? m.roleHi : m.roleEn}
                  </span>
                  <p className="mt-3 text-sm font-black text-neutral-900 leading-snug">{isHi ? m.nameHi : m.nameEn}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{isHi ? m.nameEn : m.nameHi}</p>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Committee divider */}
          <div className="my-10 flex items-center gap-4 max-w-6xl mx-auto">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-neutral-200" />
            <span className="text-xs font-black uppercase tracking-wider text-neutral-400 px-2">{isHi ? 'विशेष समिति सदस्य' : 'Committee Members'}</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-neutral-200" />
          </div>

          {/* Tier 4 — Committee */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {COMMITTEE_MEMBERS.map((m, i) => {
              const committeeThemes = [
                { border: 'border-blue-100 hover:border-blue-300', tag: 'bg-blue-50 text-blue-700 border-blue-100/50' },
                { border: 'border-orange-100 hover:border-orange-300', tag: 'bg-orange-50 text-orange-600 border-orange-100/50' },
                { border: 'border-green-100 hover:border-green-300', tag: 'bg-green-50 text-green-700 border-green-100/50' },
                { border: 'border-blue-100 hover:border-blue-300', tag: 'bg-blue-50 text-blue-700 border-blue-100/50' },
              ]
              const theme = committeeThemes[i % committeeThemes.length]
              return (
                <motion.div key={m.nameEn} {...fadeInUp} transition={{ delay: 0.25 + i * 0.04 }}
                  className={cn("flex flex-col items-center bg-white rounded-3xl border shadow-md p-6 text-center hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300", theme.border)}
                >
                  <MemberPhoto src={m.photo} name={m.nameEn} size="md" />
                  <span className={cn("mt-4 inline-block text-xs font-bold px-3 py-1 rounded-full leading-tight border", theme.tag)}>
                    {isHi ? m.roleHi : m.roleEn}
                  </span>
                  <p className="mt-3 text-sm font-black text-neutral-900 leading-snug">{isHi ? m.nameHi : m.nameEn}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{isHi ? m.nameEn : m.nameHi}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="cta-section py-12 px-4 relative">
        <div className="container-wide text-center relative z-10">
          <motion.div {...fadeInUp}>
            <AdwaSeal size="lg" className="mx-auto mb-4" />
            <h2 className="text-lg font-extrabold text-white">
              {isHi ? 'ऑल ड्राइवर्स वेलफेयर एसोसिएशन' : 'All Drivers Welfare Association'}
            </h2>
            <p className="text-sm font-bold text-orange-300 mt-0.5">
              {isHi ? 'ऑल ड्राईवर्स कल्याण संगठन, म.प्र.' : 'All Drivers Welfare Association, M.P.'}
            </p>
            <p className="mt-3 text-xs text-blue-200/80 max-w-xs mx-auto leading-relaxed">
              {isHi ? CONTACT_INFO.addressHi : CONTACT_INFO.address}
            </p>
            <div className="mt-5 flex flex-col items-center gap-3">
              <a href={`tel:${CONTACT_INFO.phoneTel}`} className="inline-flex items-center gap-2 text-white font-bold text-sm bg-white/10 border border-white/20 rounded-full px-5 py-2.5 backdrop-blur-sm">
                <Phone className="h-4 w-4 text-orange-300" /> {CONTACT_INFO.supportPhone}
              </a>
              <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white font-bold text-sm bg-white/10 border border-white/20 rounded-full px-5 py-2.5 backdrop-blur-sm">
                WhatsApp {CONTACT_INFO.whatsapp}
              </a>
              <a href={`mailto:${CONTACT_INFO.email}`} className="inline-flex items-center gap-2 text-white font-semibold text-xs bg-white/10 border border-white/20 rounded-full px-4 py-2.5 backdrop-blur-sm">
                <Mail className="h-4 w-4 text-blue-300" /> {CONTACT_INFO.email}
              </a>
            </div>
            <p className="mt-5 text-xs text-blue-300/50">
              {isHi
                ? `पंजीकरण क्रमांक: ${CONTACT_INFO.registryNumber}`
                : `Reg. No. ${CONTACT_INFO.registryNumber}`}
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

function AssociationFactsSection({ isHi }: { isHi: boolean }) {
  const facts = [
    {
      icon: Building2,
      titleEn: 'Founded',
      titleHi: 'स्थापना',
      valueEn: CONTACT_INFO.foundedOn,
      valueHi: CONTACT_INFO.foundedOnHi,
    },
    {
      icon: CheckCircle2,
      titleEn: 'Registry Number',
      titleHi: 'पंजीकरण क्रमांक',
      valueEn: CONTACT_INFO.registryNumber,
      valueHi: CONTACT_INFO.registryNumber,
    },
    {
      icon: MapPin,
      titleEn: 'Coverage',
      titleHi: 'क्षेत्र',
      valueEn: CONTACT_INFO.districtsCovered,
      valueHi: CONTACT_INFO.districtsCoveredHi,
    },
    {
      icon: Phone,
      titleEn: 'Contact',
      titleHi: 'संपर्क',
      valueEn: `${CONTACT_INFO.supportPhone} · WhatsApp ${CONTACT_INFO.whatsapp}`,
      valueHi: `${CONTACT_INFO.supportPhone} · व्हाट्सएप ${CONTACT_INFO.whatsapp}`,
    },
  ]

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 py-16 md:py-20">
      <div className="container-wide relative z-10">
        <motion.div {...fadeInUp} className="text-center mb-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-500/15 border border-orange-400/25 px-4 py-1.5 text-sm font-bold text-orange-300 mb-4">
            {isHi ? 'आधिकारिक जानकारी' : 'Official Information'}
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
            {isHi ? 'ऑल ड्राइवर्स वेलफेयर एसोसिएशन, मध्य प्रदेश' : 'All Drivers Welfare Association, Madhya Pradesh'}
          </h2>
          <p className="mt-2 text-blue-200/70 text-base max-w-xl mx-auto">
            {isHi
              ? '2 जून 2026 को स्थापित पंजीकृत कल्याण संघ — मध्य प्रदेश के 55 जिलों में ड्राइवर कल्याण के लिए।'
              : 'Registered welfare association founded on 2 June 2026 — serving drivers across 55 districts of Madhya Pradesh.'}
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map(({ icon: Icon, titleEn, titleHi, valueEn, valueHi }, i) => (
            <motion.div
              key={titleEn}
              {...fadeInUp}
              transition={{ delay: i * 0.07 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <Icon className="h-5 w-5 text-orange-300 mb-3" aria-hidden="true" />
              <p className="text-xs font-bold uppercase tracking-wider text-blue-200/70">
                {isHi ? titleHi : titleEn}
              </p>
              <p className="mt-1 text-sm font-bold text-white leading-snug break-words">
                {isHi ? valueHi : valueEn}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

