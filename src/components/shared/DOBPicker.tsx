import { useEffect, useState } from 'react'
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
  name?: string
  error?: string
  minYear?: number
  maxYear?: number
  value?: string
  onChange?: (val: string) => void
}

export function DOBPicker({ name, error, minYear, maxYear, value: controlledValue, onChange }: DOBPickerProps) {
  const formContext = useFormContext()
  const setValue = formContext?.setValue
  const watch = formContext?.watch
  const getValues = formContext?.getValues

  const rhfValue = name && watch ? (watch(name) ?? getValues?.(name)) as string | undefined : undefined
  const rawValue = controlledValue ?? rhfValue

  const { i18n } = useTranslation()
  const isHi = i18n.language === 'hi'

  const parseDate = (val?: string) => {
    if (val && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const [y, m, d] = val.split('-')
      return { y, m, d }
    }
    return { y: '', m: '', d: '' }
  }

  const initial = parseDate(rawValue)
  const [day,   setDay]   = useState(initial.d)
  const [month, setMonth] = useState(initial.m)
  const [year,  setYear]  = useState(initial.y)

  useEffect(() => {
    const { y, m, d } = parseDate(rawValue)
    setYear(y)
    setMonth(m)
    setDay(d)
  }, [rawValue])

  const currentYear = new Date().getFullYear()
  const yMin = minYear ?? currentYear - 65
  const yMax = maxYear ?? currentYear - 18
  const years = Array.from({ length: yMax - yMin + 1 }, (_, i) => String(yMax - i))

  const getDaysInMonth = (m: string, y: string) => {
    if (!m) return 31
    const monthNum = parseInt(m, 10)
    if ([1, 3, 5, 7, 8, 10, 12].includes(monthNum)) return 31
    if ([4, 6, 9, 11].includes(monthNum)) return 30
    if (monthNum === 2) {
      if (!y) return 29 // default to 29 until a year is chosen
      const yearNum = parseInt(y, 10)
      const isLeap = (yearNum % 4 === 0 && yearNum % 100 !== 0) || (yearNum % 400 === 0)
      return isLeap ? 29 : 28
    }
    return 31
  }

  const daysCount = getDaysInMonth(month, year)
  const days = Array.from({ length: daysCount }, (_, i) => String(i + 1).padStart(2, '0'))

  function commit(d: string, m: string, y: string) {
    const complete = Boolean(d && m && y)
    const formatted = complete ? `${y}-${m}-${d}` : ''
    if (name && setValue) {
      setValue(name, formatted, { shouldValidate: complete })
    }
    onChange?.(formatted)
  }

  const showError = Boolean(error)
  const errCls = showError ? '!border-red-500' : ''

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {/* Month Selector (First) */}
        <div>
          <Select
            value={month || undefined}
            onValueChange={m => {
              setMonth(m)
              const maxDays = getDaysInMonth(m, year)
              let currentDay = day
              if (day && parseInt(day, 10) > maxDays) {
                currentDay = String(maxDays).padStart(2, '0')
                setDay(currentDay)
              }
              commit(currentDay, m, year)
            }}
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
        </div>

        {/* Day Selector (Second) */}
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
        </div>

        {/* Year Selector (Third) */}
        <div>
          <Select
            value={year || undefined}
            onValueChange={y => {
              setYear(y)
              const maxDays = getDaysInMonth(month, y)
              let currentDay = day
              if (day && parseInt(day, 10) > maxDays) {
                currentDay = String(maxDays).padStart(2, '0')
                setDay(currentDay)
              }
              commit(currentDay, month, y)
            }}
          >
            <SelectTrigger className={errCls}>
              <SelectValue placeholder={isHi ? 'साल' : 'Year'} />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
