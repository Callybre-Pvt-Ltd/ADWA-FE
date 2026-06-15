import { cn } from '@/utils/cn'

export interface SkeletonCardProps {
  className?: string
  testId?: string
}

export function SkeletonCard({ className, testId }: SkeletonCardProps) {
  return (
    <div
      data-testid={testId}
      className={cn(
        'animate-pulse rounded-lg border border-neutral-200 bg-white p-6',
        className,
      )}
    >
      <div className="h-4 w-1/3 rounded bg-neutral-200" />
      <div className="mt-4 h-8 w-1/2 rounded bg-neutral-200" />
      <div className="mt-4 h-3 w-full rounded bg-neutral-200" />
    </div>
  )
}
