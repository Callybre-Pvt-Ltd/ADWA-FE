import { usePayments } from '@/hooks/usePayments'
import { PageHeader } from '@/components/shared/PageHeader'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import PaymentWorkflowCard from '@/features/payments/PaymentWorkflowCard'
import { CreditCard } from 'lucide-react'

export default function PaymentConfirmationsPage() {
  const { data, isLoading, isError, refetch } = usePayments({ status: 'collected' })

  return (
    <div className="p-6">
      <PageHeader title="Payment Confirmations" subtitle="Review and confirm district-collected payments" />
      {isLoading && <div className="grid gap-4 md:grid-cols-2">{[1,2,3].map((i) => <SkeletonCard key={i} />)}</div>}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && !data?.length && <EmptyState icon={CreditCard} title="No payments awaiting confirmation" />}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.map((p) => <PaymentWorkflowCard key={p.id} payment={p} />)}
      </div>
    </div>
  )
}
