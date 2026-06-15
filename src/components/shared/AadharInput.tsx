import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { cn } from '@/utils/cn'

function formatGroups(digits: string): string {
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function maskDigits(digits: string): string {
  if (digits.length === 0) return ''
  const visible = digits.slice(-4)
  const masked = '•'.repeat(Math.max(0, digits.length - 4))
  return formatGroups(masked + visible)
}

interface AadharInputProps {
  name: string
  error?: string
}

export function AadharInput({ name, error }: AadharInputProps) {
  const { setValue, watch } = useFormContext()
  const [focused, setFocused] = useState(false)
  const raw = (watch(name) as string) ?? ''
  const digits = raw.replace(/\D/g, '')
  const isComplete = digits.length === 12

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newDigits = e.target.value.replace(/\D/g, '').slice(0, 12)
    setValue(name, newDigits, { shouldValidate: false })
  }

  function handleBlur() {
    setFocused(false)
    if (digits.length > 0) setValue(name, digits, { shouldValidate: true })
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      value={focused ? formatGroups(digits) : maskDigits(digits)}
      onChange={handleChange}
      onFocus={() => setFocused(true)}
      onBlur={handleBlur}
      placeholder="1234 5678 9012"
      maxLength={14}
      className={cn(
        'w-full rounded-2xl border-2 bg-white px-4 py-3 text-base font-mono text-neutral-900',
        'placeholder:text-neutral-400 placeholder:font-sans',
        'outline-none transition-all duration-150',
        'focus:ring-4 focus:ring-blue-100',
        error
          ? 'border-red-500 bg-red-50 focus:border-red-500'
          : isComplete
            ? 'border-green-600 bg-green-50 focus:border-green-600'
            : 'border-neutral-300 hover:border-neutral-400 focus:border-blue-600',
      )}
    />
  )
}
