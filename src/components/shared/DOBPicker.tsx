import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const MONTHS = [
  { value: '01', hi: 'जनवरी',  en: 'January'   },
  { value: '02', hi: 'फ़रवरी', en: 'February'  },
  { value: '03', hi: 'मार्च',  en: 'March'     },
  { value: '04', hi: 'अप्रैल', en: 'April'     },
  { value: '05', hi: 'मई',     en: 'May'       },
  { value: '06', hi: 'जून',    en: 'June'      },
  { value: '07', hi: 'जुलाई',  en: 'July'      },
  { value: '08', hi: 'अगस्त',  en: 'August'    },
  { value: '09', hi: 'सितंबर', en: 'September' },
  { value: '10', hi: 'अक्टूबर',en: 'October'  },
  { value: '11', hi: 'नवंबर',  en: 'November'  },
  { value: '12', hi: 'दिसंबर', en: 'December'  },
]

interface DOBPickerProps {
  name: string
  error?: string
  minYear?: number
  maxYear?: number
}

export function DOBPicker({ name, error, minYear, maxYear }: DOBPickerProps) {
  const { setValue } = useFormContext()
  const { i18n } = useTranslation()
  const isHi = i18n.language === 'hi'

  // Own state — not derived from form field (avoids clearing loop)
  const [day,   setDay]   = useState('')
  const [month, setMonth] = useState('')
  const [year,  setYear]  = useState('')

  const currentYear = new Date().getFullYear()
  const yMin = minYear ?? currentYear - 65
  const yMax = maxYear ?? currentYear - 18
  const days  = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'))
  const years = Array.from({ length: yMax - yMin + 1 }, (_, i) => String(yMax - i))

  function commit(d: string, m: string, y: string) {
    const complete = Boolean(d && m && y)
    setValue(name, complete ? `${y}-${m}-${d}` : '', { shouldValidate: true })
  }

  const isComplete = Boolean(day && month && year)
  const hasError   = Boolean(error) && !isComplete

  const errCls = hasError ? '!border-red-500' : ''

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Select
            value={day || undefined}
            onValueChange={d => { setDay(d); commit(d, month, year) }}
          >
            <SelectTrigger className={errCls}>
              <SelectValue placeholder={isHi ? 'दिन' : 'Day'} />
            </SelectTrigger>
            <SelectContent>
              {days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-neutral-400 text-center">{isHi ? 'दिन' : 'Day'}</p>
        </div>

        <div>
          <Select
            value={month || undefined}
            onValueChange={m => { setMonth(m); commit(day, m, year) }}
          >
            <SelectTrigger className={errCls}>
              <SelectValue placeholder={isHi ? 'महीना' : 'Month'} />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map(m => (
                <SelectItem key={m.value} value={m.value}>
                  {isHi ? m.hi : m.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-neutral-400 text-center">{isHi ? 'महीना' : 'Month'}</p>
        </div>

        <div>
          <Select
            value={year || undefined}
            onValueChange={y => { setYear(y); commit(day, month, y) }}
          >
            <SelectTrigger className={errCls}>
              <SelectValue placeholder={isHi ? 'साल' : 'Year'} />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-neutral-400 text-center">{isHi ? 'साल' : 'Year'}</p>
        </div>
      </div>

      {hasError && (
        <p className="mt-2 text-sm font-medium text-red-600 flex items-center gap-1">
          <span aria-hidden>⚠</span> {error}
        </p>
      )}
    </div>
  )
}
