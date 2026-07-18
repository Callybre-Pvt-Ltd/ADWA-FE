import { CheckCircle, Clock, CreditCard } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatDate, formatCurrency } from '@/utils/formatters'
import { StatusBadge, statusToVariant } from '@/components/shared/StatusBadge'
import type { Payment } from '@/types/payment.types'
import { useTranslation } from 'react-i18next'
import { nameTranslations } from '@/utils/translations'

interface PaymentTimelineProps {
  payment: Payment
  className?: string
}

const statusMapEnToHi: Record<string, string> = {
  'pending': 'लंबित',
  'collected': 'एकत्रित',
  'waiting_confirmation': 'पुष्टि की प्रतीक्षा',
  'confirmed': 'पुष्टीकृत',
}

const stepLabels = {
  pending: { en: 'Payment Pending', hi: 'भुगतान लंबित' },
  collected: { en: 'Collected', hi: 'एकत्रित' },
  waiting_confirmation: { en: 'Awaiting Confirmation', hi: 'पुष्टि की प्रतीक्षा' },
  confirmed: { en: 'Confirmed', hi: 'पुष्टीकृत' },
}

const STEPS = [
  { key: 'pending', icon: Clock },
  { key: 'collected', icon: CreditCard },
  { key: 'waiting_confirmation', icon: Clock },
  { key: 'confirmed', icon: CheckCircle },
] as const

export default function PaymentTimeline({ payment, className }: PaymentTimelineProps) {
  const { i18n } = useTranslation()
  const isHi = i18n.language === 'hi'
  const currentIdx = STEPS.findIndex((s) => s.key === payment.status)

  const translateStatus = (s: string) => {
    if (!isHi) return s.replace('_', ' ')
    return statusMapEnToHi[s] || s.replace('_', ' ')
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-neutral-900">
            {isHi ? (nameTranslations[payment.driverName] || payment.driverName) : payment.driverName}
          </p>
          <p className="text-sm text-neutral-500">{payment.referenceNumber}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-neutral-900">{formatCurrency(payment.amount)}</p>
          <StatusBadge variant={statusToVariant(payment.status)} label={translateStatus(payment.status)} />
        </div>
      </div>
      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const done = i <= currentIdx
          const Icon = step.icon
          const label = isHi ? stepLabels[step.key].hi : stepLabels[step.key].en
          return (
            <div key={step.key} className="flex items-center gap-3">
              <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', done ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-400')}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className={cn('text-sm font-medium', done ? 'text-neutral-900' : 'text-neutral-400')}>{label}</p>
                {step.key === 'collected' && payment.collectedAt && done && (
                  <p className="text-xs text-neutral-500">{formatDate(payment.collectedAt)}</p>
                )}
                {step.key === 'confirmed' && payment.confirmedAt && done && (
                  <p className="text-xs text-neutral-500">{formatDate(payment.confirmedAt)}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
