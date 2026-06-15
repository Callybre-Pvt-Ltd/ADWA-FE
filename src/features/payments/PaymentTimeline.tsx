import { CheckCircle, Clock, CreditCard } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatDate, formatCurrency } from '@/utils/formatters'
import { StatusBadge, statusToVariant } from '@/components/shared/StatusBadge'
import type { Payment } from '@/types/payment.types'

interface PaymentTimelineProps {
  payment: Payment
  className?: string
}

const STEPS = [
  { key: 'pending', label: 'Payment Pending', icon: Clock },
  { key: 'collected', label: 'Collected', icon: CreditCard },
  { key: 'waiting_confirmation', label: 'Awaiting Confirmation', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
] as const

export default function PaymentTimeline({ payment, className }: PaymentTimelineProps) {
  const currentIdx = STEPS.findIndex((s) => s.key === payment.status)

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-neutral-900">{payment.driverName}</p>
          <p className="text-sm text-neutral-500">{payment.referenceNumber}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-neutral-900">{formatCurrency(payment.amount)}</p>
          <StatusBadge variant={statusToVariant(payment.status)} label={payment.status.replace('_', ' ')} />
        </div>
      </div>
      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const done = i <= currentIdx
          const Icon = step.icon
          return (
            <div key={step.key} className="flex items-center gap-3">
              <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', done ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-400')}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className={cn('text-sm font-medium', done ? 'text-neutral-900' : 'text-neutral-400')}>{step.label}</p>
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
