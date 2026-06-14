import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { Search, CheckCircle, Clock, Circle, AlertCircle } from 'lucide-react'
import { applicationService } from '@/services'
import { Badge } from '@/components/common/Badge'
import type { ApplicationStatus, TrackingStep } from '@/types'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'

function TrackingTimeline({ steps, currentStep }: { steps: TrackingStep[]; currentStep: number }) {
  const { t } = useTranslation('common')
  return (
    <div className="relative">
      {steps.map((step, i) => {
        const isCompleted = step.status === 'completed'
        const isActive = step.status === 'active'
        const isLast = i === steps.length - 1

        return (
          <div key={step.id} className="relative flex gap-5">
            {!isLast && (
              <div
                className={cn(
                  'absolute left-5 top-10 bottom-0 w-0.5',
                  isCompleted ? 'bg-[#16A34A]' : 'bg-neutral-200',
                )}
              />
            )}
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 z-10 bg-white',
              isCompleted
                ? 'border-[#16A34A] bg-green-50'
                : isActive
                ? 'border-[#0F4C81] bg-blue-50'
                : 'border-neutral-200',
            )}>
              {isCompleted
                ? <CheckCircle size={18} className="text-[#16A34A]" />
                : isActive
                ? <Clock size={18} className="text-[#0F4C81]" />
                : <Circle size={18} className="text-neutral-300" />
              }
            </div>
            <div className={cn('pb-8 flex-1', isLast && 'pb-0')}>
              <div className={cn(
                'font-semibold text-sm',
                isCompleted ? 'text-[#16A34A]'
                  : isActive ? 'text-[#0F4C81]'
                  : 'text-neutral-400',
              )}>
                {step.label}
              </div>
              <div className="text-sm text-neutral-500 mt-0.5">{step.description}</div>
              {step.completedAt && (
                <div className="text-xs text-neutral-400 mt-1">{formatDate(step.completedAt)}</div>
              )}
              {isActive && (
                <Badge variant="primary" className="mt-2">{t('status.inProgress')}</Badge>
              )}
            </div>
          </div>
        )
      })}
      <div className="mt-1 text-xs text-neutral-400">
        {t('misc.stepOf', { current: currentStep, total: steps.length })}
      </div>
    </div>
  )
}

export function TrackPage() {
  const { t } = useTranslation('pages')
  const { t: tc } = useTranslation('common')
  const [refNumber, setRefNumber] = useState('')
  const [result, setResult] = useState<ApplicationStatus | null>(null)

  const mutation = useMutation({
    mutationFn: () => applicationService.track(refNumber, ''),
    onSuccess: (data) => setResult(data),
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (refNumber) mutation.mutate()
  }

  return (
    <div>
      <div className="bg-[#0F4C81] py-14">
        <div className="container-wide text-center">
          <Badge variant="accent" className="mb-4">{t('track.badge')}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('track.title')}</h1>
          <p className="text-blue-200">{t('track.subtitle')}</p>
        </div>
      </div>

      <div className="section-padding bg-neutral-50">
        <div className="container-wide max-w-2xl">
          <div className="bg-white rounded-2xl border border-neutral-100 p-6 md:p-8 mb-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  {t('track.refNumber')} <span className="text-red-500">*</span>
                </label>
                <input
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0F4C81] transition-all font-mono"
                  placeholder={t('track.refPlaceholder')}
                />
              </div>
              <button
                type="submit"
                disabled={!refNumber || mutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#0F4C81] text-white rounded-xl font-semibold hover:bg-[#0d3d6b] transition-colors disabled:opacity-50"
              >
                <Search size={16} />
                {mutation.isPending ? tc('buttons.searching') : t('track.searchBtn')}
              </button>
            </form>

            <div className="mt-4 text-center text-xs text-neutral-400 bg-neutral-50 rounded-lg py-2 px-3">
              {tc('misc.example')} <span className="font-mono">{t('track.exampleText')}</span>
            </div>
          </div>

          {mutation.isError && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex gap-3">
              <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-red-700 text-sm">{t('track.notFoundTitle')}</div>
                <div className="text-sm text-red-600 mt-0.5">{t('track.notFoundMsg')}</div>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-white rounded-2xl border border-neutral-100 p-6 md:p-8">
              <div className="flex items-start justify-between mb-6 pb-5 border-b border-neutral-100">
                <div>
                  <div className="text-xs text-neutral-400 uppercase tracking-wide mb-0.5">{t('track.applicant')}</div>
                  <div className="font-bold text-neutral-900 text-lg">{result.fullName}</div>
                  <div className="text-sm font-mono text-[#0F4C81] mt-1">{result.referenceNumber}</div>
                </div>
                <Badge variant="primary">{tc('status.active')}</Badge>
              </div>
              <h3 className="text-sm font-semibold text-neutral-700 mb-5">{t('track.timeline')}</h3>
              <TrackingTimeline steps={result.steps} currentStep={result.currentStep} />
            </div>
          )}

          {!result && !mutation.isError && (
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { n: '1', titleKey: 'track.howTo.title1', descKey: 'track.howTo.desc1' },
                { n: '2', titleKey: 'track.howTo.title2', descKey: 'track.howTo.desc2' },
                { n: '3', titleKey: 'track.howTo.title3', descKey: 'track.howTo.desc3' },
              ].map((s) => (
                <div key={s.n} className="bg-white rounded-xl p-4 border border-neutral-100 text-center">
                  <div className="w-8 h-8 bg-blue-50 text-[#0F4C81] rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-sm">
                    {s.n}
                  </div>
                  <div className="text-sm font-semibold text-neutral-900 mb-1">{t(s.titleKey)}</div>
                  <div className="text-xs text-neutral-500">{t(s.descKey)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
