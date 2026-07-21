import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { Search, CheckCircle, Circle, AlertCircle, HelpCircle } from 'lucide-react'
import { PageHero } from '@/components/shared/PageHero'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { StatusBadge, statusToVariant } from '@/components/shared/StatusBadge'
import { useTrackApplication, useRecoverReference } from '@/hooks/useDriverRequests'
import { formatDate, formatDateTime } from '@/utils/formatters'
import type { RecoveredApplication, RequestStatus } from '@/types/driver.types'

type TrackForm = { refNumber: string; mobile: string }

function formatStatus(status: RequestStatus): string {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

export default function StatusPage() {
  const { t } = useTranslation('pages')
  const [searchParams, setSearchParams] = useState<{ ref: string; mobile: string } | null>(null)
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<TrackForm>()

  const [recoverOpen, setRecoverOpen] = useState(false)
  const [recoverMobile, setRecoverMobile] = useState('')
  const [recoverDob, setRecoverDob] = useState('')
  const recover = useRecoverReference()

  const { data, isLoading, isFetching, isError, refetch } = useTrackApplication(
    searchParams?.ref ?? '',
    searchParams?.mobile ?? '',
    !!searchParams,
  )

  const onSearch = handleSubmit((form) => {
    setSearchParams({ ref: form.refNumber.trim(), mobile: form.mobile.trim() })
  })

  const onRecover = () => {
    if (recover.isPending || !recoverMobile.trim() || !recoverDob) return
    recover.mutate({ mobile: recoverMobile.trim(), dob: recoverDob })
  }

  const useRecovered = (app: RecoveredApplication) => {
    setValue('refNumber', app.referenceNumber)
    setValue('mobile', recoverMobile.trim())
    setRecoverOpen(false)
    setSearchParams({ ref: app.referenceNumber, mobile: recoverMobile.trim() })
  }

  return (
    <div className="bg-white">
      <PageHero title={t('track.title')} subtitle={t('track.subtitle')} />
      <section className="section-padding">
        <div className="container-wide max-w-2xl mx-auto">
          <form onSubmit={onSearch} className="surface-card p-6 space-y-4 mb-4">
            <div>
              <Label htmlFor="refNumber">{t('track.refNumber')}</Label>
              <Input
                id="refNumber"
                {...register('refNumber', { required: true, minLength: 5 })}
                placeholder={t('track.refPlaceholder')}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="mobile">{t('track.mobile', 'Mobile Number')}</Label>
              <Input
                id="mobile"
                type="tel"
                inputMode="numeric"
                {...register('mobile', { required: true, pattern: /^[6-9]\d{9}$/ })}
                placeholder="10-digit mobile number"
                className="mt-1"
              />
              {errors.mobile && <p className="text-sm text-red-600 mt-1">Enter a valid 10-digit mobile number</p>}
            </div>
            <Button
              type="submit"
              className="w-full"
              loading={isFetching && !!searchParams}
              loadingText={t('common:buttons.searching', 'Searching…')}
            >
              <Search className="h-4 w-4 mr-1" /> {t('track.searchBtn')}
            </Button>
            <button
              type="button"
              onClick={() => setRecoverOpen((open) => !open)}
              className="w-full text-center text-sm font-medium text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
            >
              {t('track.recover.link')}
            </button>
          </form>

          {recoverOpen && (
            <div className="surface-card p-6 space-y-4 mb-8 border-blue-200">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50">
                  <HelpCircle className="h-5 w-5 text-blue-800" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-900">{t('track.recover.title')}</h2>
                  <p className="mt-1 text-sm text-neutral-600 leading-relaxed">{t('track.recover.description')}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="recover-mobile">{t('track.mobile', 'Mobile Number')}</Label>
                  <Input
                    id="recover-mobile"
                    type="tel"
                    inputMode="numeric"
                    value={recoverMobile}
                    onChange={(e) => setRecoverMobile(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="recover-dob">{t('track.dob', 'Date of Birth')}</Label>
                  <Input
                    id="recover-dob"
                    type="date"
                    value={recoverDob}
                    onChange={(e) => setRecoverDob(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onRecover}
                disabled={!/^[6-9]\d{9}$/.test(recoverMobile.trim()) || !recoverDob}
                loading={recover.isPending}
                loadingText={t('common:buttons.searching', 'Searching…')}
              >
                {t('track.recover.submit')}
              </Button>

              {recover.isSuccess && recover.data.length === 0 && (
                <p className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
                  {t('track.recover.noResults')}
                </p>
              )}

              {recover.isSuccess && recover.data.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-neutral-700">{t('track.recover.resultsTitle')}</p>
                  {recover.data.map((app) => (
                    <div
                      key={app.referenceNumber}
                      className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-neutral-900">{app.referenceNumber}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {app.fullName}
                          {app.districtName ? ` · ${app.districtName}` : ''} · {formatDate(app.createdAt)}
                        </p>
                        <StatusBadge
                          variant={statusToVariant(app.status)}
                          label={formatStatus(app.status)}
                          className="mt-1.5"
                        />
                      </div>
                      <Button size="sm" className="shrink-0" onClick={() => useRecovered(app)}>
                        {t('track.recover.useThis')}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {searchParams && isLoading && (
            <div className="surface-card p-6 text-center text-neutral-500">Searching...</div>
          )}

          {searchParams && isError && (
            <div className="surface-card p-6 text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
              <h3 className="mt-3 font-bold text-neutral-900">{t('track.notFoundTitle')}</h3>
              <p className="mt-2 text-sm text-neutral-500">{t('track.notFoundMsg')}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => refetch()}
                loading={isFetching}
                loadingText={t('common:buttons.searching', 'Trying again…')}
              >
                Try Again
              </Button>
            </div>
          )}

          {data && (
            <div className="surface-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-neutral-500">{t('track.applicant')}</p>
                  <p className="font-semibold text-neutral-900 text-lg">{data.fullName}</p>
                  <p className="text-sm text-neutral-500 mt-1">Ref: {data.referenceNumber}</p>
                </div>
                <StatusBadge variant={statusToVariant(data.status)} label={formatStatus(data.status)} />
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-neutral-500">District</dt>
                  <dd className="font-medium">{data.districtName ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Submitted</dt>
                  <dd className="font-medium">{formatDate(data.createdAt)}</dd>
                </div>
              </dl>

              <h3 className="mt-6 font-bold text-neutral-900">{t('track.timeline')}</h3>
              <ul className="mt-4 space-y-3">
                {data.statusHistory.length > 0 ? (
                  data.statusHistory.map((entry, i) => {
                    const isLatest = i === data.statusHistory.length - 1
                    return (
                      <li key={entry.id} className="flex items-start gap-3">
                        {isLatest ? (
                          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="h-5 w-5 text-neutral-300 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <span className={isLatest ? 'text-neutral-900 font-medium' : 'text-neutral-500'}>
                            {formatStatus(entry.toStatus)}
                          </span>
                          {entry.notes && <p className="text-xs text-neutral-500 mt-0.5">{entry.notes}</p>}
                          <p className="text-xs text-neutral-400 mt-0.5">{formatDateTime(entry.createdAt)}</p>
                        </div>
                      </li>
                    )
                  })
                ) : (
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span className="text-neutral-900 font-medium">{formatStatus(data.status)}</span>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
