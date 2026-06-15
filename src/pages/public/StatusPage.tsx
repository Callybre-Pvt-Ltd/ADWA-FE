import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { Search, CheckCircle, Circle } from 'lucide-react'
import { PageHero } from '@/components/shared/PageHero'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

type TrackForm = { refNumber: string; dateOfBirth: string }

const MOCK_STEPS = ['submitted', 'verification', 'approved', 'printed', 'dispatched'] as const

export default function StatusPage() {
  const { t } = useTranslation('pages')
  const [result, setResult] = useState<{ ref: string; step: number } | null>(null)
  const { register, handleSubmit } = useForm<TrackForm>()

  return (
    <div className="bg-white">
      <PageHero title={t('track.title')} subtitle={t('track.subtitle')} />
      <section className="section-padding">
        <div className="container-wide max-w-2xl mx-auto">
          <form
            onSubmit={handleSubmit((data) => setResult({ ref: data.refNumber, step: 3 }))}
            className="surface-card p-6 space-y-4 mb-8"
          >
            <div>
              <Label htmlFor="refNumber">{t('track.refNumber')}</Label>
              <Input id="refNumber" {...register('refNumber')} placeholder={t('track.refPlaceholder')} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="dob">{t('track.dob')}</Label>
              <Input id="dob" type="date" {...register('dateOfBirth')} className="mt-1" />
            </div>
            <Button type="submit" className="w-full">
              <Search className="h-4 w-4 mr-1" /> {t('track.searchBtn')}
            </Button>
          </form>

          {result && (
            <div className="surface-card p-6">
              <p className="text-sm text-neutral-500">{t('track.applicant')}: <span className="font-semibold text-neutral-900">{result.ref}</span></p>
              <h3 className="mt-4 font-bold text-neutral-900">{t('track.timeline')}</h3>
              <ul className="mt-4 space-y-3">
                {MOCK_STEPS.map((step, i) => {
                  const done = i < result.step
                  return (
                    <li key={step} className="flex items-center gap-3">
                      {done ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-neutral-300 shrink-0" />
                      )}
                      <span className={done ? 'text-neutral-900 font-medium' : 'text-neutral-500'}>
                        {t(`track.steps.${step}`)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
