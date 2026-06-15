import { useState } from 'react'
import { usePayments } from '@/hooks/usePayments'
import { PageHeader } from '@/components/shared/PageHeader'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PaymentTimeline from '@/features/payments/PaymentTimeline'
import type { PaymentStatus } from '@/types/payment.types'
import { CreditCard } from 'lucide-react'

const TABS: { value: PaymentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'collected', label: 'Collected' },
  { value: 'waiting_confirmation', label: 'Waiting' },
  { value: 'confirmed', label: 'Confirmed' },
]

export default function PaymentsPage() {
  const [tab, setTab] = useState<PaymentStatus | 'all'>('all')
  const { data, isLoading, isError, refetch } = usePayments({ status: tab })

  return (
    <div className="p-6">
      <PageHeader title="Payments" subtitle="Track payment collection and confirmation" />
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          {TABS.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
        </TabsList>
        <TabsContent value={tab} className="mt-6">
          {isLoading && <SkeletonCard />}
          {isError && <ErrorState onRetry={() => refetch()} />}
          {!isLoading && !isError && !data?.length && <EmptyState icon={CreditCard} title="No payments found" />}
          <div className="grid gap-4 md:grid-cols-2">
            {data?.map((p) => (
              <div key={p.id} className="rounded-lg border border-neutral-200 bg-white p-4">
                <PaymentTimeline payment={p} />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
