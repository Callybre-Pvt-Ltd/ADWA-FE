import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
  testId?: string
}

export function PageHeader({ title, subtitle, action, className, testId }: PageHeaderProps) {
  return (
    <div
      data-testid={testId}
      className={cn('flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between', className)}
    >
      <div>
        <h1 className="text-h1 text-neutral-900">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-body text-neutral-600">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
