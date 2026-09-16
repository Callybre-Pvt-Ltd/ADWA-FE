import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { IdCard, Download, Printer, Pencil, Check, X, Trash2 } from 'lucide-react'
import {
  useDistrictInchargeCardList,
  useUpdateDistrictInchargeCard,
  useUploadDistrictInchargeCardPhoto,
  useDeleteDistrictInchargeCard,
} from '@/hooks/useDistrictInchargeCards'
import { useDistricts } from '@/hooks/useDistricts'
import { BLOOD_GROUPS } from '@/constants'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { AppModal } from '@/components/shared/AppModal'
import { StatusBadge, statusToVariant } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { API_BASE_URL } from '@/services/api/client'
import {
  DistrictInchargeCardOverlay,
  type DistrictInchargeCardActions,
} from './DistrictInchargeCardOverlay'
import { formatDate } from '@/utils/formatters'
import { normalizeVerifyUrl } from '@/utils/verifyUrl'
import { districtMapEnToHi } from '@/utils/translations'
import { plusOneYearIso, toDateInputValue } from '@/utils/cardDates'
import {
  districtInchargeCardsService,
  type DistrictInchargeCard,
} from '@/services/api/districtInchargeCards.service'

/** Public, unauthenticated — same endpoint the QR verify page uses. `version`
 * cache-busts the browser's <img> cache right after a photo replace, since
 * the URL is otherwise identical (keyed by verification code, not by photo). */
function cardPhotoUrl(verificationCode: string, version?: number): string {
  const base = `${API_BASE_URL}/verification/${verificationCode}/photo`
  return version ? `${base}?v=${version}` : base
}

type EditForm = {
  fullName: string
  designation: string
  bloodGroup: string
  mobileNumber: string
  aadhaarNumber: string
  licenseNumber: string
  issuedAt: string
  expiresAt: string
}

function ViewField({ label, value, span }: { label: string; value: ReactNode; span?: boolean }) {
  return (
    <div className={span ? 'col-span-2' : undefined}>
      <dt className="text-[11px] uppercase tracking-wide text-neutral-400">{label}</dt>
      <dd className="text-neutral-900">{value}</dd>
    </div>
  )
}

export function DistrictInchargeCardsList() {
  const { i18n } = useTranslation()
  const isHi = i18n.language === 'hi'
  const { data: districts = [] } = useDistricts()
  const [districtFilter, setDistrictFilter] = useState('all')
  const [stateFilter, setStateFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [viewCard, setViewCard] = useState<DistrictInchargeCard | null>(null)
  const viewActionsRef = useRef<DistrictInchargeCardActions | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<EditForm>({
    fullName: '',
    designation: '',
    bloodGroup: '',
    mobileNumber: '',
    aadhaarNumber: '',
    licenseNumber: '',
    issuedAt: '',
    expiresAt: '',
  })
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null)
  const [editPhotoPreviewUrl, setEditPhotoPreviewUrl] = useState<string | null>(null)
  const [photoVersions, setPhotoVersions] = useState<Record<string, number>>({})
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [modalPhotoUrl, setModalPhotoUrl] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [printing, setPrinting] = useState(false)
  const updateCard = useUpdateDistrictInchargeCard()
  const uploadCardPhoto = useUploadDistrictInchargeCardPhoto()
  const deleteCard = useDeleteDistrictInchargeCard()

  // Modal preview + print: fetch photo via authenticated API (canvas fetch on the
  // public /verification/.../photo URL fails cross-origin CORS even when <img> works).
  useEffect(() => {
    if (!viewCard) {
      setModalPhotoUrl(null)
      return
    }
    let objectUrl: string | null = null
    let cancelled = false
    districtInchargeCardsService
      .getPhotoBlob(viewCard.id)
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setModalPhotoUrl(objectUrl)
      })
      .catch(() => {
        if (!cancelled) setModalPhotoUrl(null)
      })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [viewCard?.id, photoVersions[viewCard?.id ?? '']])

  const { data, isLoading, isError, refetch } = useDistrictInchargeCardList({
    page,
    size: 10,
    search: search || undefined,
    districtId: districtFilter === 'all' ? undefined : districtFilter,
  })
  const cards = data?.items ?? []

  const stateOptions = useMemo(
    () => [...new Set(districts.map((d) => d.state).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [districts],
  )
  const sortedDistricts = useMemo(() => {
    const list = stateFilter === 'all'
      ? districts
      : districts.filter((d) => d.state === stateFilter)
    return [...list].sort((a, b) => a.name.localeCompare(b.name))
  }, [districts, stateFilter])

  const startEdit = (card: DistrictInchargeCard) => {
    const issuedAt = toDateInputValue(card.issuedAt)
    setEditForm({
      fullName: card.fullName,
      designation: card.designation || '',
      bloodGroup: card.bloodGroup || '',
      mobileNumber: card.mobileNumber || '',
      aadhaarNumber: card.aadhaarNumber || '',
      licenseNumber: card.licenseNumber || '',
      issuedAt,
      expiresAt: toDateInputValue(card.expiresAt) || (issuedAt ? plusOneYearIso(issuedAt) : ''),
    })
    setEditPhotoFile(null)
    setEditPhotoPreviewUrl(null)
    setIsEditing(true)
  }

  const cancelEdit = () => {
    if (editPhotoPreviewUrl) URL.revokeObjectURL(editPhotoPreviewUrl)
    setEditPhotoFile(null)
    setEditPhotoPreviewUrl(null)
    setIsEditing(false)
  }

  const onEditPhotoChange = (file: File | null) => {
    if (editPhotoPreviewUrl) URL.revokeObjectURL(editPhotoPreviewUrl)
    if (!file) {
      setEditPhotoFile(null)
      setEditPhotoPreviewUrl(null)
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error(isHi ? 'कृपया एक छवि फ़ाइल चुनें' : 'Please choose an image file')
      return
    }
    setEditPhotoFile(file)
    setEditPhotoPreviewUrl(URL.createObjectURL(file))
  }

  const saveEdit = async () => {
    if (!viewCard) return
    const fullName = editForm.fullName.trim()
    if (!fullName) {
      toast.error(isHi ? 'नाम आवश्यक है' : 'Name is required')
      return
    }
    if (editForm.issuedAt && editForm.expiresAt && editForm.expiresAt < editForm.issuedAt) {
      toast.error(isHi ? 'समाप्ति तिथि जारी तिथि के बाद होनी चाहिए' : 'Expiry date must be on or after the issue date.')
      return
    }
    try {
      const updated = await updateCard.mutateAsync({
        id: viewCard.id,
        data: {
          fullName,
          designation: editForm.designation.trim(),
          bloodGroup: editForm.bloodGroup || undefined,
          mobileNumber: editForm.mobileNumber.trim() || undefined,
          aadhaarNumber: editForm.aadhaarNumber.trim() || undefined,
          licenseNumber: editForm.licenseNumber.trim() || undefined,
          issuedAt: editForm.issuedAt || undefined,
          expiresAt: editForm.expiresAt || undefined,
        },
      })
      if (editPhotoFile) {
        await uploadCardPhoto.mutateAsync({ id: viewCard.id, file: editPhotoFile })
        setPhotoVersions((prev) => ({ ...prev, [viewCard.id]: (prev[viewCard.id] ?? 0) + 1 }))
      }
      setViewCard(updated)
      cancelEdit()
    } catch {
      /* mutation hooks already toast the error */
    }
  }

  const handleDownload = async () => {
    if (!viewCard || downloading) return
    setDownloading(true)
    try {
      const slug = viewCard.fullName.trim().replace(/\s+/g, '-').slice(0, 40)
      await districtInchargeCardsService.downloadPdf(
        viewCard.id,
        `${viewCard.cardNumber}-${slug || 'card'}.pdf`,
      )
    } catch {
      toast.error(isHi ? 'PDF डाउनलोड विफल। कृपया फिर कोशिश करें।' : 'Download failed. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const handlePrint = async () => {
    if (!viewActionsRef.current || printing) return
    setPrinting(true)
    try {
      await viewActionsRef.current.print()
    } catch {
      toast.error(isHi ? 'प्रिंट विफल। कृपया फिर कोशिश करें।' : 'Print failed. Please try again.')
    } finally {
      setPrinting(false)
    }
  }

  const handleDelete = () => {
    if (!viewCard || deleteCard.isPending) return
    deleteCard.mutate(
      { id: viewCard.id },
      {
        onSuccess: () => {
          setDeleteOpen(false)
          setViewCard(null)
        },
      },
    )
  }

  const columns: ColumnDef<DistrictInchargeCard>[] = [
    {
      key: 'photo',
      header: isHi ? 'फ़ोटो' : 'Photo',
      cell: (r) => (
        <div className="h-10 w-10 overflow-hidden rounded-md border border-neutral-200 bg-neutral-50">
          <img
            src={cardPhotoUrl(r.verificationCode, photoVersions[r.id])}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      ),
    },
    { key: 'cardNumber', header: isHi ? 'कार्ड नंबर' : 'Card no.', cell: (r) => r.cardNumber, sortable: true, sortValue: (r) => r.cardNumber },
    { key: 'name', header: isHi ? 'नाम' : 'Name', cell: (r) => r.fullName, sortable: true, sortValue: (r) => r.fullName },
    { key: 'designation', header: isHi ? 'पदाधिकारी' : 'Designation', cell: (r) => r.designation || '—' },
    {
      key: 'district',
      header: isHi ? 'जिला' : 'District',
      cell: (r) => (isHi ? districtMapEnToHi[r.districtNameSnapshot] || r.districtNameSnapshot : r.districtNameSnapshot),
    },
    { key: 'issued', header: isHi ? 'जारी तिथि' : 'Issued', cell: (r) => (r.issuedAt ? formatDate(r.issuedAt) : '—') },
    { key: 'expires', header: isHi ? 'समाप्ति तिथि' : 'Expires', cell: (r) => (r.expiresAt ? formatDate(r.expiresAt) : '—') },
    {
      key: 'status',
      header: isHi ? 'स्थिति' : 'Status',
      cell: (r) => <StatusBadge variant={statusToVariant(r.status)} label={r.status.replace(/_/g, ' ')} />,
    },
  ]

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <IdCard className="h-5 w-5 text-blue-700" />
          <h2 className="text-sm font-bold text-neutral-900">
            {isHi ? 'जारी किए गए कार्ड' : 'Issued cards'}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={stateFilter}
            onValueChange={(v) => {
              setStateFilter(v)
              setDistrictFilter('all')
              setPage(1)
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder={isHi ? 'राज्य' : 'State'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isHi ? 'सभी राज्य' : 'All states'}</SelectItem>
              {stateOptions.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={districtFilter}
            onValueChange={(v) => {
              setDistrictFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder={isHi ? 'जिला चुनें' : 'Filter by district'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isHi ? 'सभी जिले' : 'All districts'}</SelectItem>
              {sortedDistricts.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {isHi ? districtMapEnToHi[d.name] || d.name : d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && !data ? (
        <SkeletonTable rows={5} />
      ) : isError ? (
        <ErrorState message={isHi ? 'कार्ड लोड करने में विफल।' : 'Failed to load cards.'} onRetry={refetch} />
      ) : (
        <DataTable
          data={cards}
          columns={columns}
          getRowKey={(r) => r.id}
          onRowClick={(r) => setViewCard(r)}
          searchable
          searchPlaceholder={isHi ? 'नाम या कार्ड नंबर खोजें' : 'Search name or card number'}
          emptyState={
            <EmptyState
              icon={IdCard}
              title={isHi ? 'कोई कार्ड नहीं मिला' : 'No cards found'}
              description={
                search || districtFilter !== 'all'
                  ? isHi
                    ? 'इस खोज/फ़िल्टर से कोई कार्ड मेल नहीं खाता। खोज साफ़ करें या बदलें।'
                    : 'No cards match this search or filter. Try clearing or changing it.'
                  : isHi
                    ? 'अभी तक इस जिले के लिए कोई कार्ड जारी नहीं किया गया है।'
                    : 'No district incharge cards have been issued yet.'
              }
            />
          }
          pagination={{
            page: data?.page ?? 1,
            pageSize: data?.size ?? 10,
            totalItems: data?.total ?? cards.length,
            totalPages: data?.pages ?? 1,
            onPageChange: setPage,
            searchValue: search,
            onSearchChange: (v) => {
              setSearch(v)
              setPage(1)
            },
          }}
        />
      )}

      <Dialog
        open={!!viewCard}
        onOpenChange={(open) => {
          if (!open) {
            setViewCard(null)
            cancelEdit()
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? (isHi ? 'कार्ड संपादित करें' : 'Edit card') : viewCard?.fullName}
            </DialogTitle>
          </DialogHeader>
          {viewCard && (
            <div className="space-y-4">
              <DistrictInchargeCardOverlay
                values={{
                  fullName: isEditing ? editForm.fullName : viewCard.fullName,
                  designation: isEditing ? editForm.designation : (viewCard.designation || ''),
                  bloodGroup: isEditing ? editForm.bloodGroup : (viewCard.bloodGroup || ''),
                  districtName: viewCard.districtNameSnapshot,
                  districtCode: viewCard.districtCodeSnapshot,
                  cardNumber: viewCard.cardNumber,
                  issueDate: isEditing ? editForm.issuedAt : toDateInputValue(viewCard.issuedAt),
                  expiryDate: isEditing ? editForm.expiresAt : toDateInputValue(viewCard.expiresAt),
                }}
                photoUrl={editPhotoPreviewUrl || modalPhotoUrl}
                verificationUrl={normalizeVerifyUrl('', viewCard.verificationCode)}
                onActionsReady={(actions) => {
                  viewActionsRef.current = actions
                }}
              />

              {!isEditing ? (
                <>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      className="flex-1 gap-2"
                      onClick={() => void handleDownload()}
                      loading={downloading}
                      loadingText={isHi ? 'डाउनलोड हो रहा है…' : 'Downloading…'}
                    >
                      <Download className="h-4 w-4" />
                      {isHi ? 'PDF डाउनलोड' : 'Download PDF'}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => void handlePrint()}
                      loading={printing}
                      loadingText={isHi ? 'तैयार हो रहा है…' : 'Preparing…'}
                    >
                      <Printer className="h-4 w-4" />
                      {isHi ? 'प्रिंट करें' : 'Print'}
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2" onClick={() => startEdit(viewCard)}>
                      <Pencil className="h-4 w-4" />
                      {isHi ? 'संपादित करें' : 'Edit'}
                    </Button>
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full gap-2"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    {isHi ? 'कार्ड हटाएं' : 'Delete Card'}
                  </Button>

                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2 text-sm">
                    <ViewField
                      label={isHi ? 'स्थिति' : 'Status'}
                      value={<StatusBadge variant={statusToVariant(viewCard.status)} label={viewCard.status.replace(/_/g, ' ')} />}
                    />
                    <ViewField
                      label={isHi ? 'सत्यापन कोड' : 'Verification code'}
                      value={<span className="break-all font-mono text-xs">{viewCard.verificationCode}</span>}
                    />
                    <ViewField
                      label={isHi ? 'रक्त समूह' : 'Blood group'}
                      value={viewCard.bloodGroup || '—'}
                    />
                    <ViewField
                      label={isHi ? 'मोबाइल नंबर' : 'Mobile number'}
                      value={viewCard.mobileNumber || '—'}
                    />
                    <ViewField
                      label={isHi ? 'आधार नंबर' : 'Aadhaar number'}
                      value={viewCard.aadhaarNumber || '—'}
                    />
                    <ViewField
                      label={isHi ? 'ड्राइविंग लाइसेंस' : 'Driving license'}
                      value={viewCard.licenseNumber || '—'}
                    />
                  </dl>
                </>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="edit-name">{isHi ? 'नाम' : 'Name'}</Label>
                    <Input
                      id="edit-name"
                      className="mt-1"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, fullName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-role">{isHi ? 'पदाधिकारी (भूमिका)' : 'Padadhikari (role)'}</Label>
                    <Input
                      id="edit-role"
                      className="mt-1"
                      value={editForm.designation}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, designation: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-blood-group">{isHi ? 'रक्त समूह' : 'Blood group'}</Label>
                    <Select
                      value={editForm.bloodGroup}
                      onValueChange={(v) => setEditForm((prev) => ({ ...prev, bloodGroup: v }))}
                    >
                      <SelectTrigger id="edit-blood-group" className="mt-1">
                        <SelectValue placeholder={isHi ? 'रक्त समूह चुनें' : 'Select blood group'} />
                      </SelectTrigger>
                      <SelectContent>
                        {BLOOD_GROUPS.map((bg) => (
                          <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-mobile">{isHi ? 'मोबाइल नंबर' : 'Mobile number'}</Label>
                    <Input
                      id="edit-mobile"
                      className="mt-1"
                      inputMode="tel"
                      value={editForm.mobileNumber}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, mobileNumber: e.target.value }))}
                      placeholder={isHi ? '10 अंकों का मोबाइल' : '10-digit mobile'}
                    />
                    <p className="mt-1 text-xs text-neutral-500">
                      {isHi ? 'कार्ड पर नहीं छपेगा — केवल रिकॉर्ड के लिए।' : 'Not printed on the card — record only.'}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="edit-aadhaar">{isHi ? 'आधार नंबर' : 'Aadhaar number'}</Label>
                    <Input
                      id="edit-aadhaar"
                      className="mt-1"
                      inputMode="numeric"
                      value={editForm.aadhaarNumber}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, aadhaarNumber: e.target.value }))}
                      placeholder="XXXX XXXX XXXX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-license">{isHi ? 'ड्राइविंग लाइसेंस' : 'Driving license number'}</Label>
                    <Input
                      id="edit-license"
                      className="mt-1 uppercase"
                      value={editForm.licenseNumber}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, licenseNumber: e.target.value.toUpperCase() }))}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="edit-issue">{isHi ? 'जारी तिथि' : 'Issue date'}</Label>
                      <Input
                        id="edit-issue"
                        type="date"
                        className="mt-1"
                        value={editForm.issuedAt}
                        onChange={(e) => {
                          const issuedAt = e.target.value
                          setEditForm((prev) => ({
                            ...prev,
                            issuedAt,
                            expiresAt: plusOneYearIso(issuedAt) || prev.expiresAt,
                          }))
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-expiry">{isHi ? 'समाप्ति तिथि' : 'Expiry date'}</Label>
                      <Input
                        id="edit-expiry"
                        type="date"
                        className="mt-1"
                        value={editForm.expiresAt}
                        min={editForm.issuedAt || undefined}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, expiresAt: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-photo">{isHi ? 'फ़ोटो बदलें' : 'Change photo'}</Label>
                    <Input
                      id="edit-photo"
                      type="file"
                      accept="image/*"
                      className="mt-1"
                      onChange={(e) => onEditPhotoChange(e.target.files?.[0] ?? null)}
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      className="flex-1 gap-2"
                      onClick={() => void saveEdit()}
                      loading={updateCard.isPending || uploadCardPhoto.isPending}
                      loadingText={isHi ? 'सहेजा जा रहा है…' : 'Saving…'}
                    >
                      <Check className="h-4 w-4" />
                      {isHi ? 'सहेजें' : 'Save'}
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2" onClick={cancelEdit}>
                      <X className="h-4 w-4" />
                      {isHi ? 'रद्द करें' : 'Cancel'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AppModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        loading={deleteCard.isPending}
        title={isHi ? 'कार्ड हटाएं' : 'Delete Card'}
        description={
          isHi
            ? `क्या आप वाकई ${viewCard?.fullName ?? ''} का कार्ड (${viewCard?.cardNumber ?? ''}) हटाना चाहते हैं? यह कार्ड नंबर उसी जिले में अगले जारी किए गए कार्ड को दिया जाएगा।`
            : `Delete the card for ${viewCard?.fullName ?? ''} (${viewCard?.cardNumber ?? ''})? This card number will be reused by the next card issued in this district.`
        }
        footer={
          <Button
            variant="destructive"
            className="w-full cursor-pointer"
            onClick={handleDelete}
            loading={deleteCard.isPending}
            loadingText={isHi ? 'हटाया जा रहा है…' : 'Deleting…'}
          >
            {isHi ? 'हटाने की पुष्टि करें' : 'Confirm Delete'}
          </Button>
        }
      >
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {isHi
            ? 'यह कार्रवाई पूर्ववत नहीं की जा सकती। इस कार्ड की जानकारी सूची से हट जाएगी।'
            : 'This cannot be undone. The card will no longer appear anywhere in the system.'}
        </p>
      </AppModal>
    </div>
  )
}
