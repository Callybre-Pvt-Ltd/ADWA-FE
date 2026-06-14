import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Target, Eye, Award, Users } from 'lucide-react'
import { homeService } from '@/services'
import { Badge } from '@/components/common/Badge'
import { SectionHeader } from '@/components/common/SectionHeader'
import { Spinner } from '@/components/common/Spinner'

export function AboutPage() {
  const { t } = useTranslation('pages')
  const { data: members, isLoading } = useQuery({
    queryKey: ['leadership'],
    queryFn: homeService.getLeadership,
    staleTime: 1000 * 60 * 10,
  })

  const objectives = (t('about.objectives', { returnObjects: true }) ?? []) as string[]
  const welfare = (t('about.welfare', { returnObjects: true }) ?? []) as Array<{ title: string; desc: string; icon: string }>
  const timeline = (t('about.timeline', { returnObjects: true }) ?? []) as Array<{ year: string; event: string }>

  return (
    <div>
      {/* Hero */}
      <div className="bg-[#0F4C81] py-16 md:py-20">
        <div className="container-wide text-center">
          <Badge variant="accent" className="mb-4">{t('about.badge')}</Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{t('about.title')}</h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">{t('about.subtitle')}</p>
        </div>
      </div>

      {/* About */}
      <section className="section-padding bg-white">
        <div className="container-wide max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="primary" className="mb-4">{t('about.whoWeAreBadge')}</Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4">
                {t('about.whoWeAreTitle')}
              </h2>
              <p className="text-neutral-600 leading-relaxed mb-4">{t('about.whoWeAreDesc1')}</p>
              <p className="text-neutral-600 leading-relaxed">{t('about.whoWeAreDesc2')}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Users, label: '12L+', subKey: 'about.stat1Label' },
                { icon: Award, label: '28', subKey: 'about.stat2Label' },
                { icon: Target, label: '15', subKey: 'about.stat3Label' },
                { icon: Eye, label: '3.4L+', subKey: 'about.stat4Label' },
              ].map(({ icon: Icon, label, subKey }) => (
                <div key={subKey} className="bg-neutral-50 rounded-2xl p-5 text-center border border-neutral-100">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon size={20} className="text-[#0F4C81]" />
                  </div>
                  <div className="text-2xl font-bold text-[#0F4C81]">{label}</div>
                  <div className="text-xs text-neutral-500 mt-1">{t(subKey)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="section-padding bg-neutral-50">
        <div className="container-wide max-w-5xl">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-2xl border border-neutral-100">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-5">
                <Eye size={22} className="text-[#0F4C81]" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">{t('about.visionTitle')}</h3>
              <p className="text-neutral-600 leading-relaxed">{t('about.visionText')}</p>
            </div>
            <div className="bg-[#0F4C81] p-8 rounded-2xl">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-5">
                <Target size={22} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t('about.missionTitle')}</h3>
              <p className="text-blue-100 leading-relaxed">{t('about.missionText')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="section-padding bg-white">
        <div className="container-wide max-w-5xl">
          <SectionHeader title={t('about.objectivesTitle')} subtitle={t('about.objectivesSubtitle')} />
          <div className="grid sm:grid-cols-2 gap-4">
            {objectives.map((obj, i) => (
              <div key={i} className="flex gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                <div className="w-7 h-7 bg-[#0F4C81] rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-bold mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed">{obj}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Welfare Programs */}
      <section className="section-padding bg-neutral-50">
        <div className="container-wide">
          <SectionHeader title={t('about.welfareProgramsTitle')} subtitle={t('about.welfareProgramsSubtitle')} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {welfare.map((p) => (
              <div key={p.title} className="bg-white p-5 rounded-2xl border border-neutral-100 hover:shadow-sm transition-all">
                <span className="text-2xl mb-3 block">{p.icon}</span>
                <h3 className="font-semibold text-neutral-900 text-sm mb-2">{p.title}</h3>
                <p className="text-sm text-neutral-500">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <SectionHeader title={t('about.leadershipTitle')} subtitle={t('about.leadershipSubtitle')} />
          {isLoading ? <Spinner /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(members ?? []).map((m) => (
                <div key={m.id} className="flex gap-4 p-5 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <img src={m.image} alt={m.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  <div>
                    <div className="font-semibold text-neutral-900 text-sm">{m.name}</div>
                    <div className="text-xs text-[#0F4C81] font-semibold uppercase tracking-wide mb-1">{m.designation}</div>
                    <div className="text-xs text-neutral-500 leading-relaxed">{m.bio}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding bg-neutral-50">
        <div className="container-wide max-w-4xl">
          <SectionHeader title={t('about.timelineTitle')} subtitle={t('about.timelineSubtitle')} />
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-neutral-200 md:-translate-x-px" />
            <div className="space-y-8">
              {timeline.map((item, i) => (
                <div key={item.year} className={`relative flex gap-6 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`hidden md:block w-1/2 ${i % 2 === 0 ? 'pr-12 text-right' : 'pl-12'}`}>
                    <div className="text-2xl font-bold text-[#0F4C81]">{item.year}</div>
                  </div>
                  <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-[#0F4C81] border-2 border-white shadow-sm md:-translate-x-1.5 mt-1.5" />
                  <div className={`pl-12 md:pl-0 md:w-1/2 ${i % 2 === 0 ? 'md:pl-12' : 'md:pr-12'}`}>
                    <div className="md:hidden text-lg font-bold text-[#0F4C81] mb-1">{item.year}</div>
                    <p className="text-sm text-neutral-600 bg-white p-4 rounded-xl border border-neutral-100">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
