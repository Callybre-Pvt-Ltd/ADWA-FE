import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface SectionHeadingProps {
  title: string
  subtitle?: string
  action?: ReactNode
  align?: 'left' | 'center'
  className?: string
  testId?: string
  light?: boolean
}

export function SectionHeading({
  title,
  subtitle,
  action,
  align = 'left',
  className,
  testId,
  light = false,
}: SectionHeadingProps) {
  return (
    <div
      data-testid={testId}
      className={cn(
        'mb-10 flex flex-col gap-4',
        align === 'center' && 'items-center text-center',
        align === 'left' && 'md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className={cn(align === 'center' && 'flex flex-col items-center')}>
        <div className={cn('section-accent-bar', align === 'center' && 'mx-auto', light && 'section-accent-bar-light')} />
        <h2 className={cn(
          'text-2xl md:text-3xl font-extrabold tracking-tight',
          light ? 'text-white' : 'text-blue-900',
        )}>
          {title}
        </h2>
        {subtitle && (
          <p className={cn(
            'mt-2 text-base md:text-lg max-w-2xl leading-relaxed',
            light ? 'text-blue-100' : 'text-neutral-600',
          )}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}
