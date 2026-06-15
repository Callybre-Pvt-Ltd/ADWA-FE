import type { LucideIcon } from 'lucide-react'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'

export interface StepConfig {
  id: number
  labelHi: string
  labelEn: string
  icon: LucideIcon
}

interface ApplicationStepperProps {
  steps: StepConfig[]
  current: number
}

export function ApplicationStepper({ steps, current }: ApplicationStepperProps) {
  const { i18n } = useTranslation()
  const isHi = i18n.language === 'hi'

  return (
    <nav aria-label="Application progress" className="w-full">
      <ol className="flex items-center justify-between">
        {steps.map((step, i) => {
          const done = i < current
          const active = i === current
          return (
            <li key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2 flex-1">
                <span
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-200',
                    done && 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-200',
                    active && 'border-blue-600 bg-white text-blue-700 ring-4 ring-blue-100',
                    !done && !active && 'border-neutral-300 bg-white text-neutral-400',
                  )}
                >
                  {done ? <Check size={16} strokeWidth={3} /> : <step.icon size={16} />}
                </span>
                <p className={cn(
                  'text-xs font-bold text-center leading-tight max-w-[72px]',
                  active ? 'text-blue-900' : done ? 'text-neutral-700' : 'text-neutral-400',
                )}>
                  {isHi ? step.labelHi : step.labelEn}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className={cn(
                  'flex-1 h-0.5 mx-2 rounded-full transition-colors duration-300',
                  done ? 'bg-blue-600' : 'bg-neutral-200',
                )} />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
