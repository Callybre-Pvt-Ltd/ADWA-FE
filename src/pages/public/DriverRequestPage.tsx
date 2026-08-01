import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHero } from '@/components/shared/PageHero'
import MultiStepForm from '@/features/driver-request/MultiStepForm'
import { RulesRegulationsPanel } from '@/features/driver-request/RulesRegulationsPanel'
import { apiClient } from '@/services/api/client'

export default function DriverRequestPage() {
  const { t } = useTranslation('pages')
  const healthCalled = useRef(false)

  useEffect(() => {
    if (healthCalled.current) return
    healthCalled.current = true

    apiClient.get('/health').catch(() => {
      // Silent error handler for health check request
    })
  }, [])

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
