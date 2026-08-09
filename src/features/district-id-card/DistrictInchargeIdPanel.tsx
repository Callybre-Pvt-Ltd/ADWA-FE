import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, Printer, Upload, IdCard } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDistricts } from '@/hooks/useDistricts'
import { DistrictInchargeCardOverlay, type DistrictInchargeCardActions } from './DistrictInchargeCardOverlay'
import {
  buildDistrictCardNumber,
  type DistrictInchargeCardForm,
} from './districtInchargeCardGeometry'
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
    districtName: '',
    districtCode: '',
    cardNumber: '',
    issueDate: todayIso(),
    expiryDate: plusOneYearIso(todayIso()),
  })
  const [districtId, setDistrictId] = useState<string>('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
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
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'issueDate' && typeof value === 'string') {
        next.expiryDate = plusOneYearIso(value)
      }
      return next
    })
  }

  const onDistrictChange = (id: string) => {
    setDistrictId(id)
    const d = districts.find((x) => x.id === id)
    if (!d) return
    const name = isHi ? (districtMapEnToHi[d.name] || d.name) : d.name
    const code = (d.code || '').toUpperCase()
    setForm((prev) => ({
      ...prev,
      districtName: name,
      districtCode: code,
      cardNumber: buildDistrictCardNumber(code),
    }))
  }

  const onPhotoChange = (file: File | null) => {
    if (photoUrl) URL.revokeObjectURL(photoUrl)
    if (!file) {
      setPhotoUrl(null)
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error(isHi ? 'कृपया एक छवि फ़ाइल चुनें' : 'Please choose an image file')
      return
    }
    setPhotoUrl(URL.createObjectURL(file))
  }

  const canExport = Boolean(form.fullName.trim() && photoUrl && form.districtCode && form.cardNumber)

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
          onActionsReady={handleActionsReady}
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            disabled={!canExport}
            onClick={() => actionsRef.current?.print()}
          >
            <Printer className="h-4 w-4" />
            {isHi ? 'प्रिंट करें' : 'Print'}
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            disabled={!canExport}
            onClick={() => actionsRef.current?.downloadPng()}
          >
            <Download className="h-4 w-4" />
            {isHi ? 'PNG डाउनलोड' : 'Download PNG'}
          </Button>
        </div>
        {!canExport && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {isHi
              ? 'जिला चुनें, नाम और फ़ोटो भरें — फिर प्रिंट / डाउनलोड करें।'
              : 'Select a district, then add name and photo to print or download.'}
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

        <div>
          <Label>{isHi ? 'जिला' : 'District'}</Label>
          <Select value={districtId} onValueChange={onDistrictChange} disabled={districtsLoading}>
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
            onChange={(e) => setField('fullName', e.target.value)}
            placeholder={isHi ? 'जैसे राम शर्मा' : 'e.g. Ram Sharma'}
          />
        </div>

        <div>
          <Label>{isHi ? 'कार्ड नंबर (स्वतः)' : 'Card number (auto)'}</Label>
          <div className="mt-1 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-sm text-neutral-800">
            {form.cardNumber || (isHi ? 'जिला चुनने पर बनेगा' : 'Generated when district is selected')}
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
              onChange={(e) => onPhotoChange(e.target.files?.[0] ?? null)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1 shrink-0"
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
