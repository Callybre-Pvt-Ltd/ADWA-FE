import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/utils/formatters'
import type { CardVerificationResult } from '@/types/driver.types'
import { cn } from '@/utils/cn'

interface VerificationResultProps {
  result: CardVerificationResult
  className?: string
}

const STATUS_CONFIG = {
  VALID: {
    label: 'Verified',
    variant: 'success' as const,
    icon: CheckCircle,
    message: 'This driver is a verified ADWA member.',
  },
  EXPIRED: {
    label: 'Expired',
    variant: 'danger' as const,
    icon: AlertTriangle,
    message: 'This membership card has expired.',
  },
  REVOKED: {
    label: 'Suspended',
    variant: 'danger' as const,
    icon: XCircle,
    message: 'This driver card has been suspended or revoked.',
  },
  NOT_FOUND: {
    label: 'Not Found',
    variant: 'danger' as const,
    icon: XCircle,
    message: 'No driver found with this verification code.',
  },
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2.5">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-neutral-900">{value}</dd>
    </div>
  )
}

export default function VerificationResult({ result, className }: VerificationResultProps) {
  const config = STATUS_CONFIG[result.status]
  const Icon = config.icon
  const meta = result.metadata

  if (result.status === 'NOT_FOUND') {
    return (
      <div className={cn('rounded-xl border border-red-200 bg-red-50 p-8 text-center', className)}>
        <XCircle className="mx-auto h-16 w-16 text-red-600" />
        <h2 className="mt-4 text-xl font-bold text-neutral-900">Invalid QR code</h2>
        <p className="mt-2 text-neutral-600">{config.message}</p>
      </div>
    )
  }

  return (
    <div className={cn('rounded-xl border border-neutral-200 bg-white overflow-hidden', className)}>
      <div className="bg-green-900 px-5 py-4 text-white">
        <p className="text-xs uppercase tracking-wider text-green-200">ADWA Driver Verification</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-bold">{result.driverName}</h2>
          <StatusBadge variant={config.variant} label={config.label} dot />
        </div>
        {result.memberNumber && (
          <p className="mt-1 text-sm text-green-100">Member No. {result.memberNumber}</p>
        )}
      </div>

      <div className="p-5">
        {result.photoUrl && (
          <div className="mb-4 flex justify-center">
            <img
              src={result.photoUrl}
              alt={result.driverName ?? 'Driver'}
              className="h-28 w-24 rounded-lg border border-neutral-200 object-cover"
            />
          </div>
        )}

        <div
          className={cn(
            'flex items-start gap-2 rounded-lg p-3 text-sm mb-5',
            result.status === 'VALID' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800',
          )}
        >
          <Icon className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            {config.message}
            {result.status === 'EXPIRED' && result.expiryDate && (
              <> Expired on {formatDate(result.expiryDate)}.</>
            )}
          </span>
        </div>

        <dl className="grid gap-2 sm:grid-cols-2">
          <DetailRow label="District" value={result.district} />
          <DetailRow label="Card number" value={meta?.cardNumber} />
          <DetailRow label="Issue date" value={meta?.issueDate ? formatDate(meta.issueDate) : undefined} />
          <DetailRow label="Valid until" value={result.expiryDate ? formatDate(result.expiryDate) : undefined} />
          <DetailRow label="License" value={meta?.licenseNumber} />
          <DetailRow label="Vehicle" value={meta?.vehicleNumber} />
          <DetailRow label="Vehicle type" value={meta?.vehicleType} />
          <DetailRow label="Blood group" value={meta?.bloodGroup} />
          <DetailRow label="Mobile" value={meta?.phoneNumber} />
          <DetailRow label="Email" value={meta?.email} />
          <DetailRow label="Date of birth" value={meta?.dateOfBirth ? formatDate(meta.dateOfBirth) : undefined} />
          <DetailRow label="Father / spouse" value={meta?.fatherOrSpouseName} />
          <DetailRow label="City / village" value={meta?.city} />
          <DetailRow label="Tehsil" value={meta?.policeStation} />
          <DetailRow label="State" value={meta?.state} />
          <DetailRow label="Designation" value={meta?.designation} />
        </dl>
      </div>
    </div>
  )
}
