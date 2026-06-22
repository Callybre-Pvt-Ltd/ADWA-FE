import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { Search, CheckCircle, Circle, AlertCircle } from 'lucide-react'
import { PageHero } from '@/components/shared/PageHero'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { StatusBadge, statusToVariant } from '@/components/shared/StatusBadge'
import { useTrackApplication } from '@/hooks/useDriverRequests'
import { formatDate, formatDateTime } from '@/utils/formatters'
import type { RequestStatus } from '@/types/driver.types'

type TrackForm = { refNumber: string; mobile: string }

function formatStatus(status: RequestStatus): string {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

export default function StatusPage() {
  const { t } = useTranslation('pages')
  const [searchParams, setSearchParams] = useState<{ ref: string; mobile: string } | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<TrackForm>()

  const { data, isLoading, isError, refetch } = useTrackApplication(
    searchParams?.ref ?? '',
    searchParams?.mobile ?? '',
    !!searchParams,
  )

  const onSearch = handleSubmit((form) => {
    setSearchParams({ ref: form.refNumber.trim(), mobile: form.mobile.trim() })
  })

  return (
    <div className="bg-white">
      <PageHero title={t('track.title')} subtitle={t('track.subtitle')} />
      <section className="section-padding">
        <div className="container-wide max-w-2xl mx-auto">
          <form onSubmit={onSearch} className="surface-card p-6 space-y-4 mb-8">
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              <Search className="h-4 w-4 mr-1" /> {t('track.searchBtn')}
            </Button>
          </form>

          {searchParams && isLoading && (
            <div className="surface-card p-6 text-center text-neutral-500">Searching...</div>
          )}

          {searchParams && isError && (
            <div className="surface-card p-6 text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
              <h3 className="mt-3 font-bold text-neutral-900">{t('track.notFoundTitle')}</h3>
              <p className="mt-2 text-sm text-neutral-500">{t('track.notFoundMsg')}</p>
              <Button variant="outline" className="mt-4" onClick={() => refetch()}>Try Again</Button>
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
