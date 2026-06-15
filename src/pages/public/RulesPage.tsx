import { useTranslation } from 'react-i18next'
import { PageHero } from '@/components/shared/PageHero'
import { AlertTriangle } from 'lucide-react'

export default function RulesPage() {
  const { t } = useTranslation('pages')
  const safety = t('rules.safety', { returnObjects: true }) as string[]
  const membership = t('rules.membership', { returnObjects: true }) as string[]

  return (
    <div className="bg-white">
      <PageHero title={t('rules.title')} subtitle={t('rules.subtitle')} />
      <section className="section-padding">
        <div className="container-wide max-w-3xl space-y-10">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex gap-3">
              <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600" />
              <div>
                <h2 className="font-bold text-neutral-900">{t('rules.safetyTitle')}</h2>
                <p className="mt-1 text-sm text-neutral-600">Mandatory safety rules for all ADWA members</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-neutral-900">{t('rules.safetyTitle')}</h2>
            <ol className="mt-4 list-decimal space-y-3 pl-5">
              {safety.map((rule, i) => (
                <li key={i} className="text-neutral-700">{rule}</li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl border border-royal-200 bg-royal-50 p-6">
            <h2 className="font-bold text-neutral-900">{t('rules.membershipTitle')}</h2>
            <ol className="mt-4 list-decimal space-y-3 pl-5">
              {membership.map((rule, i) => (
                <li key={i} className="text-neutral-700">{rule}</li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </div>
  )
}
