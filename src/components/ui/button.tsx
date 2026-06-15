import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

/** Three variants only: primary (blue), outline, accent (orange — max 1 per page) */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-h-[3.25rem] md:min-h-[3rem] px-8',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm border-0',
        secondary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm border-0',
        accent: 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm border-0',
        outline: 'border-2 border-blue-600 bg-transparent text-blue-700 hover:bg-blue-50',
        ghost: 'text-neutral-800 hover:bg-neutral-100 min-h-0 px-3',
        destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
        success: 'bg-green-600 text-white hover:bg-green-700 shadow-sm',
      },
      size: {
        default: 'min-h-[3.25rem] md:min-h-[3rem] px-8 text-base',
        sm: 'min-h-[2.75rem] px-5 text-base',
        lg: 'min-h-[3.5rem] px-8 text-lg w-full sm:w-auto',
        icon: 'h-11 w-11 min-h-0 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = 'Button'

export { buttonVariants }
