import type { ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { User, MapPin, IdCard, FileCheck, Pencil } from 'lucide-react'
import { formatDate } from '@/utils/formatters'
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
        <span className="text-sm font-semibold text-red-500 flex items-center gap-1">
          <span>⚠</span> —
        </span>
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
  const f = (key: string) => t(`apply.fields.${key}`)
  const data = getValues()

  return (
    <div className="space-y-5">

      {/* Top row: Personal + Address side by side on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ReviewSection icon={<User size={18} />} title={t('apply.personalDetails')} onEdit={() => goToStep(0)}>
          <ReviewRow label={f('fullName')}    value={data.name} />
          <ReviewRow label={f('mobile')}      value={data.mobile} />
          <ReviewRow label={f('email')}       value={data.email || '—'} />
          <ReviewRow label={f('dateOfBirth')} value={data.dateOfBirth ? formatDate(data.dateOfBirth) : '—'} />
        </ReviewSection>

        <ReviewSection icon={<MapPin size={18} />} title={t('apply.addressDetails')} onEdit={() => goToStep(0)}>
          <ReviewRow label={f('district')}    value={data.district} />
          <ReviewRow label={f('thana')}       value={data.thana} />
          <ReviewRow label={f('fullAddress')} value={data.address} />
        </ReviewSection>
      </div>

      {/* Bottom row: Professional + Documents side by side on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ReviewSection icon={<IdCard size={18} />} title={t('apply.professionalDetails')} onEdit={() => goToStep(1)}>
          <ReviewRow label={f('bloodGroup')}    value={data.bloodGroup} />
          <ReviewRow label={f('aadhaar')}       value={data.aadharNumber ? `••••••••${data.aadharNumber.slice(-4)}` : '—'} />
          <ReviewRow label={f('license')}       value={data.licenseNumber} />
          <ReviewRow label={f('licenseType')}   value={data.licenseType} />
          <ReviewRow label={f('licenseExpiry')} value={data.licenseExpiryDate ? formatDate(data.licenseExpiryDate) : '—'} />
        </ReviewSection>

        <ReviewSection icon={<FileCheck size={18} />} title={t('apply.documentUpload')} onEdit={() => goToStep(2)}>
          <DocumentRow label={t('apply.docs.photo')}        uploaded={Boolean(data.passportPhoto)} />
          <DocumentRow label={t('apply.docs.aadhaarFront')} uploaded={Boolean(data.aadharCopy)} />
          <DocumentRow label={t('apply.docs.licenseFront')} uploaded={Boolean(data.licenseCopy)} />
        </ReviewSection>
      </div>

      {/* Declaration */}
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
