import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { AvatarWithInitials } from '@/components/shared/AvatarWithInitials'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/utils/formatters'
import type { VerificationState } from '@/types/driver.types'
import { cn } from '@/utils/cn'

interface VerificationResultProps {
  result: VerificationState
  className?: string
}

export default function VerificationResult({ result, className }: VerificationResultProps) {
  if (result.status === 'invalid') {
    return (
      <div className={cn('rounded-xl border border-red-200 bg-red-50 p-8 text-center', className)}>
        <XCircle className="mx-auto h-16 w-16 text-red-600" />
        <h2 className="mt-4 text-xl font-bold text-neutral-900">Invalid Card</h2>
        <p className="mt-2 text-neutral-600">
          {result.reason === 'not_found' ? 'No driver found with this card ID.' : 'Card data could not be verified.'}
        </p>
      </div>
    )
  }

  const { driver } = result
  const isExpired = result.status === 'expired'

  return (
    <div className={cn('rounded-xl border border-neutral-200 bg-white p-6', className)}>
      <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-4">
        <AvatarWithInitials name={driver.name} imageUrl={driver.photoUrl} size="lg" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h2 className="text-xl font-bold text-neutral-900">{driver.name}</h2>
            <StatusBadge
              variant={isExpired ? 'danger' : 'success'}
              label={isExpired ? 'Expired' : 'Valid'}
              dot
            />
          </div>
          <p className="mt-1 text-sm text-neutral-500">Card ID: {driver.cardId}</p>
        </div>
      </div>
      {isExpired && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Expired on {formatDate(result.expiredAt)}
        </div>
      )}
      {!isExpired && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
          <CheckCircle className="h-4 w-4 shrink-0" />
          This driver ID card is valid and verified.
        </div>
      )}
      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        {[
          ['District', driver.district],
          ['Blood Group', driver.bloodGroup],
          ['License', driver.licenseNumber],
          ['Issue Date', formatDate(driver.issueDate)],
          ['Expiry Date', formatDate(driver.expiryDate)],
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
