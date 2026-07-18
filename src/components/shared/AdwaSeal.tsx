import logoImg from '@/assets/logo.png'
import { cn } from '@/utils/cn'

interface AdwaSealProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-16 w-16',
}

export function AdwaSeal({ size = 'md', className }: AdwaSealProps) {
  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-full bg-white shadow-sm overflow-hidden border border-neutral-100',
        sizes[size],
        className,
      )}
    >
      <img
        src={logoImg}
        alt="ADWA Logo"
        className="h-full w-full object-cover scale-[1.35]"
      />
    </div>
  )
}
