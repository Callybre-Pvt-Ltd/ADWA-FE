import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, Printer, Upload, IdCard, Loader2, QrCode, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDistricts } from '@/hooks/useDistricts'
import { districtInchargeCardsService } from '@/services'
import { DistrictInchargeCardOverlay, type DistrictInchargeCardActions } from './DistrictInchargeCardOverlay'
import { type DistrictInchargeCardForm } from './districtInchargeCardGeometry'
import { districtMapEnToHi } from '@/utils/translations'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function plusOneYearIso(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().slice(0, 10)
}

export function DistrictInchargeIdPanel() {
  const { i18n } = useTranslation()
  const isHi = i18n.language === 'hi'
  const { data: districts = [], isLoading: districtsLoading } = useDistricts()

  const [form, setForm] = useState<DistrictInchargeCardForm>({
    fullName: '',
    designation: '',
    districtName: '',
    districtCode: '',
    cardNumber: '',
    issueDate: todayIso(),
    expiryDate: plusOneYearIso(todayIso()),
  })
  const [districtId, setDistrictId] = useState<string>('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null)
  const [issued, setIssued] = useState(false)
  const [issuing, setIssuing] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const actionsRef = useRef<DistrictInchargeCardActions | null>(null)

  const handleActionsReady = useCallback((actions: DistrictInchargeCardActions) => {
    actionsRef.current = actions
  }, [])

  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl)
    }
  }, [photoUrl])

  const setField = <K extends keyof DistrictInchargeCardForm>(key: K, value: DistrictInchargeCardForm[K]) => {
    if (issued) return
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'issueDate' && typeof value === 'string') {
        next.expiryDate = plusOneYearIso(value)
      }
      return next
    })
  }

  const onDistrictChange = (id: string) => {
    if (issued) return
    if (id === districtId) return
    setDistrictId(id)
    const d = districts.find((x) => x.id === id)
    if (!d) return
    const name = isHi ? (districtMapEnToHi[d.name] || d.name) : d.name
    const code = (d.code || '').toUpperCase()
    setForm((prev) => ({
      ...prev,
      districtName: name,
      districtCode: code,
      // Number is assigned by the server only when the card is saved
      cardNumber: '',
    }))
  }

  const onPhotoChange = (file: File | null) => {
    if (issued) return
    if (photoUrl) URL.revokeObjectURL(photoUrl)
    if (!file) {
      setPhotoUrl(null)
      setPhotoFile(null)
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error(isHi ? 'कृपया एक छवि फ़ाइल चुनें' : 'Please choose an image file')
      return
    }
    setPhotoFile(file)
    setPhotoUrl(URL.createObjectURL(file))
  }

  const startNewCard = () => {
    setIssued(false)
    setVerificationUrl(null)
    setForm((prev) => ({
      ...prev,
      fullName: '',
      designation: '',
      cardNumber: '',
      issueDate: todayIso(),
      expiryDate: plusOneYearIso(todayIso()),
    }))
    if (photoUrl) URL.revokeObjectURL(photoUrl)
    setPhotoUrl(null)
    setPhotoFile(null)
    if (photoInputRef.current) photoInputRef.current.value = ''
  }

  const canIssue = Boolean(
    !issued &&
      districtId &&
      photoFile &&
      form.fullName.trim() &&
      form.districtCode,
  )
  const canExport = Boolean(issued && verificationUrl && form.cardNumber)

  const issueCard = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (issued && verificationUrl) return verificationUrl
      if (!canIssue || !photoFile || !districtId) return null

      setIssuing(true)
      try {
        const result = await districtInchargeCardsService.issue({
          districtId,
          fullName: form.fullName.trim(),
          designation: form.designation.trim() || undefined,
          issuedAt: form.issueDate || undefined,
          expiresAt: form.expiryDate || undefined,
          photo: photoFile,
        })
        setForm((prev) => ({ ...prev, cardNumber: result.card.cardNumber }))
        setVerificationUrl(result.verificationUrl)
        setIssued(true)
        if (!opts?.silent) {
          toast.success(
            isHi
              ? `कार्ड नंबर ${result.card.cardNumber} आवंटित — QR तैयार है।`
              : `Card number ${result.card.cardNumber} assigned — QR is ready.`,
          )
        }
        return result.verificationUrl
      } catch (err) {
        const msg = (err as { message?: string })?.message
        toast.error(
          msg ||
            (isHi
              ? 'कार्ड सहेजने में विफल। कृपया फिर कोशिश करें।'
              : 'Failed to save card. Please try again.'),
        )
        return null
      } finally {
        setIssuing(false)
      }
    },
    [issued, verificationUrl, canIssue, photoFile, districtId, form, isHi],
  )

  const ensureIssuedThen = async (action: () => void) => {
    const alreadyHadQr = Boolean(issued && verificationUrl)
    const url = alreadyHadQr ? verificationUrl : await issueCard({ silent: true })
    if (!url) return
    await new Promise((r) => setTimeout(r, alreadyHadQr ? 80 : 450))
    action()
  }

  const sortedDistricts = useMemo(
    () => [...districts].sort((a, b) => a.name.localeCompare(b.name)),
    [districts],
  )

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
      <div className="space-y-4 min-w-0">
        <DistrictInchargeCardOverlay
          values={form}
          photoUrl={photoUrl}
          verificationUrl={verificationUrl}
          onActionsReady={handleActionsReady}
        />
        <div className="flex flex-col sm:flex-row gap-3">
          {!issued ? (
            <Button
              className="flex-1 gap-2"
              disabled={!canIssue || issuing}
              onClick={() => void issueCard()}
            >
              {issuing ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
              {isHi ? 'सहेजें और नंबर आवंटित करें' : 'Save & assign number'}
            </Button>
          ) : (
            <Button variant="outline" className="flex-1 gap-2" onClick={startNewCard}>
              <RotateCcw className="h-4 w-4" />
              {isHi ? 'नया कार्ड' : 'New card'}
            </Button>
          )}
          <Button
            variant="outline"
            className="flex-1 gap-2"
            disabled={(!canIssue && !canExport) || issuing}
            onClick={() => void ensureIssuedThen(() => actionsRef.current?.print())}
          >
            <Printer className="h-4 w-4" />
            {isHi ? 'प्रिंट करें' : 'Print'}
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            disabled={(!canIssue && !canExport) || issuing}
            onClick={() => void ensureIssuedThen(() => actionsRef.current?.downloadPdf())}
          >
            <Download className="h-4 w-4" />
            {isHi ? 'PDF डाउनलोड' : 'Download PDF'}
          </Button>
        </div>
        {verificationUrl ? (
          <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 break-all">
            {isHi ? 'QR सत्यापन लिंक: ' : 'QR verify link: '}
            <a href={verificationUrl} target="_blank" rel="noreferrer" className="underline">
              {verificationUrl}
            </a>
          </p>
        ) : (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {isHi
              ? 'जिला, नाम और फ़ोटो भरें, फिर सहेजें — कार्ड नंबर तभी बनेगा (ड्राइवर कार्ड जैसा)।'
              : 'Fill district, name and photo, then save — the card number is assigned then (same as driver cards).'}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2">
          <IdCard className="h-5 w-5 text-blue-700" />
          <h2 className="text-sm font-bold text-neutral-900">
            {isHi ? 'जिला प्रभारी विवरण' : 'District incharge details'}
          </h2>
        </div>

        {issued && (
          <p className="text-xs text-blue-800 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            {isHi
              ? 'कार्ड सहेजा गया — नंबर और QR लॉक हैं। नया कार्ड बनाने के लिए “नया कार्ड” दबाएँ।'
              : 'Card saved — number and QR are locked. Use “New card” to issue another.'}
          </p>
        )}

        <div>
          <Label>{isHi ? 'जिला' : 'District'}</Label>
          <Select
            value={districtId}
            onValueChange={onDistrictChange}
            disabled={districtsLoading || issued}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder={isHi ? 'जिला चुनें' : 'Select district'} />
            </SelectTrigger>
            <SelectContent>
              {sortedDistricts.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {isHi ? (districtMapEnToHi[d.name] || d.name) : d.name}
                  {d.code ? ` (${d.code.toUpperCase()})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="di-name">{isHi ? 'नाम (कार्ड पर)' : 'Name (on card)'}</Label>
          <Input
            id="di-name"
            className="mt-1"
            value={form.fullName}
            disabled={issued}
            onChange={(e) => setField('fullName', e.target.value)}
            placeholder={isHi ? 'जैसे राम शर्मा' : 'e.g. Ram Sharma'}
          />
        </div>

        <div>
          <Label htmlFor="di-role">
            {isHi ? 'पदाधिकारी (भूमिका)' : 'Padadhikari (role)'}
          </Label>
          <Input
            id="di-role"
            className="mt-1"
            value={form.designation}
            disabled={issued}
            onChange={(e) => setField('designation', e.target.value)}
            placeholder={isHi ? 'जैसे जिला प्रभारी' : 'e.g. District Incharge'}
          />
          <p className="mt-1 text-xs text-neutral-500">
            {isHi
              ? 'कार्ड पर “पदाधिकारी :-” के दाईं ओर यह भूमिका दिखेगी।'
              : 'Shown on the card to the right of “पदाधिकारी :-”.'}
          </p>
        </div>

        <div>
          <Label>{isHi ? 'कार्ड नंबर' : 'Card number'}</Label>
          <div className="mt-1 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-sm text-neutral-800">
            {form.cardNumber ||
              (isHi ? 'सहेजने पर आवंटित होगा' : 'Assigned when you save')}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="di-issue">{isHi ? 'जारी तिथि' : 'Issue date'}</Label>
            <Input
              id="di-issue"
              type="date"
              className="mt-1"
              value={form.issueDate}
              disabled={issued}
              onChange={(e) => setField('issueDate', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="di-expiry">{isHi ? 'समाप्ति तिथि' : 'Expiry date'}</Label>
            <Input
              id="di-expiry"
              type="date"
              className="mt-1"
              value={form.expiryDate}
              disabled={issued}
              onChange={(e) => setField('expiryDate', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="di-photo">{isHi ? 'फ़ोटो' : 'Photo'}</Label>
          <div className="mt-1 flex gap-2">
            <Input
              id="di-photo"
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="flex-1"
              disabled={issued}
              onChange={(e) => onPhotoChange(e.target.files?.[0] ?? null)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1 shrink-0"
              disabled={issued}
              onClick={() => photoInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              {isHi ? 'अपलोड' : 'Upload'}
            </Button>
          </div>
          {photoUrl && (
            <img
              src={photoUrl}
              alt=""
              className="mt-3 h-24 w-20 rounded-lg object-cover border border-neutral-200"
            />
          )}
        </div>
      </div>
    </div>
  )
}
