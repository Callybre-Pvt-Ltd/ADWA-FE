import { cn } from '@/utils/cn'

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary'

export interface StatusBadgeProps {
  variant: BadgeVariant
  label: string
  dot?: boolean
  className?: string
  testId?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  danger: 'bg-red-50 text-red-800 border-red-200',
  info: 'bg-royal-50 text-royal-700 border-royal-200',
  neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  primary: 'bg-navy-50 text-navy-700 border-navy-200',
}

const dotColors: Record<BadgeVariant, string> = {
  success: 'bg-emerald-600',
  warning: 'bg-amber-600',
  danger: 'bg-red-600',
  info: 'bg-royal-600',
  neutral: 'bg-neutral-500',
  primary: 'bg-navy-700',
}

export function StatusBadge({ variant, label, dot, className, testId }: StatusBadgeProps) {
  return (
    <span
      data-testid={testId}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className,
      )}
    >
      {dot && (
        <span className={cn('h-1.5 w-1.5 rounded-full animate-pulse', dotColors[variant])} aria-hidden="true" />
      )}
      {label}
    </span>
  )
}

export function statusToVariant(status: string): BadgeVariant {
  const normalized = status.toLowerCase()
  const map: Record<string, BadgeVariant> = {
    pending: 'warning',
    approved: 'info',
    rejected: 'danger',
    payment_pending: 'warning',
    payment_confirmed: 'info',
    id_generated: 'success',
    expired: 'danger',
    collected: 'info',
    waiting_confirmation: 'warning',
    confirmed: 'success',
    valid: 'success',
    invalid: 'danger',
    active: 'success',
    inactive: 'neutral',
    submitted: 'info',
    pending_district_review: 'warning',
    rejected_by_district: 'danger',
    forwarded_to_admin: 'primary',
    rejected_by_admin: 'danger',
    id_card_generated: 'success',
    suspended: 'danger',
    revoked: 'danger',
  }
  return map[normalized] ?? 'neutral'
}
