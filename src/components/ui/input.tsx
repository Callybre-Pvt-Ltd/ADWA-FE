import * as React from 'react'
import { cn } from '@/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'w-full rounded-2xl border-2 border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900',
        'placeholder:text-neutral-400',
        'outline-none transition-all duration-150',
        'hover:border-neutral-400',
        'focus:border-blue-600 focus:ring-4 focus:ring-blue-100',
        'disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-60',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
