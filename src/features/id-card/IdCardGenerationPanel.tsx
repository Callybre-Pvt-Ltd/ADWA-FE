import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Printer, Download, Upload, IdCard, Pencil, X } from 'lucide-react'
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
import { plusOneYearIso, todayIso } from '@/utils/cardDates'
import { useCards, useGenerateIdCard, useCardSnapshot, useUploadCardPhoto, useDownloadCard } from '@/hooks/useCards'
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

  const { data: cardRes, isLoading, isError, refetch } = useCards({ status: 'ACTIVE', size: 100 })
  const allCards = cardRes?.items ?? []
  // API already scopes district users to their district.
  const cards = allCards

  const [selectedCardId, setSelectedCardId] = useState('')
  const selectedCard = cards.find((c) => c.id === selectedCardId) ?? cards[0]

  const { data: snapshot, isLoading: snapshotLoading } = useCardSnapshot(selectedCard?.id ?? null)
  const generate = useGenerateIdCard()
  const downloadCard = useDownloadCard()
  const uploadPhoto = useUploadCardPhoto()
  const photoInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<IdCardFormValues | null>(null)
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  // A replacement photo is staged locally (preview only) until Save — it must
  // NOT hit the server on file-select, or Cancel has nothing left to revert.
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null)
  const [editPhotoPreviewUrl, setEditPhotoPreviewUrl] = useState<string | null>(null)
  // Switching to a different driver's card mid-edit shouldn't carry the edit
  // gate (or a staged, unsaved photo) over — reset during render (not an
  // effect) when the selection changes.
  const [editingForCardId, setEditingForCardId] = useState(selectedCardId)
  if (selectedCardId !== editingForCardId) {
    setEditingForCardId(selectedCardId)
    setIsEditing(false)
    if (editPhotoPreviewUrl) URL.revokeObjectURL(editPhotoPreviewUrl)
    setEditPhotoFile(null)
    setEditPhotoPreviewUrl(null)
  }

  const actionsRef = useRef<{ print: () => void } | null>(null)
  const handleActionsReady = useCallback(
    (actions: { print: () => void }) => {
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
    setForm((prev) => {
      if (!prev) return prev
      const next = { ...prev, [field]: value }
      if (field === 'issueDate') next.expiryDate = plusOneYearIso(value)
      return next
    })
  }

  const handleGenerate = async () => {
    if (generate.isPending || uploadPhoto.isPending || !selectedCard || !form) return
    if (form.issueDate && form.expiryDate && form.expiryDate < form.issueDate) {
      toast.error(isHi ? 'समाप्ति तिथि जारी तिथि के बाद होनी चाहिए' : 'Expiry date must be on or after the issue date.')
      return
    }
    try {
      // Staged photo replacement only actually uploads now, on Save — not
      // when the file was picked — so Cancel can still fully revert it.
      if (editPhotoFile) {
        await uploadPhoto.mutateAsync({ cardId: selectedCard.id, file: editPhotoFile })
      }
      await generate.mutateAsync({ cardId: selectedCard.id, payload: formToPayload(form) })
      toast.success(d('idCard.idGenerated'))
      setIsEditing(false)
      if (editPhotoPreviewUrl) URL.revokeObjectURL(editPhotoPreviewUrl)
      setEditPhotoFile(null)
      setEditPhotoPreviewUrl(null)
      void refetch()
    } catch {
      /* mutation hooks already toast the error */
    }
  }

  const cancelEdit = () => {
    if (snapshot) setForm(snapshotToForm(snapshot))
    if (editPhotoPreviewUrl) URL.revokeObjectURL(editPhotoPreviewUrl)
    setEditPhotoFile(null)
    setEditPhotoPreviewUrl(null)
    setIsEditing(false)
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
    bloodGroup: '', dateOfBirth: '', issueDate: todayIso(), expiryDate: plusOneYearIso(todayIso()),
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
        photoUrl={editPhotoPreviewUrl || photoUrl}
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
          className="flex-1 gap-2 cursor-pointer w-full"
          onClick={() => {
            if (!selectedCard || downloadCard.isPending) return
            downloadCard.mutate(selectedCard.id)
          }}
          loading={downloadCard.isPending}
          loadingText={d('idCard.generating')}
          disabled={!selectedCard}
        >
          <Download size={15} /> {d('idCard.downloadPdf')}
        </Button>
      </div>

      {/* Edit fields, photo upload, save — admin and district */}
      <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900">{d('idCard.cardInfo')}</h3>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 cursor-pointer"
                onClick={() => setIsEditing(true)}
                disabled={!form}
              >
                <Pencil size={14} /> {d('idCard.edit')}
              </Button>
            )}
          </div>
          {snapshotLoading || !form ? (
            <SkeletonCard />
          ) : (
            <IdCardFormFields
              values={form}
              onChange={onFieldChange}
              disabled={!isEditing || generate.isPending}
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
          {!snapshotLoading && snapshot?.hasPhoto && isEditing && (
            <div className="space-y-2">
              <Label htmlFor="card-photo-replace" className="text-sm text-neutral-700">
                {d('idCard.changePhoto')}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="card-photo-replace"
                  type="file"
                  accept="image/*"
                  className="flex-1"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    if (!file.type.startsWith('image/')) {
                      toast.error(isHi ? 'कृपया एक छवि फ़ाइल चुनें' : 'Please choose an image file')
                      return
                    }
                    // Stage only — this must not upload until Save, or
                    // Cancel would have nothing left to revert.
                    if (editPhotoPreviewUrl) URL.revokeObjectURL(editPhotoPreviewUrl)
                    setEditPhotoFile(file)
                    setEditPhotoPreviewUrl(URL.createObjectURL(file))
                  }}
                />
              </div>
              {editPhotoFile && (
                <p className="text-xs text-neutral-500">
                  {isHi ? 'सहेजने पर लागू होगा।' : 'Applied when you Save.'}
                </p>
              )}
            </div>
          )}
          {isEditing && (
            <div className="flex gap-3">
              <Button
                className="flex-1 cursor-pointer"
                onClick={() => void handleGenerate()}
                loading={generate.isPending || uploadPhoto.isPending}
                loadingText={d('idCard.generating')}
                disabled={!form || !snapshot?.hasPhoto}
              >
                {d('idCard.save')}
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2 cursor-pointer"
                onClick={cancelEdit}
                disabled={generate.isPending || uploadPhoto.isPending}
              >
                <X size={15} /> {d('idCard.cancel')}
              </Button>
            </div>
          )}
        </div>
    </div>
  )
}
