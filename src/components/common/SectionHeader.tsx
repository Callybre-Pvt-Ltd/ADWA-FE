import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  center?: boolean
  className?: string
}

export function SectionHeader({ title, subtitle, center = true, className }: SectionHeaderProps) {
  return (
    <div className={cn(center && 'text-center', 'mb-12', className)}>
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 mb-3">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base md:text-lg text-neutral-500 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  )
}
