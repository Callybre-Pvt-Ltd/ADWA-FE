import * as React from 'react'
import { cn } from '@/utils/cn'

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn('text-base font-bold text-neutral-900', className)}
    {...props}
  />
))
Label.displayName = 'Label'
