import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePayments } from '@/hooks/usePayments'
import { PageHeader } from '@/components/shared/PageHeader'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PaymentTimeline from '@/features/payments/PaymentTimeline'
import type { PaymentStatus } from '@/types/payment.types'
import { CreditCard } from 'lucide-react'

export default function PaymentsPage() {
  const { i18n } = useTranslation()
  const isHi = i18n.language === 'hi'
  const [tab, setTab] = useState<PaymentStatus | 'all'>('all')
  const { data, isLoading, isError, refetch } = usePayments({ status: tab })

  const TABS: { value: PaymentStatus | 'all'; label: string }[] = [
    { value: 'all', label: isHi ? 'सभी' : 'All' },
    { value: 'pending', label: isHi ? 'लंबित' : 'Pending' },
    { value: 'collected', label: isHi ? 'एकत्रित' : 'Collected' },
    { value: 'waiting_confirmation', label: isHi ? 'पुष्टि की प्रतीक्षा' : 'Waiting' },
    { value: 'confirmed', label: isHi ? 'पुष्टीकृत' : 'Confirmed' },
  ]

  return (
    <div className="w-full space-y-6 pb-6 animate-fade-in">
      <PageHeader
        title={isHi ? 'भुगतान' : 'Payments'}
        subtitle={isHi ? 'भुगतान संग्रह और पुष्टिकरण को ट्रैक करें' : 'Track payment collection and confirmation'}
      />
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="cursor-pointer">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={tab} className="mt-6">
          {isLoading && (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}
          {isError && <ErrorState onRetry={() => refetch()} />}
          {!isLoading && !isError && !data?.length && (
            <EmptyState
              icon={CreditCard}
              title={isHi ? 'कोई भुगतान नहीं मिला' : 'No payments found'}
            />
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {data?.map((p) => (
              <div key={p.id} className="rounded-lg border border-neutral-200 bg-white p-4 shadow-card">
                <PaymentTimeline payment={p} />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
