import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/utils/cn'

export interface AppModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
  testId?: string
  loading?: boolean
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export function AppModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
  testId,
  loading,
}: AppModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && !loading && onClose()}>
      <DialogContent
        data-testid={testId}
        aria-busy={loading || undefined}
        className={cn(
          sizeClasses[size],
          'hidden md:grid',
          loading && '[&>button]:pointer-events-none [&>button]:opacity-30',
          className,
        )}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        {footer}
      </DialogContent>
    </Dialog>
  )
}
