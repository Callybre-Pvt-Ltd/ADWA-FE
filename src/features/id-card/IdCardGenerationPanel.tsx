import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Printer, Download, Upload, IdCard } from 'lucide-react'
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
import { useAuth } from '@/context/AuthContext'
import { nameTranslations } from '@/utils/translations'

function cardLabel(card: DriverCard, isHi: boolean): string {
  const raw = card.fullNameSnapshot?.trim() || ''
  const name = isHi && raw && nameTranslations[raw] ? nameTranslations[raw] : raw
  if (name) return `${name} (${card.cardNumber})`
  return card.cardNumber
}

export function IdCardGenerationPanel() {
  const { t, i18n } = useTranslation('dashboard')
  const isHi = i18n.language === 'hi'
  const d = (key: string) => t(`dashboard.${key}`)
  const { user } = useAuth()
  const isDistrict = user?.role === 'district'

  const { data: cardRes, isLoading, isError, refetch } = useCards()
  const allCards = cardRes?.items ?? []

  // District portal: only print cards for admin-approved drivers (ACTIVE).
  const cards = useMemo(() => {
    if (!isDistrict) return allCards
    return allCards.filter((c) => c.status === 'ACTIVE')
  }, [allCards, isDistrict])

  const [selectedCardId, setSelectedCardId] = useState('')
  const selectedCard = cards.find((c) => c.id === selectedCardId) ?? cards[0]

  const { data: snapshot, isLoading: snapshotLoading } = useCardSnapshot(selectedCard?.id ?? null)
  const generate = useGenerateIdCard()
  const uploadPhoto = useUploadCardPhoto()
  const photoInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<IdCardFormValues | null>(null)
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  const actionsRef = useRef<{ print: () => void; downloadFront: () => void; downloadBack: () => void } | null>(null)
  const handleActionsReady = useCallback(
    (actions: { print: () => void; downloadFront: () => void; downloadBack: () => void }) => {
      actionsRef.current = actions
    },
    [],
  )

  useEffect(() => {
    if (snapshot) {
      setForm(snapshotToForm(snapshot))
    }
  }, [snapshot])

  useEffect(() => {
    if (cards.length === 0) {
      setSelectedCardId('')
      return
    }
    if (!selectedCardId || !cards.some((c) => c.id === selectedCardId)) {
      setSelectedCardId(cards[0].id)
    }
  }, [cards, selectedCardId])

  useEffect(() => {
    if (!selectedCard?.id) return
    let cancelled = false
    let objectUrl: string | null = null
    cardsService.getQrBlob(selectedCard.id)
      .then((blob) => {
        const url = URL.createObjectURL(blob)
        if (cancelled) {
          URL.revokeObjectURL(url)
          return
        }
        objectUrl = url
        setQrUrl(url)
      })
      .catch(() => {
        if (!cancelled) setQrUrl(null)
      })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [selectedCard?.id])

  // Load the real snapshotted passport photo via authenticated API (not the
  // sample portrait baked into the template artwork).
  useEffect(() => {
    let cancelled = false
    let objectUrl: string | null = null

    if (!selectedCard?.id || !snapshot?.hasPhoto) {
      setPhotoUrl(null)
      return () => { cancelled = true }
    }

    cardsService.getPhotoBlob(selectedCard.id)
      .then((blob) => {
        const url = URL.createObjectURL(blob)
        if (cancelled) {
          URL.revokeObjectURL(url)
          return
        }
        objectUrl = url
        setPhotoUrl(url)
      })
      .catch(() => {
        if (!cancelled) setPhotoUrl(null)
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [selectedCard?.id, snapshot?.hasPhoto, snapshot?.photoUrl])

  const onFieldChange = (field: keyof IdCardFormValues, value: string) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const handleGenerate = () => {
    if (isDistrict || generate.isPending || !selectedCard || !form) return
    generate.mutate(
      { cardId: selectedCard.id, payload: formToPayload(form) },
      { onSuccess: () => { toast.success(d('idCard.idGenerated')); void refetch() } },
    )
  }

  if (isLoading) return <SkeletonCard />
  if (isError) return <ErrorState onRetry={() => refetch()} />
  if (!cards.length) {
    return (
      <EmptyState
        icon={IdCard}
        title={d('idCard.noCardsTitle')}
        description={
          isDistrict
            ? d('idCard.noApprovedCardsDesc')
            : d('idCard.noCardsDesc')
        }
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
          {cards.map((c: DriverCard) => (
            <SelectItem key={c.id} value={c.id}>
              {cardLabel(c, isHi)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <IDCardOverlay
        values={form ?? emptyForm}
        card={selectedCard}
        photoUrl={photoUrl}
        qrUrl={qrUrl}
        loading={snapshotLoading}
        onActionsReady={handleActionsReady}
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          className="flex-1 gap-2 cursor-pointer w-full"
          onClick={() => actionsRef.current?.print()}
          loading={snapshotLoading}
          loadingText={d('idCard.generating')}
        >
          <Printer size={15} /> {d('idCard.printCard')}
        </Button>
        <Button
          variant="outline"
          className="flex-1 gap-2 cursor-pointer w-full"
          onClick={() => actionsRef.current?.downloadFront()}
          loading={snapshotLoading}
          loadingText={d('idCard.generating')}
        >
          <Download size={15} /> {d('idCard.downloadPng')}
        </Button>
      </div>

      {/* Admin only: edit fields, photo upload, generate PDF */}
      {!isDistrict && (
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
                    disabled={uploadPhoto.isPending}
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
                    loading={uploadPhoto.isPending}
                    loadingText="Uploading…"
                  >
                    <Upload size={14} />
                    Upload
                  </Button>
                </div>
              </div>
            </div>
          )}
          <Button
            className="w-full cursor-pointer"
            onClick={handleGenerate}
            loading={generate.isPending}
            loadingText={d('idCard.generating')}
            disabled={!form || !snapshot?.hasPhoto}
          >
            {d('idCard.generatePdf')}
          </Button>
        </div>
      )}
    </div>
  )
}
