import { useTranslation } from 'react-i18next'
import { PageHero } from '@/components/shared/PageHero'
import MultiStepForm from '@/features/driver-request/MultiStepForm'
import { RulesRegulationsPanel } from '@/features/driver-request/RulesRegulationsPanel'

export default function DriverRequestPage() {
  const { t } = useTranslation('pages')

  return (
    <div className="hero-gradient min-h-screen">
      <PageHero title={t('apply.title')} subtitle={t('apply.subtitle')} />
      <section className="section-padding pt-8">
        <div className="container-wide">
          <div className="max-w-5xl mx-auto space-y-8">
            <MultiStepForm />
            <RulesRegulationsPanel />
          </div>
        </div>
      </section>
    </div>
  )
}
