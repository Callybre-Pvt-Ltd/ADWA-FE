import { useFormContext } from 'react-hook-form'
import { cn } from '@/utils/cn'

const BLOOD_GROUPS = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A−' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B−' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O−' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB−' },
]

interface BloodGroupSelectorProps {
  name: string
  error?: string
}

export function BloodGroupSelector({ name, error }: BloodGroupSelectorProps) {
  const { setValue, watch } = useFormContext()
  const selected = watch(name) as string

  return (
    <div>
      <div className="grid grid-cols-4 gap-3">
        {BLOOD_GROUPS.map(bg => (
          <button
            key={bg.value}
            type="button"
            onClick={() => setValue(name, bg.value, { shouldValidate: true })}
            className={cn(
              'h-[72px] rounded-xl border-2 text-lg font-bold transition-all',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-100',
              'active:scale-95',
              selected === bg.value
                ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                : 'border-neutral-200 bg-white text-neutral-700 hover:border-blue-400 hover:bg-blue-50'
            )}
          >
            {bg.label}
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}
