import { cn } from '@/utils/cn'

export interface BilingualLabelProps {
  english: string
  hindi: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  align?: 'left' | 'center'
}

const sizeClasses = {
  sm: { en: 'text-base font-semibold', hi: 'text-sm text-neutral-600' },
  md: { en: 'text-lg font-bold', hi: 'text-base text-neutral-600' },
  lg: { en: 'text-xl font-bold text-blue-900', hi: 'text-base text-neutral-600 mt-0.5' },
}

export function BilingualLabel({ english, hindi, size = 'md', className, align = 'left' }: BilingualLabelProps) {
  const s = sizeClasses[size]
  return (
    <div className={cn(align === 'center' && 'text-center', className)}>
      <p className={cn(s.en, 'text-neutral-900')}>{english}</p>
      <p className={s.hi}>{hindi}</p>
    </div>
  )
}
