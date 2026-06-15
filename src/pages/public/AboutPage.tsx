import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Target, Eye, Heart } from 'lucide-react'
import { fadeInUp } from '@/utils/animations'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { PageHero } from '@/components/shared/PageHero'

const VALUES = [
  { icon: Heart, title: 'Integrity', desc: 'Transparent processes and honest service to every driver.' },
  { icon: Target, title: 'Empowerment', desc: 'Giving drivers a verified identity and collective voice.' },
  { icon: Eye, title: 'Inclusion', desc: 'Serving drivers across all states, languages, and backgrounds.' },
]

export default function AboutPage() {
  const { t } = useTranslation('pages')

  return (
    <div className="bg-white">
      <PageHero title={t('about.title')} subtitle={t('about.subtitle')} />

      <section className="section-padding">
        <div className="container-wide max-w-4xl">
          <motion.div {...fadeInUp} className="prose max-w-none">
            <p className="text-lg text-neutral-700">{t('about.aboutText')}</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-neutral-50">
        <div className="container-wide">
          <div className="grid gap-8 md:grid-cols-2">
            <motion.div {...fadeInUp} className="rounded-xl border border-neutral-200 bg-white p-6">
              <h2 className="text-xl font-bold text-neutral-900">{t('about.missionTitle')}</h2>
              <p className="mt-3 text-neutral-600">{t('about.missionText')}</p>
            </motion.div>
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className="rounded-xl border border-neutral-200 bg-white p-6">
              <h2 className="text-xl font-bold text-neutral-900">{t('about.visionTitle')}</h2>
              <p className="mt-3 text-neutral-600">{t('about.visionText')}</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-wide">
          <SectionHeading title="Our Values" subtitle="Principles that guide everything we do" align="center" />
          <div className="grid gap-6 md:grid-cols-3">
            {VALUES.map((v, i) => (
              <motion.div key={v.title} {...fadeInUp} transition={{ delay: i * 0.1 }} className="rounded-lg border border-neutral-200 p-6 text-center">
                <v.icon className="mx-auto h-8 w-8 text-navy-700" />
                <h3 className="mt-4 font-semibold text-neutral-900">{v.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-neutral-50">
        <div className="container-wide max-w-3xl">
          <SectionHeading title="Founding Story" subtitle="From 200 members to 12 lakh+ drivers" />
          <p className="text-neutral-700">{t('about.whoWeAreDesc1')}</p>
          <p className="mt-4 text-neutral-700">{t('about.whoWeAreDesc2')}</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-wide">
          <SectionHeading title="Achievements" subtitle={t('about.objectivesSubtitle')} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: t('about.stat1Label'), value: '12L+' },
              { label: t('about.stat2Label'), value: '28' },
              { label: t('about.stat3Label'), value: '15+' },
              { label: t('about.stat4Label'), value: '9.8L+' },
            ].map((a, i) => (
              <motion.div key={a.label} {...fadeInUp} transition={{ delay: i * 0.08 }} className="rounded-lg bg-navy-50 p-6 text-center">
                <p className="text-2xl font-bold text-navy-700">{a.value}</p>
                <p className="mt-1 text-sm text-neutral-600">{a.label}</p>
              </motion.div>
            ))}
          </div>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {(t('about.objectives', { returnObjects: true }) as string[]).map((obj) => (
              <li key={obj} className="flex gap-2 text-sm text-neutral-700">
                <span className="text-emerald-600">✓</span> {obj}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
