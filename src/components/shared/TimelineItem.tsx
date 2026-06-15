import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/formatters'

export interface TimelineItemProps {
  title: string
  description?: string
  date?: string
  isLast?: boolean
  className?: string
  testId?: string
}

export function TimelineItem({
  title,
  description,
  date,
  isLast,
  className,
  testId,
}: TimelineItemProps) {
  return (
    <div data-testid={testId} className={cn('relative flex gap-4 pb-8', className)}>
      {!isLast && (
        <div className="absolute left-[11px] top-6 h-full w-0.5 bg-neutral-200" aria-hidden="true" />
      )}
      <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-royal-600 bg-white">
        <div className="h-2 w-2 rounded-full bg-royal-600" />
      </div>
      <div className="flex-1 pt-0.5">
        <h4 className="text-h4 text-neutral-900">{title}</h4>
        {description && (
          <p className="mt-1 text-body text-neutral-600">{description}</p>
        )}
        {date && (
          <time className="mt-1 block text-caption text-neutral-500">{formatDate(date)}</time>
        )}
      </div>
    </div>
  )
}
