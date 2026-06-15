import * as React from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/utils/cn'

// ─── Context ─────────────────────────────────────────────────────────────────

interface SelectCtx {
  value: string | undefined
  onValueChange: (v: string) => void
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  disabled: boolean
  placeholder: string | undefined
  triggerRef: React.RefObject<HTMLButtonElement | null>
  // label of the selected item — set by SelectItem when it mounts/updates
  selectedLabel: React.ReactNode
  setSelectedLabel: (l: React.ReactNode) => void
}

const SelectContext = React.createContext<SelectCtx | null>(null)

function useSelectCtx() {
  const ctx = React.useContext(SelectContext)
  if (!ctx) throw new Error('Select compound component outside <Select>')
  return ctx
}

// ─── Root ─────────────────────────────────────────────────────────────────────

interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (v: string) => void
  disabled?: boolean
  children: React.ReactNode
}

export function Select({ value, defaultValue, onValueChange, disabled = false, children }: SelectProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedLabel, setSelectedLabel] = React.useState<React.ReactNode>(undefined)
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  // Collect placeholder from SelectValue child
  let placeholder: string | undefined
  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return
    if ((child.type as { _role?: string })._role === 'trigger') {
      React.Children.forEach((child.props as { children?: React.ReactNode }).children, c => {
        if (React.isValidElement(c) && (c.type as { _role?: string })._role === 'value') {
          placeholder = (c.props as { placeholder?: string }).placeholder
        }
      })
    }
  })

  // Close on outside click
  React.useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (!triggerRef.current?.closest('[data-select-root]')?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  return (
    <SelectContext.Provider
      value={{
        value: value ?? defaultValue,
        onValueChange: (v) => { onValueChange?.(v); setOpen(false) },
        open,
        setOpen,
        disabled,
        placeholder,
        triggerRef,
        selectedLabel,
        setSelectedLabel,
      }}
    >
      <div data-select-root className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

// ─── Trigger ──────────────────────────────────────────────────────────────────

export function SelectTrigger({ className, children }: { className?: string; children?: React.ReactNode }) {
  const { value, open, setOpen, disabled, triggerRef } = useSelectCtx()

  return (
    <button
      ref={triggerRef}
      type="button"
      disabled={disabled}
      onClick={() => setOpen(o => !o)}
      className={cn(
        'flex w-full items-center justify-between gap-2',
        'rounded-2xl border-2 border-neutral-300 bg-white px-4 py-3 text-base',
        'outline-none transition-all duration-150',
        'hover:border-neutral-400',
        open && 'border-blue-600 ring-4 ring-blue-100',
        !value ? 'text-neutral-400' : 'text-neutral-900',
        'disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-60',
        className,
      )}
    >
      {children}
      <ChevronDown
        size={18}
        className={cn('shrink-0 text-neutral-500 transition-transform duration-200', open && 'rotate-180')}
      />
    </button>
  )
}
;(SelectTrigger as { _role?: string })._role = 'trigger'

// ─── Value ────────────────────────────────────────────────────────────────────

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const { selectedLabel, placeholder: ctxPlaceholder } = useSelectCtx()
  const ph = placeholder ?? ctxPlaceholder ?? 'Select…'
  return <span className="truncate">{selectedLabel ?? ph}</span>
}
;(SelectValue as { _role?: string })._role = 'value'

// ─── Content ──────────────────────────────────────────────────────────────────

export function SelectContent({ className, children }: { className?: string; children: React.ReactNode }) {
  const { open } = useSelectCtx()
  if (!open) return null

  return (
    <div
      className={cn(
        'absolute left-0 right-0 top-[calc(100%+6px)] z-50',
        'rounded-2xl border-2 border-neutral-200 bg-white shadow-xl',
        'max-h-64 overflow-y-auto py-1.5',
        className,
      )}
    >
      {children}
    </div>
  )
}

// ─── Item ─────────────────────────────────────────────────────────────────────

interface SelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

export function SelectItem({ value, children, className }: SelectItemProps) {
  const { value: selected, onValueChange, setSelectedLabel } = useSelectCtx()
  const isSelected = selected === value

  // Register label whenever this item is the selected one
  React.useEffect(() => {
    if (isSelected) setSelectedLabel(children)
  }, [isSelected, children])

  return (
    <button
      type="button"
      onClick={() => { setSelectedLabel(children); onValueChange(value) }}
      className={cn(
        'flex w-full items-center justify-between px-4 py-2.5 text-sm text-neutral-800',
        'transition-colors duration-100 outline-none text-left',
        'hover:bg-blue-50 hover:text-blue-700',
        isSelected && 'bg-blue-50 text-blue-700 font-semibold',
        className,
      )}
    >
      <span>{children}</span>
      {isSelected && <Check size={15} className="shrink-0 text-blue-600" />}
    </button>
  )
}
;(SelectItem as { _role?: string })._role = 'item'

export function SelectGroup({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
