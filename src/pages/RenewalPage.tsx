import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { Search, ArrowRight, ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react'
import { renewalService } from '@/services'
import { Badge } from '@/components/common/Badge'
import { cn } from '@/lib/utils'
import type { RenewalRecord } from '@/types'

function StepBar({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-1">
      {steps.map((label, i) => {
        const n = i + 1
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
                current > n ? 'bg-[#16A34A] border-[#16A34A] text-white'
                  : current === n ? 'bg-[#0F4C81] border-[#0F4C81] text-white'
                  : 'bg-white border-neutral-200 text-neutral-400',
              )}>
                {current > n ? <CheckCircle size={14} /> : n}
              </div>
              <div className={cn(
                'text-xs mt-1 hidden sm:block whitespace-nowrap',
                current === n ? 'text-[#0F4C81] font-medium' : current > n ? 'text-[#16A34A]' : 'text-neutral-400',
              )}>
                {label}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                'h-0.5 w-10 md:w-16 mx-1 mb-4',
                current > n + 1 ? 'bg-[#16A34A]' : current > n ? 'bg-[#0F4C81]' : 'bg-neutral-200',
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function RenewalPage() {
  const { t } = useTranslation('pages')
  const { t: tc } = useTranslation('common')
  const [step, setStep] = useState(1)
  const [membershipNum, setMembershipNum] = useState('')
  const [dob, setDob] = useState('')
  const [record, setRecord] = useState<RenewalRecord | null>(null)
  const [editedPhone, setEditedPhone] = useState('')
  const [editedEmail, setEditedEmail] = useState('')
  const [renewalRef, setRenewalRef] = useState('')

  const steps = [
    t('renewal.step1'),
    t('renewal.step2'),
    t('renewal.step3'),
    t('renewal.step4'),
    t('renewal.step5'),
  ]

  const searchMutation = useMutation({
    mutationFn: () => renewalService.search(membershipNum, dob),
    onSuccess: (data) => {
      setRecord(data)
      setEditedPhone(data.phone)
      setEditedEmail(data.email)
      setStep(2)
    },
  })

  const submitMutation = useMutation({
    mutationFn: () => renewalService.submit(membershipNum),
    onSuccess: (data) => {
      setRenewalRef(data.referenceNumber)
      setStep(5)
    },
  })

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0F4C81] transition-all"
  const f = (k: string) => t(`renewal.fields.${k}`)

  return (
    <div>
      <div className="bg-[#0F4C81] py-14">
        <div className="container-wide text-center">
          <Badge variant="accent" className="mb-4">{t('renewal.badge')}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('renewal.title')}</h1>
          <p className="text-blue-200">{t('renewal.subtitle')}</p>
        </div>
      </div>

      <div className="section-padding bg-neutral-50">
        <div className="container-wide max-w-2xl">
          {step < 5 && <StepBar current={step} steps={steps} />}

          <div className="bg-white rounded-2xl border border-neutral-100 p-6 md:p-8">
            {/* Step 1: Search */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-neutral-900 mb-2">{t('renewal.searchTitle')}</h2>
                <p className="text-sm text-neutral-500 mb-5">{t('renewal.searchSubtitle')}</p>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    {t('renewal.membershipNumber')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={membershipNum}
                    onChange={(e) => setMembershipNum(e.target.value)}
                    className={`${inputClass} font-mono`}
                    placeholder={t('renewal.membershipPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    {t('renewal.dobLabel')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className={inputClass}
                  />
                </div>
                {searchMutation.isError && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
                    {t('renewal.notFoundMsg')}
                  </div>
                )}
                <button
                  onClick={() => searchMutation.mutate()}
                  disabled={!membershipNum || !dob || searchMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#0F4C81] text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-[#0d3d6b] transition-colors"
                >
                  <Search size={16} />
                  {searchMutation.isPending ? tc('buttons.searching') : t('renewal.searchBtn')}
                </button>
              </div>
            )}

            {/* Step 2: Verify */}
            {step === 2 && record && (
              <div>
                <h2 className="text-lg font-bold text-neutral-900 mb-5">{t('renewal.verifyTitle')}</h2>
                <div className="space-y-3 mb-6">
                  {[
                    { labelKey: 'fullName', value: record.fullName },
                    { labelKey: 'membershipNumber', value: record.membershipNumber },
                    { labelKey: 'dateOfBirth', value: record.dateOfBirth },
                    { labelKey: 'phone', value: record.phone },
                    { labelKey: 'email', value: record.email },
                    { labelKey: 'address', value: record.address },
                    { labelKey: 'expiryDate', value: record.expiryDate },
                    { labelKey: 'status', value: record.status },
                  ].map(({ labelKey, value }) => (
                    <div key={labelKey} className="flex justify-between py-2 border-b border-neutral-50">
                      <span className="text-sm text-neutral-500">{f(labelKey)}</span>
                      <span className={cn('text-sm font-medium', value === 'Expired' ? 'text-red-500' : 'text-neutral-900')}>{value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex items-center gap-2 px-5 py-3 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
                    <ArrowLeft size={15} /> {tc('buttons.back')}
                  </button>
                  <button onClick={() => setStep(3)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#0F4C81] text-white rounded-xl font-semibold hover:bg-[#0d3d6b]">
                    {t('renewal.confirmContinue')} <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Update */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-neutral-900">{t('renewal.updateTitle')}</h2>
                <p className="text-sm text-neutral-500">{t('renewal.updateSubtitle')}</p>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">{f('mobileNumber')}</label>
                  <input value={editedPhone} onChange={(e) => setEditedPhone(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">{f('emailAddress')}</label>
                  <input value={editedEmail} onChange={(e) => setEditedEmail(e.target.value)} type="email" className={inputClass} />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex items-center gap-2 px-5 py-3 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
                    <ArrowLeft size={15} /> {tc('buttons.back')}
                  </button>
                  <button onClick={() => setStep(4)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#0F4C81] text-white rounded-xl font-semibold hover:bg-[#0d3d6b]">
                    {t('renewal.reviewRenewal')} <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && record && (
              <div>
                <h2 className="text-lg font-bold text-neutral-900 mb-5">{t('renewal.reviewTitle')}</h2>
                <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-100 space-y-3 mb-5">
                  {[
                    { labelKey: 'fullName', value: record.fullName },
                    { labelKey: 'membershipNumber', value: record.membershipNumber },
                    { labelKey: 'updatedPhone', value: editedPhone },
                    { labelKey: 'updatedEmail', value: editedEmail },
                    { labelKey: 'renewalYear', value: '2025' },
                  ].map(({ labelKey, value }) => (
                    <div key={labelKey} className="flex justify-between py-2 border-b border-neutral-100 last:border-0">
                      <span className="text-sm text-neutral-500">{f(labelKey)}</span>
                      <span className="text-sm font-medium text-neutral-900">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 mb-5">
                  {t('renewal.paymentNote')}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(3)} className="flex items-center gap-2 px-5 py-3 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
                    <ArrowLeft size={15} /> {tc('buttons.back')}
                  </button>
                  <button
                    onClick={() => submitMutation.mutate()}
                    disabled={submitMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#16A34A] text-white rounded-xl font-semibold hover:bg-[#15803d] disabled:opacity-50"
                  >
                    {submitMutation.isPending ? tc('buttons.submitting') : t('renewal.submitRenewal')} <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Success */}
            {step === 5 && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle size={32} className="text-[#16A34A]" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900 mb-2">{t('renewal.successTitle')}</h2>
                <p className="text-neutral-500 text-sm mb-5">{t('renewal.successMsg')}</p>
                <div className="bg-neutral-50 border border-neutral-100 rounded-xl px-6 py-4 inline-block mb-5">
                  <div className="text-xs text-neutral-400 mb-0.5">{t('renewal.renewalRef')}</div>
                  <div className="text-lg font-bold font-mono text-[#0F4C81]">{renewalRef}</div>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 mb-6">
                  {t('renewal.paymentActivate')}
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => { setStep(1); setRecord(null); setMembershipNum(''); setDob('') }}
                    className="flex items-center gap-2 px-5 py-3 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                  >
                    <RefreshCw size={15} /> {t('renewal.startNew')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
