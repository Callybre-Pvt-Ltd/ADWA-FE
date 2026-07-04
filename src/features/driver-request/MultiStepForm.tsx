import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ArrowRight, User, Car, Upload, ClipboardCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSubmitDriverRequest } from '@/hooks/useDriverRequests'
import {
  driverPersonalSchema, driverDetailsSchema, documentUploadSchema,
  type DriverRequestFormData,
} from '@/utils/validators'
import { fadeInUp } from '@/utils/animations'
import { ApplicationStepper, type StepConfig } from './ApplicationStepper'
import { FormBottomBar } from '@/components/shared/FormBottomBar'
import StepPersonal from './StepPersonal'
import StepDriverDetails from './StepDriverDetails'
import StepUploads from './StepUploads'
import StepReview from './StepReview'
import { cn } from '@/utils/cn'

const FORM_STEPS: StepConfig[] = [
  { id: 1, labelHi: 'व्यक्तिगत जानकारी', labelEn: 'Personal Info',    icon: User },
  { id: 2, labelHi: 'व्यावसायिक जानकारी', labelEn: 'Driver Details', icon: Car },
  { id: 3, labelHi: 'दस्तावेज़ अपलोड',   labelEn: 'Upload Docs',     icon: Upload },
  { id: 4, labelHi: 'समीक्षा करें',       labelEn: 'Review',          icon: ClipboardCheck },
]

const schemas = [
  driverPersonalSchema,
  driverDetailsSchema,
  documentUploadSchema,
  driverPersonalSchema.merge(driverDetailsSchema).merge(documentUploadSchema),
]

export default function MultiStepForm() {
  const { t, i18n } = useTranslation('pages')
  const isHi = i18n.language === 'hi'
  const [step, setStep] = useState(0)
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null)
  const [declared, setDeclared] = useState(false)
  const submitRequest = useSubmitDriverRequest()

  const form = useForm<DriverRequestFormData>({
    resolver: zodResolver(
      driverPersonalSchema.merge(driverDetailsSchema).merge(documentUploadSchema),
    ) as any,
    mode: 'onChange',
    defaultValues: {
      email: '',
      altMobile: '',
      dateOfBirth: '',
      licenseIssueDate: '',
      licenseExpiryDate: '',
      state: 'Madhya Pradesh',
      experienceYears: 0,
    },
  })

  const next = async () => {
    const fields = Object.keys(schemas[step].shape) as (keyof DriverRequestFormData)[]
    const valid = await form.trigger(fields)
    if (valid) setStep(s => Math.min(s + 1, FORM_STEPS.length - 1))
  }

  const back = () => setStep(s => Math.max(s - 1, 0))

  const submit = form.handleSubmit(async (data) => {
    const result = await submitRequest.mutateAsync(data)
    setReferenceNumber(result.referenceNumber ?? result.id)
  })

  const isLastStep = step === FORM_STEPS.length - 1
  const progressPct = Math.round(((step + 1) / FORM_STEPS.length) * 100)
  const currentStep = FORM_STEPS[step]

  if (referenceNumber) {
    return (
      <motion.div {...fadeInUp} className="bg-white rounded-3xl border-2 border-neutral-200 mx-auto max-w-lg p-8 text-center shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 ring-8 ring-emerald-50">
          <CheckCircle className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-neutral-900">{t('apply.success')}</h2>
        <p className="mt-2 text-sm text-neutral-500">{t('apply.successReceived')}</p>
        <div className="mt-6 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 px-5 py-5">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{t('apply.successRef')}</p>
          <p className="mt-2 text-3xl font-bold text-blue-900 font-mono tracking-widest">{referenceNumber}</p>
          <p className="mt-2 text-xs text-neutral-500">{t('apply.successSave')}</p>
        </div>
        <p className="mt-4 text-sm text-neutral-500 leading-relaxed">{t('apply.successMsg')}</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="accent">
            <Link to="/status">{t('apply.trackApplication')} <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <Button variant="outline" onClick={() => { setReferenceNumber(null); setStep(0); form.reset() }}>
            {t('apply.printReceipt')}
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <FormProvider {...form}>
      <div className="max-w-5xl mx-auto space-y-4">

        <div className="hidden md:block bg-white rounded-3xl border-2 border-neutral-200 px-8 py-6 shadow-sm">
          <ApplicationStepper steps={FORM_STEPS} current={step} />
        </div>

        <div className="md:hidden bg-white rounded-2xl border-2 border-neutral-200 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-neutral-500">
              {isHi ? currentStep.labelHi : currentStep.labelEn}
            </span>
            <span className="text-xs font-bold text-blue-600">{step + 1}/{FORM_STEPS.length}</span>
          </div>
          <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-600 rounded-full"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-neutral-200 shadow-sm overflow-hidden">

          <div className="px-6 py-5 md:px-8 border-b-2 border-neutral-100 bg-linear-to-r from-blue-50 to-white">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-200">
                <currentStep.icon size={18} />
              </span>
              <div>
                <h2 className="text-lg font-bold text-neutral-900">
                  {isHi ? currentStep.labelHi : currentStep.labelEn}
                </h2>
                <p className="text-xs text-neutral-400">
                  {t('common:buttons.next')} — {isHi ? FORM_STEPS[Math.min(step + 1, FORM_STEPS.length - 1)].labelHi : FORM_STEPS[Math.min(step + 1, FORM_STEPS.length - 1)].labelEn}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                {FORM_STEPS.map((_, i) => (
                  <span key={i} className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    i === step ? 'w-6 bg-blue-600' : i < step ? 'w-2 bg-blue-300' : 'w-2 bg-neutral-200',
                  )} />
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 py-7 md:px-8 pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                {step === 0 && <StepPersonal />}
                {step === 1 && <StepDriverDetails />}
                {step === 2 && <StepUploads />}
                {step === 3 && <StepReview goToStep={setStep} declared={declared} setDeclared={setDeclared} />}
              </motion.div>
            </AnimatePresence>

            <FormBottomBar
              showBack={step > 0}
              onBack={back}
              onNext={isLastStep ? submit : next}
              nextLabel={isLastStep ? t('apply.submitApplication') : t('common:buttons.next')}
              isLoading={submitRequest.isPending}
              isSubmit={isLastStep}
              disabled={isLastStep && !declared}
            />
          </div>
        </div>

      </div>
    </FormProvider>
  )
}
