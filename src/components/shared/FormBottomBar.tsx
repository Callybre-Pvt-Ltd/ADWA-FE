import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'

interface FormBottomBarProps {
  onBack?: () => void
  onNext: () => void
  nextLabel: string
  showBack: boolean
  isLoading?: boolean
  isSubmit?: boolean
  disabled?: boolean
}

export function FormBottomBar({ onBack, onNext, nextLabel, showBack, isLoading, isSubmit, disabled }: FormBottomBarProps) {
  const { t } = useTranslation('common')
  const backLabel = t('buttons.back')
  return (
    <div className="flex items-center justify-between pt-6 mt-6 border-t-2 border-neutral-100">
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 h-12 rounded-xl border-2 border-neutral-200 text-neutral-700 font-semibold hover:border-neutral-400 transition-colors"
        >
          <ChevronLeft size={18} /> {backLabel}
        </button>
      ) : <div />}

      <button
        type="button"
        onClick={onNext}
        disabled={isLoading || disabled}
        className={cn(
          'flex items-center gap-2 px-8 h-12 rounded-xl text-white font-bold transition-all',
          isSubmit ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {isLoading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            {nextLabel}
            <ChevronRight size={18} />
          </>
        )}
      </button>
    </div>
  )
}
