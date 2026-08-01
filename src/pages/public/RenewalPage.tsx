import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FormProvider, useForm } from 'react-hook-form'
import { Search, CheckCircle } from 'lucide-react'
import { PageHero } from '@/components/shared/PageHero'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { DOBPicker } from '@/components/shared/DOBPicker'

type SearchForm = { membershipNumber: string; dateOfBirth: string }

export default function RenewalPage() {
  const { t } = useTranslation('pages')
  const [found, setFound] = useState(false)
  const form = useForm<SearchForm>()

  return (
    <FormProvider {...form}>
      <div className="bg-white">
        <PageHero title={t('renewal.title')} subtitle={t('renewal.subtitle')} />
        <section className="section-padding">
          <div className="container-wide max-w-lg mx-auto">
            {!found ? (
              <form
                onSubmit={form.handleSubmit(() => setFound(true))}
                className="surface-card p-6 space-y-4"
              >
                <h2 className="text-lg font-bold text-neutral-900">{t('renewal.searchTitle')}</h2>
                <p className="text-sm text-neutral-600">{t('renewal.searchSubtitle')}</p>
                <div>
                  <Label htmlFor="membershipNumber">{t('renewal.membershipNumber')}</Label>
                  <Input id="membershipNumber" {...form.register('membershipNumber')} placeholder={t('renewal.membershipPlaceholder')} className="mt-1" />
                </div>
                <div>
                  <Label className="mb-1 block">{t('renewal.dobLabel')}</Label>
                  <DOBPicker name="dateOfBirth" />
                </div>
                <Button type="submit" className="w-full">
                  <Search className="h-4 w-4 mr-1" /> {t('renewal.searchBtn')}
                </Button>
              </form>
            ) : (
              <div className="surface-card p-6 text-center">
                <CheckCircle className="mx-auto h-14 w-14 text-emerald-600" />
                <h2 className="mt-4 text-lg font-bold text-neutral-900">{t('renewal.successTitle')}</h2>
                <p className="mt-2 text-sm text-neutral-600">{t('renewal.paymentNote')}</p>
                <Button className="mt-6" variant="accent" onClick={() => setFound(false)}>
                  {t('renewal.startNew')}
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </FormProvider>
  )
}
