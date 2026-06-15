import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: { value: number; direction: 'up' | 'down' }
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  className?: string
  testId?: string
}

const variantStyles = {
  default: 'bg-white border-neutral-200',
  primary: 'bg-navy-50 border-navy-200',
  success: 'bg-emerald-50 border-emerald-200',
  warning: 'bg-amber-50 border-amber-200',
  danger: 'bg-red-50 border-red-200',
}

const iconStyles = {
  default: 'bg-neutral-100 text-neutral-600',
  primary: 'bg-navy-100 text-navy-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'default',
  className,
  testId,
}: StatsCardProps) {
  return (
    <div
      data-testid={testId}
      className={cn(
        'rounded-lg border p-4 shadow-card',
        variantStyles[variant],
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-small text-neutral-600">{title}</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">{value}</p>
          {trend && (
            <div className={cn(
              'mt-1 flex items-center gap-1 text-xs font-medium',
              trend.direction === 'up' ? 'text-emerald-600' : 'text-red-600',
            )}>
              {trend.direction === 'up' ? (
                <TrendingUp className="h-3 w-3" aria-hidden="true" />
              ) : (
                <TrendingDown className="h-3 w-3" aria-hidden="true" />
              )}
              {trend.value}%
            </div>
          )}
        </div>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', iconStyles[variant])}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
