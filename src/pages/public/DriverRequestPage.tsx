import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'
import { PageHero } from '@/components/shared/PageHero'
import MultiStepForm from '@/features/driver-request/MultiStepForm'
import { RulesRegulationsPanel } from '@/features/driver-request/RulesRegulationsPanel'

export default function DriverRequestPage() {
  const { t } = useTranslation('pages')

  return (
    <div className="hero-gradient min-h-screen">
      <PageHero title={t('apply.title')} subtitle={t('apply.subtitle')} />
      <section className="section-padding pt-8">
        <div className="container-wide max-w-6xl">
          <div className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-white border border-neutral-300 shadow-sm px-5 py-3 w-fit mx-auto">
            <FileText className="h-5 w-5 text-royal-700" />
            <span className="text-base font-semibold text-neutral-900">{t('apply.badge')}</span>
          </div>

          <MultiStepForm />

          <RulesRegulationsPanel />
        </div>
      </section>
    </div>
  )
}
