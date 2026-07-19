import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Printer, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { IDCardOverlay } from '@/features/id-card/IDCardOverlay'
import { IdCardFormFields } from '@/features/id-card/IdCardFormFields'
import { formToPayload, snapshotToForm, type IdCardFormValues } from '@/features/id-card/idCardForm'
import { useCards, useGenerateIdCard, useCardSnapshot, useUploadCardPhoto } from '@/hooks/useCards'
import { cardsService, type DriverCard } from '@/services/api/cards.service'
import { IdCard } from 'lucide-react'
import { nameTranslations } from '@/utils/translations'

export function IdCardGenerationPanel() {
  const { t, i18n } = useTranslation('dashboard')
  const isHi = i18n.language === 'hi'
  const d = (key: string) => t(`dashboard.${key}`)
  const { data: cards, isLoading, isError, refetch } = useCards()
  const [selectedCardId, setSelectedCardId] = useState('')
  const selectedCard = cards?.find((c) => c.id === selectedCardId) ?? cards?.[0]

  const { data: snapshot, isLoading: snapshotLoading } = useCardSnapshot(selectedCard?.id ?? null)
  const generate = useGenerateIdCard()
  const uploadPhoto = useUploadCardPhoto()
  const photoInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<IdCardFormValues | null>(null)
  const [qrUrl, setQrUrl] = useState<string | null>(null)

  // Canvas action handles from IDCardOverlay
  const actionsRef = useRef<{ print: () => void; downloadFront: () => void; downloadBack: () => void } | null>(null)
  const handleActionsReady = useCallback(
    (actions: { print: () => void; downloadFront: () => void; downloadBack: () => void }) => {
      actionsRef.current = actions
    },
    [],
  )

  const [prevSnapshot, setPrevSnapshot] = useState<unknown>(null)
  const [prevCards, setPrevCards] = useState<DriverCard[] | undefined>(undefined)

  if (snapshot !== prevSnapshot) {
    setPrevSnapshot(snapshot)
    if (snapshot) {
      setForm(snapshotToForm(snapshot))
    }
  }

  if (cards !== prevCards) {
    setPrevCards(cards)
    if (cards?.length && !selectedCardId) {
      setSelectedCardId(cards[0].id)
    }
  }

  useEffect(() => {
    if (!selectedCard?.id) return
    let active = true
    cardsService.getQrBlob(selectedCard.id)
      .then((blob) => {
        if (!active) return
        const url = URL.createObjectURL(blob)
        setQrUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return url })
      })
      .catch(() => setQrUrl(null))
    return () => { active = false }
  }, [selectedCard?.id])

  useEffect(() => () => { if (qrUrl) URL.revokeObjectURL(qrUrl) }, [qrUrl])

  const onFieldChange = (field: keyof IdCardFormValues, value: string) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const handleGenerate = () => {
    if (!selectedCard || !form) return
    generate.mutate(
      { cardId: selectedCard.id, payload: formToPayload(form) },
      { onSuccess: () => { toast.success(d('idCard.idGenerated')); void refetch() } },
    )
  }

  if (isLoading) return <SkeletonCard />
  if (isError) return <ErrorState onRetry={() => refetch()} />
  if (!cards?.length) {
    return (
      <EmptyState
        icon={IdCard}
        title={d('idCard.noCardsTitle')}
        description={d('idCard.noCardsDesc')}
      />
    )
  }

  const emptyForm: IdCardFormValues = {
    fullName: '', fatherName: '', designation: '', mobileNumber: '',
    licenseNumber: '', policeStation: '', city: '', state: '',
    bloodGroup: '', dateOfBirth: '',
  }

  return (
    <div className="space-y-6">
      <Select value={selectedCard?.id} onValueChange={setSelectedCardId}>
        <SelectTrigger>
          <SelectValue placeholder={d('idCard.selectDriver')} />
        </SelectTrigger>
        <SelectContent>
          {cards.map((c: DriverCard) => {
            const rawName = form && c.id === selectedCard?.id && form.fullName
              ? form.fullName
              : c.cardNumber
            const displayName = isHi && nameTranslations[rawName] ? nameTranslations[rawName] : rawName

            return (
              <SelectItem key={c.id} value={c.id}>
                {displayName === c.cardNumber ? c.cardNumber : `${displayName} (${c.cardNumber})`}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      {/* ── Card preview ── */}
      <IDCardOverlay
        values={form ?? emptyForm}
        card={selectedCard}
        photoUrl={snapshot?.photoUrl}
        qrUrl={qrUrl}
        loading={snapshotLoading}
        onActionsReady={handleActionsReady}
      />

      {/* ── Print / Download (canvas-based, pixel-perfect) ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          className="flex-1 gap-2 cursor-pointer w-full"
          onClick={() => actionsRef.current?.print()}
        >
          <Printer size={15} /> {d('idCard.printCard')}
        </Button>
        <Button
          variant="outline"
          className="flex-1 gap-2 cursor-pointer w-full"
          onClick={() => actionsRef.current?.downloadFront()}
        >
          <Download size={15} /> {d('idCard.downloadPng')}
        </Button>
      </div>

      {/* ── Form + generate ── */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-neutral-900">{d('idCard.cardInfo')}</h3>
        {snapshotLoading || !form ? (
          <SkeletonCard />
        ) : (
          <IdCardFormFields
            values={form}
            onChange={onFieldChange}
            disabled={generate.isPending}
          />
        )}
        {!snapshotLoading && snapshot && !snapshot.hasPhoto && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="mb-2 text-sm font-medium text-amber-800">
              Driver photo is required to generate the ID card PDF.
            </p>
            <div className="space-y-2">
              <Label htmlFor="card-photo" className="text-sm text-amber-700">
                Upload driver photo <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="card-photo"
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="flex-1"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file && selectedCard) {
                      uploadPhoto.mutate({ cardId: selectedCard.id, file })
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploadPhoto.isPending}
                >
                  <Upload size={14} />
                  {uploadPhoto.isPending ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </div>
          </div>
        )}
        <Button
          className="w-full cursor-pointer"
          onClick={handleGenerate}
          disabled={!form || generate.isPending || !snapshot?.hasPhoto}
        >
          {generate.isPending ? d('idCard.generating') : d('idCard.generatePdf')}
        </Button>
      </div>
    </div>
  )
}
