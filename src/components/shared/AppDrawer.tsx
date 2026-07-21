import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { slideInRight } from '@/utils/animations'
import { Button } from '@/components/ui/button'

export interface AppDrawerProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  side?: 'left' | 'right' | 'bottom'
  size?: 'sm' | 'md' | 'lg' | 'full'
  className?: string
  testId?: string
  loading?: boolean
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  full: 'max-w-full',
}

export function AppDrawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  side = 'right',
  size = 'md',
  className,
  testId,
  loading,
}: AppDrawerProps) {
  const isBottom = side === 'bottom'
  const requestClose = () => {
    if (!loading) onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-neutral-900/50"
            onClick={requestClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            aria-busy={loading || undefined}
            data-testid={testId}
            {...slideInRight}
            className={cn(
              'fixed z-50 flex flex-col bg-white shadow-lg',
              isBottom
                ? 'inset-x-0 bottom-0 max-h-[90vh] rounded-t-xl md:hidden'
                : cn(
                    'top-0 h-full',
                    side === 'right' ? 'right-0' : 'left-0',
                    'hidden md:flex',
                    sizeClasses[size],
                    'w-full',
                  ),
              !isBottom && 'max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:h-[90vh] max-md:rounded-t-xl max-md:flex md:flex',
              className,
            )}
          >
            <div className="flex items-start justify-between border-b border-neutral-200 p-4">
              <div>
                <h2 className="text-h3 text-neutral-900">{title}</h2>
                {description && (
                  <p className="mt-1 text-small text-neutral-600">{description}</p>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={requestClose} disabled={loading} aria-label="Close drawer">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{children}</div>
            {footer && (
              <div className="sticky bottom-0 border-t border-neutral-200 bg-white p-4">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
