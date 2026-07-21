import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle, ShieldCheck, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/utils/formatters'
import type { CardVerificationResult, CardVerificationStatus } from '@/types/driver.types'
import { cn } from '@/utils/cn'

interface VerificationResultProps {
  result: CardVerificationResult
  className?: string
}

type StatusStyle = {
  banner: string
  bannerMuted: string
  badge: string
  alert: string
  icon: typeof CheckCircle
}

const STATUS_STYLES: Record<CardVerificationStatus, StatusStyle> = {
  VALID: {
    banner: 'bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800',
    bannerMuted: 'text-blue-200',
    badge: 'bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/40',
    alert: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    icon: CheckCircle,
  },
  EXPIRED: {
    banner: 'bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-700',
    bannerMuted: 'text-neutral-300',
    badge: 'bg-amber-400/15 text-amber-200 ring-1 ring-amber-300/40',
    alert: 'bg-amber-50 text-amber-900 border-amber-200',
    icon: AlertTriangle,
  },
  REVOKED: {
    banner: 'bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-700',
    bannerMuted: 'text-neutral-300',
    badge: 'bg-red-400/15 text-red-200 ring-1 ring-red-300/40',
    alert: 'bg-red-50 text-red-900 border-red-200',
    icon: XCircle,
  },
  NOT_FOUND: {
    banner: 'bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-700',
    bannerMuted: 'text-neutral-300',
    badge: 'bg-red-400/15 text-red-200 ring-1 ring-red-300/40',
    alert: 'bg-red-50 text-red-900 border-red-200',
    icon: XCircle,
  },
}

function DetailGroup({
  title,
  rows,
}: {
  title: string
  rows: { label: string; value?: string | null }[]
}) {
  const visible = rows.filter((row) => row.value)
  if (visible.length === 0) return null

  return (
    <section>
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
        {title}
      </h3>
      <dl className="rounded-xl border border-neutral-200 bg-white px-4">
        {visible.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-0.5 py-2.5 border-b border-neutral-100 last:border-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
          >
            <dt className="text-xs font-medium text-neutral-500 shrink-0">{row.label}</dt>
            <dd className="text-sm font-semibold text-neutral-900 sm:text-right break-words">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default function VerificationResult({ result, className }: VerificationResultProps) {
  const { t } = useTranslation('pages')
  const style = STATUS_STYLES[result.status]
  const Icon = style.icon
  const meta = result.metadata

  if (result.status === 'NOT_FOUND') {
    return (
      <div className={cn('surface-card overflow-hidden', className)}>
        <div className="px-6 py-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <XCircle className="h-7 w-7 text-red-600" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-neutral-900">{t('verify.result.notFoundTitle')}</h2>
          <p className="mt-2 text-sm text-neutral-600 max-w-sm mx-auto leading-relaxed">
            {t('verify.result.notFoundMessage')}
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/verify">{t('verify.result.verifyAnother')}</Link>
          </Button>
        </div>
      </div>
    )
  }

  const statusLabel = t(`verify.result.status.${result.status}`)
  const statusMessage =
    result.status === 'EXPIRED' && result.expiryDate
      ? t('verify.result.message.EXPIRED_ON', { date: formatDate(result.expiryDate) })
      : t(`verify.result.message.${result.status}`)

  return (
    <div className={cn('surface-card overflow-hidden', className)}>
      <div className={cn('px-5 py-5 sm:px-6 text-white', style.banner)}>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className={cn('h-4 w-4', style.bannerMuted)} />
          <span className={style.bannerMuted}>{t('verify.result.officialBadge')}</span>
        </div>

        <div className="mt-4 flex items-start gap-4">
          {result.photoUrl ? (
            <img
              src={result.photoUrl}
              alt={result.driverName ?? t('verify.result.driverPhoto')}
              className="h-20 w-16 sm:h-24 sm:w-20 shrink-0 rounded-lg object-cover ring-2 ring-white/30 bg-white/10"
            />
          ) : (
            <div className="flex h-20 w-16 sm:h-24 sm:w-20 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-2 ring-white/20 text-2xl font-bold">
              {(result.driverName ?? '?').charAt(0)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                style.badge,
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {statusLabel}
            </span>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold leading-tight truncate text-white">
              {result.driverName}
            </h2>
            {result.memberNumber && (
              <p className={cn('mt-1 text-sm font-medium', style.bannerMuted)}>
                {t('verify.result.memberNo', { number: result.memberNumber })}
              </p>
            )}
            {result.district && (
              <p className={cn('mt-0.5 text-sm', style.bannerMuted)}>
                {t('verify.result.districtLine', { district: result.district })}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        <div
          className={cn(
            'flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm leading-relaxed',
            style.alert,
          )}
        >
          <Icon className="h-4 w-4 shrink-0 mt-0.5" />
          <p>{statusMessage}</p>
        </div>

        <DetailGroup
          title={t('verify.result.groups.membership')}
          rows={[
            { label: t('verify.result.fields.cardNumber'), value: meta?.cardNumber },
            {
              label: t('verify.result.fields.issueDate'),
              value: meta?.issueDate ? formatDate(meta.issueDate) : undefined,
            },
            {
              label: t('verify.result.fields.validUntil'),
              value: result.expiryDate ? formatDate(result.expiryDate) : undefined,
            },
            { label: t('verify.result.fields.designation'), value: meta?.designation },
          ]}
        />

        <DetailGroup
          title={t('verify.result.groups.driving')}
          rows={[
            { label: t('verify.result.fields.license'), value: meta?.licenseNumber },
            { label: t('verify.result.fields.vehicle'), value: meta?.vehicleNumber },
            { label: t('verify.result.fields.vehicleType'), value: meta?.vehicleType },
          ]}
        />

        <DetailGroup
          title={t('verify.result.groups.personal')}
          rows={[
            { label: t('verify.result.fields.fatherOrSpouse'), value: meta?.fatherOrSpouseName },
            {
              label: t('verify.result.fields.dateOfBirth'),
              value: meta?.dateOfBirth ? formatDate(meta.dateOfBirth) : undefined,
            },
            { label: t('verify.result.fields.bloodGroup'), value: meta?.bloodGroup },
            { label: t('verify.result.fields.mobile'), value: meta?.phoneNumber },
            { label: t('verify.result.fields.email'), value: meta?.email },
            { label: t('verify.result.fields.city'), value: meta?.city },
            { label: t('verify.result.fields.tehsil'), value: meta?.policeStation },
            { label: t('verify.result.fields.state'), value: meta?.state },
          ]}
        />

        <p className="text-center text-xs text-neutral-500 leading-relaxed px-2">
          {t('verify.result.footerNote')}
        </p>

        <div className="flex justify-center">
          <Button asChild variant="outline" size="sm">
            <Link to="/verify">{t('verify.result.verifyAnother')}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
