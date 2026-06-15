import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  className?: string
  testId?: string
}

export function EmptyState({ icon: Icon, title, description, action, className, testId }: EmptyStateProps) {
  return (
    <div
      data-testid={testId}
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className,
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
        <Icon className="h-7 w-7 text-neutral-400" aria-hidden="true" />
      </div>
      <h3 className="text-h3 text-neutral-900">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-body text-neutral-600">{description}</p>
      )}
      {action && (
        <Button className="mt-6 w-full md:w-auto" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
