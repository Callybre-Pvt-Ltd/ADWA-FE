import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'

interface FormFieldProps {
  label: string
  htmlFor?: string
  required?: boolean
  optional?: boolean
  hint?: string
  error?: string
  /** span both columns on desktop */
  fullWidth?: boolean
  className?: string
  children: ReactNode
}

export function FormField({
  label, htmlFor, required, optional,
  hint, error, fullWidth, className, children,
}: FormFieldProps) {
  const { t } = useTranslation('common')
  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'md:col-span-2', className)}>
      <label htmlFor={htmlFor} className="flex items-center gap-1.5 cursor-pointer">
        <span className="text-sm font-semibold text-neutral-800">{label}</span>
        {required && <span className="text-red-500 text-sm leading-none">*</span>}
        {optional && (
          <span className="text-xs font-normal text-neutral-400 ml-0.5">
            ({t('optional', 'Optional')})
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-neutral-400 leading-relaxed">{hint}</p>
      )}
      {error && (
        <p className="text-xs font-semibold text-red-600 flex items-center gap-1">
          <span aria-hidden>⚠</span> {error}
        </p>
      )}
    </div>
  )
}

interface FormSectionProps {
  icon?: ReactNode
  title: string
  subtitle?: string
  /** use single-column stack instead of 2-col grid */
  singleCol?: boolean
  children: ReactNode
  className?: string
}

export function FormSection({ icon, title, subtitle, singleCol, children, className }: FormSectionProps) {
  return (
    <section className={cn('space-y-5', className)}>
      <div className="flex items-center gap-2.5 pb-3 border-b-2 border-neutral-100">
        {icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            {icon}
          </span>
        )}
        <div>
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">{title}</h3>
          {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className={cn(
        singleCol
          ? 'space-y-5'
          : 'grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5',
      )}>
        {children}
      </div>
    </section>
  )
}
