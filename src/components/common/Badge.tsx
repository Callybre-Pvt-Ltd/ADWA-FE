import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'danger' | 'neutral'
  className?: string
}

const variantClasses = {
  primary: 'bg-blue-50 text-[#0F4C81] border border-blue-100',
  secondary: 'bg-green-50 text-[#16A34A] border border-green-100',
  accent: 'bg-amber-50 text-amber-700 border border-amber-100',
  success: 'bg-green-50 text-green-700 border border-green-100',
  danger: 'bg-red-50 text-red-700 border border-red-100',
  neutral: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
}

export function Badge({ children, variant = 'primary', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold',
      variantClasses[variant],
      className,
    )}>
      {children}
    </span>
  )
}
