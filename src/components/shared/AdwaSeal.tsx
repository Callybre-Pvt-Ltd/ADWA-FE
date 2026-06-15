import { ShieldCheck } from 'lucide-react'
import { cn } from '@/utils/cn'

interface AdwaSealProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'h-9 w-9 text-[8px]',
  md: 'h-11 w-11 text-[9px]',
  lg: 'h-16 w-16 text-[10px]',
}

export function AdwaSeal({ size = 'md', className }: AdwaSealProps) {
  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-full font-black text-white',
        sizes[size],
        className,
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 p-[2px] shadow-md shadow-orange-500/30">
        <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center">
          <ShieldCheck className="absolute h-[50%] w-[50%] text-blue-300 opacity-50" />
          <span className="relative z-10 tracking-tighter leading-none">ADWA</span>
        </div>
      </div>
    </div>
  )
}
