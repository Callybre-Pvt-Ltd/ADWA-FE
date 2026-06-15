import { AlertCircle } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'

export interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  className?: string
  testId?: string
}

export function ErrorState({
  message = 'Something went wrong',
  onRetry,
  className,
  testId,
}: ErrorStateProps) {
  return (
    <div
      data-testid={testId}
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className,
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <AlertCircle className="h-7 w-7 text-red-600" aria-hidden="true" />
      </div>
      <h3 className="text-h3 text-neutral-900">Error loading data</h3>
      <p className="mt-2 text-body text-neutral-600">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-6" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
