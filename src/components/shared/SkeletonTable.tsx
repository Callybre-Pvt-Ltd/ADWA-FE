import { cn } from '@/utils/cn'

export interface SkeletonTableProps {
  rows?: number
  className?: string
  testId?: string
}

export function SkeletonTable({ rows = 5, className, testId }: SkeletonTableProps) {
  return (
    <div data-testid={testId} className={cn('space-y-3', className)}>
      <div className="hidden md:block animate-pulse rounded-lg border border-neutral-200 overflow-hidden">
        <div className="h-10 bg-neutral-100" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 border-t border-neutral-200 p-4">
            <div className="h-4 w-1/4 rounded bg-neutral-200" />
            <div className="h-4 w-1/4 rounded bg-neutral-200" />
            <div className="h-4 w-1/4 rounded bg-neutral-200" />
            <div className="h-4 w-1/4 rounded bg-neutral-200" />
          </div>
        ))}
      </div>
      <div className="md:hidden space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg border border-neutral-200 p-4">
            <div className="h-4 w-2/3 rounded bg-neutral-200" />
            <div className="mt-2 h-3 w-1/2 rounded bg-neutral-200" />
          </div>
        ))}
      </div>
    </div>
  )
}
