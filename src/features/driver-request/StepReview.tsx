import type { ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { User, MapPin, IdCard, FileCheck, Pencil } from 'lucide-react'
import { formatDate } from '@/utils/formatters'
import { usePublicDistricts } from '@/hooks/useDistricts'
import type { DriverRequestFormData } from '@/utils/validators'

interface ReviewSectionProps {
  icon: ReactNode
  title: string
  onEdit: () => void
  children: ReactNode
}

function ReviewSection({ icon, title, onEdit, children }: ReviewSectionProps) {
  const { t } = useTranslation('pages')
  return (
    <div className="rounded-2xl border border-neutral-200 overflow-hidden">
      <div className="flex items-center justify-between bg-neutral-50 px-5 py-3 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <span className="text-blue-700">{icon}</span>
          <p className="text-sm font-bold text-neutral-900">{title}</p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50"
        >
          <Pencil size={14} /> {t('common:buttons.edit', 'Edit')}
        </button>
      </div>
      <dl className="divide-y divide-neutral-100">{children}</dl>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 px-5 py-3">
      <dt className="text-sm text-neutral-500 shrink-0">{label}</dt>
      <dd className="text-sm font-semibold text-neutral-900 sm:text-right break-words">{value || '—'}</dd>
    </div>
  )
}

function DocumentRow({ label, uploaded }: { label: string; uploaded: boolean }) {
  const { t } = useTranslation('pages')
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <span className="text-sm text-neutral-600">{label}</span>
      {uploaded ? (
        <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
          <span>✓</span> {t('apply.docs.uploaded')}
        </span>
      ) : (
        <span className="text-sm text-neutral-400">—</span>
      )}
    </div>
  )
}

interface StepReviewProps {
  goToStep: (step: number) => void
  declared: boolean
  setDeclared: (v: boolean) => void
}

export default function StepReview({ goToStep, declared, setDeclared }: StepReviewProps) {
  const { getValues } = useFormContext<DriverRequestFormData>()
  const { t } = useTranslation('pages')
  const f = (key: string, fallback?: string) => t(`apply.fields.${key}`, fallback ?? key)
  const data = getValues()
  const { data: districts } = usePublicDistricts()
  const districtName = districts?.find(d => d.id === data.districtId)?.name ?? '—'

  const genderLabel = data.gender
    ? t(`apply.fields.gender${data.gender.charAt(0)}${data.gender.slice(1).toLowerCase()}`, data.gender)
    : '—'

  return (
    <div className="space-y-5">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ReviewSection icon={<User size={18} />} title={t('apply.personalDetails')} onEdit={() => goToStep(0)}>
          <ReviewRow label={f('fullName')} value={data.name} />
          <ReviewRow label={f('fatherName')} value={data.fatherName} />
          <ReviewRow label={f('motherName')} value={data.motherName} />
          <ReviewRow label={f('gender')} value={genderLabel} />
          <ReviewRow label={f('mobile')} value={data.mobile} />
          <ReviewRow label={f('alternateMobile')} value={data.altMobile || '—'} />
          <ReviewRow label={f('email')} value={data.email || '—'} />
          <ReviewRow label={f('dateOfBirth')} value={data.dateOfBirth ? formatDate(data.dateOfBirth) : '—'} />
        </ReviewSection>

        <ReviewSection icon={<MapPin size={18} />} title={t('apply.addressDetails')} onEdit={() => goToStep(0)}>
          <ReviewRow label={f('district')} value={districtName} />
          <ReviewRow label={f('village')} value={data.village} />
          <ReviewRow label={f('thana')} value={data.tehsil} />
          <ReviewRow label={f('state')} value={data.state} />
          <ReviewRow label={f('pincode')} value={data.pincode} />
          <ReviewRow label={f('fullAddress')} value={data.address} />
        </ReviewSection>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ReviewSection icon={<IdCard size={18} />} title={t('apply.professionalDetails')} onEdit={() => goToStep(1)}>
          <ReviewRow label={f('bloodGroup')} value={data.bloodGroup} />
          <ReviewRow label={f('aadhaar')} value={data.aadharNumber ? `••••••••${data.aadharNumber.slice(-4)}` : '—'} />
          <ReviewRow label={f('license')} value={data.licenseNumber} />
          <ReviewRow label={f('licenseIssueDate', 'License Issue Date')} value={data.licenseIssueDate ? formatDate(data.licenseIssueDate) : '—'} />
          <ReviewRow label={f('licenseExpiry')} value={data.licenseExpiryDate ? formatDate(data.licenseExpiryDate) : '—'} />
          <ReviewRow label={f('vehicleType')} value={data.vehicleType} />
          <ReviewRow label={f('vehicleNumber', 'Vehicle Number')} value={data.vehicleNumber} />
          <ReviewRow label={f('experience')} value={`${data.experienceYears} years`} />
        </ReviewSection>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={declared}
            onChange={e => setDeclared(e.target.checked)}
            className="mt-1 h-5 w-5 rounded border-2 border-amber-400 accent-blue-600 shrink-0"
          />
          <span className="text-sm text-amber-900 leading-relaxed">
            {t('apply.declaration')}
          </span>
        </label>
      </div>

      {!declared && (
        <p className="text-sm text-amber-700 flex items-center gap-1">
          <span>⚠</span> {t('apply.declarationWarning')}
        </p>
      )}

    </div>
  )
}
