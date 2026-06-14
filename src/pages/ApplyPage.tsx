import { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { CheckCircle, ArrowRight, ArrowLeft, Upload, Printer, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { applicationService } from '@/services'
import { Badge } from '@/components/common/Badge'
import { cn } from '@/lib/utils'
import {
  BLOOD_GROUPS, INDIAN_STATES, VEHICLE_TYPES, DRIVER_CATEGORIES,
  EMPLOYMENT_TYPES, EXPERIENCE_OPTIONS, ROUTES,
} from '@/constants'

const step1Schema = z.object({
  fullName: z.string().min(2),
  fatherName: z.string().min(2),
  dateOfBirth: z.string().min(1),
  gender: z.string().min(1),
  mobile: z.string().regex(/^[6-9]\d{9}$/),
  alternateMobile: z.string().optional(),
  email: z.string().email(),
  aadhaarNumber: z.string().regex(/^\d{12}$/),
  licenseNumber: z.string().min(5),
  bloodGroup: z.string().min(1),
})

const step2Schema = z.object({
  address: z.string().min(5),
  village: z.string().min(1),
  city: z.string().min(1),
  district: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().regex(/^\d{6}$/),
})

const step3Schema = z.object({
  vehicleType: z.string().min(1),
  experience: z.string().min(1),
  driverCategory: z.string().min(1),
  employmentType: z.string().min(1),
  rtoCode: z.string().min(2),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>
type Step3Data = z.infer<typeof step3Schema>
type FormData = Step1Data & Step2Data & Step3Data

function StepIndicator({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8 overflow-x-auto pb-2">
      {steps.map((label, i) => {
        const id = i + 1
        return (
          <div key={id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all',
                current > id
                  ? 'bg-[#16A34A] border-[#16A34A] text-white'
                  : current === id
                  ? 'bg-[#0F4C81] border-[#0F4C81] text-white'
                  : 'bg-white border-neutral-200 text-neutral-400',
              )}>
                {current > id ? <CheckCircle size={16} /> : id}
              </div>
              <div className={cn(
                'text-xs mt-1 font-medium hidden sm:block',
                current === id ? 'text-[#0F4C81]' : current > id ? 'text-[#16A34A]' : 'text-neutral-400',
              )}>
                {label}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                'h-0.5 w-12 md:w-20 mx-1 transition-all',
                current > id + 1 ? 'bg-[#16A34A]' : current > id ? 'bg-[#0F4C81]' : 'bg-neutral-200',
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function FormField({ label, error, required, children }: {
  label: string; error?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0F4C81] transition-all"
const selectClass = `${inputClass} bg-white`

function Step1({ onNext }: { onNext: (data: Step1Data) => void }) {
  const { t } = useTranslation('pages')
  const { register, handleSubmit, formState: { errors } } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
  })
  const f = (k: string) => t(`apply.fields.${k}`)
  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <FormField label={f('fullName')} error={errors.fullName?.message} required>
          <input {...register('fullName')} className={inputClass} placeholder={f('fullNamePlaceholder')} />
        </FormField>
        <FormField label={f('fatherName')} error={errors.fatherName?.message} required>
          <input {...register('fatherName')} className={inputClass} placeholder={f('fatherNamePlaceholder')} />
        </FormField>
        <FormField label={f('dateOfBirth')} error={errors.dateOfBirth?.message} required>
          <input {...register('dateOfBirth')} type="date" className={inputClass} />
        </FormField>
        <FormField label={f('gender')} error={errors.gender?.message} required>
          <select {...register('gender')} className={selectClass}>
            <option value="">{f('genderSelect')}</option>
            <option value="male">{f('genderMale')}</option>
            <option value="female">{f('genderFemale')}</option>
            <option value="other">{f('genderOther')}</option>
          </select>
        </FormField>
        <FormField label={f('mobile')} error={errors.mobile?.message} required>
          <input {...register('mobile')} className={inputClass} placeholder={f('mobilePlaceholder')} maxLength={10} />
        </FormField>
        <FormField label={f('alternateMobile')} error={errors.alternateMobile?.message}>
          <input {...register('alternateMobile')} className={inputClass} placeholder={f('alternateMobilePlaceholder')} maxLength={10} />
        </FormField>
        <FormField label={f('email')} error={errors.email?.message} required>
          <input {...register('email')} type="email" className={inputClass} placeholder={f('emailPlaceholder')} />
        </FormField>
        <FormField label={f('bloodGroup')} error={errors.bloodGroup?.message} required>
          <select {...register('bloodGroup')} className={selectClass}>
            <option value="">{f('bloodGroupSelect')}</option>
            {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
          </select>
        </FormField>
        <FormField label={f('aadhaar')} error={errors.aadhaarNumber?.message} required>
          <input {...register('aadhaarNumber')} className={inputClass} placeholder={f('aadhaarPlaceholder')} maxLength={12} />
        </FormField>
        <FormField label={f('license')} error={errors.licenseNumber?.message} required>
          <input {...register('licenseNumber')} className={inputClass} placeholder={f('licensePlaceholder')} />
        </FormField>
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-[#0F4C81] text-white rounded-xl font-semibold hover:bg-[#0d3d6b] transition-colors">
          {t('common:buttons.next')} <ArrowRight size={16} />
        </button>
      </div>
    </form>
  )
}

function Step2({ onNext, onBack }: { onNext: (data: Step2Data) => void; onBack: () => void }) {
  const { t } = useTranslation('pages')
  const { register, handleSubmit, formState: { errors } } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
  })
  const f = (k: string) => t(`apply.fields.${k}`)
  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <FormField label={f('fullAddress')} error={errors.address?.message} required>
            <textarea {...register('address')} rows={3} className={inputClass} placeholder={f('addressPlaceholder')} />
          </FormField>
        </div>
        <FormField label={f('village')} error={errors.village?.message} required>
          <input {...register('village')} className={inputClass} placeholder={f('villagePlaceholder')} />
        </FormField>
        <FormField label={f('city')} error={errors.city?.message} required>
          <input {...register('city')} className={inputClass} placeholder={f('cityPlaceholder')} />
        </FormField>
        <FormField label={f('district')} error={errors.district?.message} required>
          <input {...register('district')} className={inputClass} placeholder={f('districtPlaceholder')} />
        </FormField>
        <FormField label={f('state')} error={errors.state?.message} required>
          <select {...register('state')} className={selectClass}>
            <option value="">{f('stateSelect')}</option>
            {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormField>
        <FormField label={f('pincode')} error={errors.pincode?.message} required>
          <input {...register('pincode')} className={inputClass} placeholder={f('pincodePlaceholder')} maxLength={6} />
        </FormField>
      </div>
      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="flex items-center gap-2 px-5 py-3 border border-neutral-200 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-50 transition-colors">
          <ArrowLeft size={16} /> {t('common:buttons.back')}
        </button>
        <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-[#0F4C81] text-white rounded-xl font-semibold hover:bg-[#0d3d6b] transition-colors">
          {t('common:buttons.next')} <ArrowRight size={16} />
        </button>
      </div>
    </form>
  )
}

function Step3({ onNext, onBack }: { onNext: (data: Step3Data) => void; onBack: () => void }) {
  const { t } = useTranslation('pages')
  const { register, handleSubmit, formState: { errors } } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
  })
  const f = (k: string) => t(`apply.fields.${k}`)
  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <FormField label={f('vehicleType')} error={errors.vehicleType?.message} required>
          <select {...register('vehicleType')} className={selectClass}>
            <option value="">{f('vehicleTypeSelect')}</option>
            {VEHICLE_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </FormField>
        <FormField label={f('experience')} error={errors.experience?.message} required>
          <select {...register('experience')} className={selectClass}>
            <option value="">{f('experienceSelect')}</option>
            {EXPERIENCE_OPTIONS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </FormField>
        <FormField label={f('driverCategory')} error={errors.driverCategory?.message} required>
          <select {...register('driverCategory')} className={selectClass}>
            <option value="">{f('driverCategorySelect')}</option>
            {DRIVER_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>
        <FormField label={f('employmentType')} error={errors.employmentType?.message} required>
          <select {...register('employmentType')} className={selectClass}>
            <option value="">{f('employmentTypeSelect')}</option>
            {EMPLOYMENT_TYPES.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </FormField>
        <FormField label={f('rtoCode')} error={errors.rtoCode?.message} required>
          <input {...register('rtoCode')} className={inputClass} placeholder={f('rtoPlaceholder')} />
        </FormField>
      </div>
      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="flex items-center gap-2 px-5 py-3 border border-neutral-200 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-50 transition-colors">
          <ArrowLeft size={16} /> {t('common:buttons.back')}
        </button>
        <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-[#0F4C81] text-white rounded-xl font-semibold hover:bg-[#0d3d6b] transition-colors">
          {t('common:buttons.next')} <ArrowRight size={16} />
        </button>
      </div>
    </form>
  )
}

function MockUploadBox({ label, size }: { label: string; size: string }) {
  const { t } = useTranslation('pages')
  const [uploaded, setUploaded] = useState(false)
  return (
    <div>
      <div className="text-xs font-medium text-neutral-700 mb-1.5">
        {label} <span className="text-red-500">*</span>
      </div>
      <button
        type="button"
        onClick={() => setUploaded(!uploaded)}
        className={cn(
          'w-full border-2 border-dashed rounded-xl p-5 text-center hover:bg-blue-50/50 transition-all cursor-pointer',
          uploaded ? 'border-[#16A34A] bg-green-50/50' : 'border-neutral-200 hover:border-blue-300',
        )}
      >
        {uploaded ? (
          <div className="flex flex-col items-center gap-1">
            <CheckCircle size={24} className="text-[#16A34A]" />
            <span className="text-xs font-medium text-[#16A34A]">{t('apply.docs.uploaded')}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Upload size={22} className="text-neutral-400" />
            <span className="text-xs text-neutral-500">{t('apply.docs.clickUpload')}</span>
            <span className="text-xs text-neutral-400">{size}</span>
          </div>
        )}
      </button>
    </div>
  )
}

function Step4({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { t } = useTranslation('pages')
  const d = (k: string) => t(`apply.docs.${k}`)
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700">
        <strong>{t('common:misc.note')}</strong> {d('noteText')}
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <MockUploadBox label={d('photo')} size={d('photoSize')} />
        <MockUploadBox label={d('signature')} size={d('signatureSize')} />
        <MockUploadBox label={d('aadhaarFront')} size={d('docSize')} />
        <MockUploadBox label={d('aadhaarBack')} size={d('docSize')} />
        <MockUploadBox label={d('licenseFront')} size={d('docSize')} />
        <MockUploadBox label={d('licenseBack')} size={d('docSize')} />
      </div>
      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="flex items-center gap-2 px-5 py-3 border border-neutral-200 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-50 transition-colors">
          <ArrowLeft size={16} /> {t('common:buttons.back')}
        </button>
        <button type="button" onClick={onNext} className="flex items-center gap-2 px-6 py-3 bg-[#0F4C81] text-white rounded-xl font-semibold hover:bg-[#0d3d6b] transition-colors">
          {t('apply.reviewApplication')} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-neutral-50 last:border-0">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="text-sm font-medium text-neutral-900 text-right max-w-[60%]">{value || '—'}</span>
    </div>
  )
}

function Step5({ formData, onSubmit, onBack, isLoading }: {
  formData: Partial<FormData>
  onSubmit: () => void
  onBack: () => void
  isLoading: boolean
}) {
  const { t } = useTranslation('pages')
  const r = (k: string) => t(`apply.review.${k}`)

  const sections = [
    {
      title: r('personalDetails'),
      rows: [
        { label: r('fullName'), value: formData.fullName ?? '' },
        { label: r('fatherName'), value: formData.fatherName ?? '' },
        { label: r('dateOfBirth'), value: formData.dateOfBirth ?? '' },
        { label: r('gender'), value: formData.gender ?? '' },
        { label: r('mobile'), value: formData.mobile ?? '' },
        { label: r('email'), value: formData.email ?? '' },
        { label: r('aadhaar'), value: formData.aadhaarNumber ? `XXXX XXXX ${formData.aadhaarNumber.slice(-4)}` : '' },
        { label: r('bloodGroup'), value: formData.bloodGroup ?? '' },
      ],
    },
    {
      title: r('addressDetails'),
      rows: [
        { label: r('city'), value: formData.city ?? '' },
        { label: r('district'), value: formData.district ?? '' },
        { label: r('state'), value: formData.state ?? '' },
        { label: r('pincode'), value: formData.pincode ?? '' },
      ],
    },
    {
      title: r('professionalDetails'),
      rows: [
        { label: r('vehicleType'), value: formData.vehicleType ?? '' },
        { label: r('experience'), value: formData.experience ?? '' },
        { label: r('rtoCode'), value: formData.rtoCode ?? '' },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {sections.map((sec) => (
        <div key={sec.title} className="bg-neutral-50 rounded-xl p-5 border border-neutral-100">
          <h3 className="text-sm font-semibold text-neutral-900 mb-3">{sec.title}</h3>
          {sec.rows.map((row) => <ReviewRow key={row.label} {...row} />)}
        </div>
      ))}

      <div className="bg-blue-50 rounded-xl p-4 text-sm text-[#0F4C81]">
        {t('apply.declaration')}
      </div>

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="flex items-center gap-2 px-5 py-3 border border-neutral-200 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-50 transition-colors">
          <ArrowLeft size={16} /> {t('common:buttons.back')}
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="flex items-center gap-2 px-7 py-3 bg-[#16A34A] text-white rounded-xl font-semibold hover:bg-[#15803d] transition-colors disabled:opacity-60"
        >
          {isLoading ? t('common:buttons.submitting') : t('apply.submitApplication')} {!isLoading && <ArrowRight size={16} />}
        </button>
      </div>
    </div>
  )
}

function SuccessScreen({ refNumber }: { refNumber: string }) {
  const { t } = useTranslation('pages')
  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-[#16A34A]" />
      </div>
      <h2 className="text-2xl font-bold text-neutral-900 mb-2">{t('apply.success')}</h2>
      <p className="text-neutral-500 mb-6">{t('apply.successReceived')}</p>

      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl px-8 py-6 inline-block mb-6">
        <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">{t('apply.successRef')}</div>
        <div className="text-2xl font-bold font-mono text-[#0F4C81]">{refNumber}</div>
        <div className="text-xs text-neutral-400 mt-1">{t('apply.successSave')}</div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700 max-w-md mx-auto mb-8">
        {t('apply.successMsg')}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to={`${ROUTES.TRACK}?ref=${refNumber}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F4C81] text-white rounded-xl font-semibold hover:bg-[#0d3d6b] transition-colors"
        >
          <Search size={16} /> {t('apply.trackApplication')}
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-200 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-50 transition-colors"
        >
          <Printer size={16} /> {t('apply.printReceipt')}
        </button>
      </div>
    </div>
  )
}

export function ApplyPage() {
  const { t } = useTranslation('pages')
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<Partial<FormData>>({})
  const [referenceNumber, setReferenceNumber] = useState('')

  const mutation = useMutation({
    mutationFn: applicationService.submit,
    onSuccess: (data) => {
      setReferenceNumber(data.referenceNumber)
      setStep(6)
    },
  })

  const handleStep1 = (data: Step1Data) => { setFormData((p) => ({ ...p, ...data })); setStep(2) }
  const handleStep2 = (data: Step2Data) => { setFormData((p) => ({ ...p, ...data })); setStep(3) }
  const handleStep3 = (data: Step3Data) => { setFormData((p) => ({ ...p, ...data })); setStep(4) }
  const handleStep4 = () => setStep(5)
  const handleSubmit = () => mutation.mutate(formData)

  const stepLabels = [
    t('apply.step1'),
    t('apply.step2'),
    t('apply.step3'),
    t('apply.step4'),
    t('apply.step5'),
  ]
  const stepTitles = ['', ...stepLabels, t('apply.step6')]

  return (
    <div>
      <div className="bg-[#0F4C81] py-14">
        <div className="container-wide text-center">
          <Badge variant="accent" className="mb-4">{t('apply.badge')}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('apply.title')}</h1>
          <p className="text-blue-200">{t('apply.subtitle')}</p>
        </div>
      </div>

      <div className="section-padding bg-neutral-50">
        <div className="container-wide max-w-3xl">
          {step < 6 && <StepIndicator current={step} steps={stepLabels} />}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6 md:p-8">
            {step < 6 && (
              <h2 className="text-lg font-bold text-neutral-900 mb-6 pb-4 border-b border-neutral-100">
                {t('common:misc.stepLabel', { n: step, title: stepTitles[step] })}
              </h2>
            )}
            {step === 1 && <Step1 onNext={handleStep1} />}
            {step === 2 && <Step2 onNext={handleStep2} onBack={() => setStep(1)} />}
            {step === 3 && <Step3 onNext={handleStep3} onBack={() => setStep(2)} />}
            {step === 4 && <Step4 onNext={handleStep4} onBack={() => setStep(3)} />}
            {step === 5 && (
              <Step5
                formData={formData}
                onSubmit={handleSubmit}
                onBack={() => setStep(4)}
                isLoading={mutation.isPending}
              />
            )}
            {step === 6 && <SuccessScreen refNumber={referenceNumber} />}
          </div>
        </div>
      </div>
    </div>
  )
}
