import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { CreditCard, Building2 } from 'lucide-react'
import { PageHero } from '@/components/shared/PageHero'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CONTACT_INFO } from '@/constants'

type PaymentForm = { refNumber: string; amount: string }

export default function PaymentPage() {
  const { t } = useTranslation('pages')
  const { register, handleSubmit } = useForm<PaymentForm>()

  return (
    <div className="bg-white">
      <PageHero title={t('payment.title')} subtitle={t('payment.subtitle')} />
      <section className="section-padding">
        <div className="container-wide max-w-5xl grid gap-8 lg:grid-cols-2">
          <div className="surface-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="h-6 w-6 text-royal-700" />
              <h2 className="text-lg font-bold text-neutral-900">{t('payment.onlineTitle')}</h2>
            </div>
            <form onSubmit={handleSubmit(() => {})} className="space-y-4">
              <div>
                <Label htmlFor="refNumber">{t('payment.refNumber')}</Label>
                <Input id="refNumber" {...register('refNumber')} placeholder={t('payment.refPlaceholder')} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="amount">{t('payment.amount')}</Label>
                <Input id="amount" {...register('amount')} placeholder="₹250" className="mt-1" />
              </div>
              <Button type="submit" className="w-full">{t('payment.payNow')}</Button>
            </form>
          </div>
          <div className="surface-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="h-6 w-6 text-orange-500" />
              <h2 className="text-lg font-bold text-neutral-900">{t('payment.offlineTitle')}</h2>
            </div>
            <p className="text-sm text-neutral-600">{t('payment.offlineDesc')}</p>
            <ul className="mt-4 space-y-2 text-sm text-neutral-700">
              <li>{CONTACT_INFO.phone}</li>
              <li>{CONTACT_INFO.email}</li>
              <li>{CONTACT_INFO.address}</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
