import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Input } from '@/components/ui/input'

export type DistrictOption = {
  id: string
  name: string
}

type DistrictSearchSelectProps = {
  districts: DistrictOption[]
  value?: string
  onChange: (id: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
}

export function DistrictSearchSelect({
  districts,
  value,
  onChange,
  placeholder = 'Select district',
  searchPlaceholder = 'Search district…',
  emptyText = 'No district found',
  disabled = false,
  className,
}: DistrictSearchSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  const selected = districts.find((d) => d.id === value)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return districts
    return districts.filter((d) => d.name.toLowerCase().includes(q))
  }, [districts, query])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  const pick = (id: string) => {
    onChange(id)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex h-11 w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-900 shadow-sm',
          'hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        <span className={cn(!selected && 'text-neutral-400')}>
          {selected?.name ?? placeholder}
        </span>
        <ChevronDown
          size={16}
          className={cn('shrink-0 text-neutral-400 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
          <div className="border-b border-neutral-100 p-2">
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <Input
                autoFocus
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 pl-9"
              />
            </div>
          </div>
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-neutral-400">{emptyText}</li>
            ) : (
              filtered.map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => pick(d.id)}
                    className={cn(
                      'flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-neutral-50',
                      d.id === value && 'bg-blue-50 text-blue-800',
                    )}
                  >
                    <span>{d.name}</span>
                    {d.id === value && <Check size={15} className="shrink-0" />}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
