import { useState } from 'react'
import { toast } from 'sonner'
import { useDrivers, useUpdateDriverStatus } from '@/hooks/useDrivers'
import { PageHeader } from '@/components/shared/PageHeader'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import IDCardPreview from '@/features/id-card/IDCardPreview'
import IDCardActions from '@/features/id-card/IDCardActions'
import { IdCard } from 'lucide-react'

export default function IDGenerationPage() {
  const { data, isLoading, isError, refetch } = useDrivers({ status: 'payment_confirmed' })
  const updateStatus = useUpdateDriverStatus()
  const [selectedId, setSelectedId] = useState<string>('')
  const selected = data?.find((d) => d.id === selectedId) ?? data?.[0]

  const generate = () => {
    if (!selected) return
    updateStatus.mutate({ id: selected.id, status: 'id_generated' }, {
      onSuccess: () => toast.success(`ID card generated for ${selected.name}`),
    })
  }

  return (
    <div className="p-6">
      <PageHeader title="ID Generation" subtitle="Generate ID cards for payment-confirmed drivers" />
      {isLoading && <SkeletonCard />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && !data?.length && <EmptyState icon={IdCard} title="No drivers ready" description="Drivers with confirmed payments will appear here." />}
      {data && data.length > 0 && (
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <Select value={selected?.id} onValueChange={setSelectedId}>
              <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
              <SelectContent>
                {data.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} — {d.district}</SelectItem>)}
              </SelectContent>
            </Select>
            {selected && (
              <div className="mt-6 space-y-4">
                <IDCardPreview driver={{ ...selected, cardId: selected.cardId ?? `ADWA-CARD-${selected.id.slice(-3).toUpperCase()}` }} />
                <Button onClick={generate} disabled={updateStatus.isPending} className="w-full">
                  {updateStatus.isPending ? 'Generating...' : 'Generate ID Card'}
                </Button>
                <IDCardActions onPrint={() => window.print()} onDownload={() => toast.success('Download started')} />
              </div>
            )}
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
            <h3 className="font-semibold text-neutral-900">Generation Queue</h3>
            <ul className="mt-4 space-y-2">
              {data.map((d) => (
                <li key={d.id} className="flex justify-between text-sm rounded-lg bg-white p-3">
                  <span>{d.name}</span>
                  <span className="text-neutral-500">{d.district}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
