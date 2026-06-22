import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import IDCardPreview from '@/features/id-card/IDCardPreview'
import IDCardActions from '@/features/id-card/IDCardActions'
import { IdCardFormFields } from '@/features/id-card/IdCardFormFields'
import { formToPayload, snapshotToForm, type IdCardFormValues } from '@/features/id-card/idCardForm'
import { useCards, useGenerateIdCard, useCardSnapshot } from '@/hooks/useCards'
import { cardsService, type DriverCard } from '@/services/api/cards.service'
import { IdCard } from 'lucide-react'

export function IdCardGenerationPanel() {
  const { data: cards, isLoading, isError, refetch } = useCards()
  const [selectedCardId, setSelectedCardId] = useState('')
  const selectedCard = cards?.find((c) => c.id === selectedCardId) ?? cards?.[0]

  const { data: snapshot, isLoading: snapshotLoading } = useCardSnapshot(selectedCard?.id ?? null)
  const generate = useGenerateIdCard()

  const [form, setForm] = useState<IdCardFormValues | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  useEffect(() => {
    if (snapshot) setForm(snapshotToForm(snapshot))
  }, [snapshot])

  useEffect(() => {
    if (cards?.length && !selectedCardId) setSelectedCardId(cards[0].id)
  }, [cards, selectedCardId])

  const refreshPreview = useCallback(async (cardId: string, values: IdCardFormValues) => {
    setPreviewLoading(true)
    try {
      const blob = await cardsService.getPreviewBlob(cardId, formToPayload(values))
      const url = URL.createObjectURL(blob)
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return url
      })
    } catch {
      setPreviewUrl(null)
    } finally {
      setPreviewLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!selectedCard?.id || !form) return
    const timer = setTimeout(() => {
      void refreshPreview(selectedCard.id, form)
    }, 400)
    return () => clearTimeout(timer)
  }, [selectedCard?.id, form, refreshPreview])

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const onFieldChange = (field: keyof IdCardFormValues, value: string) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const handleGenerate = () => {
    if (!selectedCard || !form) return
    generate.mutate(
      { cardId: selectedCard.id, payload: formToPayload(form) },
      {
        onSuccess: () => {
          toast.success('ID card PDF generated')
          void refetch()
        },
      },
    )
  }

  const handleDownload = async () => {
    if (!selectedCard) return
    try {
      const name = form?.fullName?.replace(/\s+/g, '-') ?? selectedCard.cardNumber
      await cardsService.downloadPdf(selectedCard.id, `${name}-id-card.pdf`)
      toast.success('ID card downloaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Download failed — generate the card first')
    }
  }

  if (isLoading) return <SkeletonCard />
  if (isError) return <ErrorState onRetry={() => refetch()} />
  if (!cards?.length) {
    return (
      <EmptyState
        icon={IdCard}
        title="No cards ready"
        description="Approve driver applications first — each approved driver gets a card record."
      />
    )
  }

  return (
    <div className="space-y-6">
      <Select value={selectedCard?.id} onValueChange={setSelectedCardId}>
        <SelectTrigger>
          <SelectValue placeholder="Select driver card" />
        </SelectTrigger>
        <SelectContent>
          {cards.map((c: DriverCard) => (
            <SelectItem key={c.id} value={c.id}>
              {form && c.id === selectedCard?.id && form.fullName
                ? `${form.fullName} (${c.cardNumber})`
                : c.cardNumber}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-neutral-900">Card information</h3>
          {snapshotLoading || !form ? (
            <SkeletonCard />
          ) : (
            <IdCardFormFields
              values={form}
              onChange={onFieldChange}
              disabled={generate.isPending}
            />
          )}
          <Button
            className="w-full"
            onClick={handleGenerate}
            disabled={!form || generate.isPending}
          >
            {generate.isPending ? 'Generating…' : 'Generate ID Card'}
          </Button>
          <IDCardActions
            onPrint={() => window.print()}
            onDownload={handleDownload}
            loading={generate.isPending}
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-neutral-900 mb-3">Preview</h3>
          <IDCardPreview imageUrl={previewUrl} loading={previewLoading || snapshotLoading} />
          <p className="mt-2 text-xs text-neutral-500 text-center">
            Template artwork is unchanged — QR, photo, and text are placed on the card.
          </p>
        </div>
      </div>
    </div>
  )
}
