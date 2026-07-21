import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { StatusBadge, statusToVariant } from '@/components/shared/StatusBadge'
import { useUpdatePayment } from '@/hooks/usePayments'
import type { Payment } from '@/types/payment.types'
import { cn } from '@/utils/cn'

interface PaymentWorkflowCardProps {
  payment: Payment
  className?: string
}

export default function PaymentWorkflowCard({ payment, className }: PaymentWorkflowCardProps) {
  const updatePayment = useUpdatePayment()

  const confirm = () => {
    if (!updatePayment.isPending) updatePayment.mutate({ id: payment.id, status: 'confirmed' })
  }

  return (
    <div className={cn('rounded-lg border border-neutral-200 bg-white p-4', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-neutral-900">{payment.driverName}</p>
          <p className="text-sm text-neutral-500">{payment.district} · {payment.referenceNumber}</p>
          <p className="mt-1 text-lg font-bold text-neutral-900">{formatCurrency(payment.amount)}</p>
        </div>
        <StatusBadge variant={statusToVariant(payment.status)} label={payment.status.replace('_', ' ')} dot />
      </div>
      {payment.collectedAt && (
        <p className="mt-3 text-sm text-neutral-600">
          Collected on {formatDate(payment.collectedAt)} by {payment.district ? `${payment.district} District Office` : 'District Office'}
        </p>
      )}
      {(payment.status === 'collected' || payment.status === 'waiting_confirmation') && (
        <Button
          className="mt-4 w-full sm:w-auto"
          onClick={confirm}
          loading={updatePayment.isPending}
          loadingText="Confirming…"
        >
          Confirm Payment
        </Button>
      )}
    </div>
  )
}
