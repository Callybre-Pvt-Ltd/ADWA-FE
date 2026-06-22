import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { AvatarWithInitials } from '@/components/shared/AvatarWithInitials'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/utils/formatters'
import type { CardVerificationResult } from '@/types/driver.types'
import { cn } from '@/utils/cn'

interface VerificationResultProps {
  result: CardVerificationResult
  className?: string
}

const STATUS_CONFIG = {
  VALID: { label: 'Verified', variant: 'success' as const, icon: CheckCircle, message: 'This driver ID card is valid and verified.' },
  EXPIRED: { label: 'Expired', variant: 'danger' as const, icon: AlertTriangle, message: 'This driver ID card has expired.' },
  REVOKED: { label: 'Suspended', variant: 'danger' as const, icon: XCircle, message: 'This driver ID card has been suspended or revoked.' },
  NOT_FOUND: { label: 'Not Found', variant: 'danger' as const, icon: XCircle, message: 'No driver found with this verification code.' },
}

export default function VerificationResult({ result, className }: VerificationResultProps) {
  const config = STATUS_CONFIG[result.status]
  const Icon = config.icon

  if (result.status === 'NOT_FOUND') {
    return (
      <div className={cn('rounded-xl border border-red-200 bg-red-50 p-8 text-center', className)}>
        <XCircle className="mx-auto h-16 w-16 text-red-600" />
        <h2 className="mt-4 text-xl font-bold text-neutral-900">Invalid Card</h2>
        <p className="mt-2 text-neutral-600">{config.message}</p>
      </div>
    )
  }

  return (
    <div className={cn('rounded-xl border border-neutral-200 bg-white p-6', className)}>
      <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-4">
        <AvatarWithInitials name={result.driverName ?? 'Driver'} imageUrl={result.photoUrl} size="lg" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h2 className="text-xl font-bold text-neutral-900">{result.driverName}</h2>
            <StatusBadge variant={config.variant} label={config.label} dot />
          </div>
          {result.memberNumber && (
            <p className="mt-1 text-sm text-neutral-500">Member No: {result.memberNumber}</p>
          )}
        </div>
      </div>

      <div className={cn(
        'mt-4 flex items-center gap-2 rounded-lg p-3 text-sm',
        result.status === 'VALID' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800',
      )}>
        <Icon className="h-4 w-4 shrink-0" />
        {config.message}
        {result.status === 'EXPIRED' && result.expiryDate && (
          <span className="ml-1">Expired on {formatDate(result.expiryDate)}.</span>
        )}
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        {[
          ['District', result.district ?? '—'],
          ['Expiry Date', result.expiryDate ? formatDate(result.expiryDate) : '—'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-neutral-50 p-3">
            <dt className="text-xs text-neutral-500">{label}</dt>
            <dd className="mt-0.5 font-medium text-neutral-900">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
