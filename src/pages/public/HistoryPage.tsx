import { useTranslation } from 'react-i18next'
import { TimelineItem } from '@/components/shared/TimelineItem'
import { SectionHeading } from '@/components/shared/SectionHeading'

import { PageHero } from '@/components/shared/PageHero'

export default function HistoryPage() {
  const { t } = useTranslation('pages')
  const timeline = t('about.timeline', { returnObjects: true }) as { year: string; event: string }[]

  return (
    <div className="bg-white">
      <PageHero title={t('about.timelineTitle')} subtitle={t('about.timelineSubtitle')} />
      <section className="section-padding">
        <div className="container-wide max-w-2xl">
          <SectionHeading title="ADWA Timeline" subtitle="Key milestones since 2010" />
          {timeline.map((item, i) => (
            <TimelineItem
              key={item.year}
              title={`${item.year} — ${item.event.split('.')[0]}`}
              description={item.event}
              isLast={i === timeline.length - 1}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
