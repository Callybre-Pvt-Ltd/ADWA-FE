import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export interface ColumnDef<T> {
  key: string
  header: string
  cell: (row: T) => React.ReactNode
  sortable?: boolean
  sortValue?: (row: T) => string | number
  className?: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  isLoading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  onRowClick?: (row: T) => void
  emptyState?: React.ReactNode
  className?: string
  testId?: string
  getRowKey: (row: T) => string
}

const PAGE_SIZE = 10

export function DataTable<T>({
  data,
  columns,
  searchable,
  searchPlaceholder = 'Search...',
  onRowClick,
  emptyState,
  className,
  testId,
  getRowKey,
}: DataTableProps<T>) {
  const { i18n } = useTranslation()
  const isHi = i18n.language === 'hi'
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    let result = [...data]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((row) =>
        columns.some((col) => {
          const val = col.sortValue?.(row) ?? String(col.cell(row))
          return String(val).toLowerCase().includes(q)
        }),
      )
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey)
      if (col?.sortValue) {
        result.sort((a, b) => {
          const av = col.sortValue!(a)
          const bv = col.sortValue!(b)
          const cmp = av < bv ? -1 : av > bv ? 1 : 0
          return sortDir === 'asc' ? cmp : -cmp
        })
      }
    }
    return result
  }, [data, search, sortKey, sortDir, columns])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  if (!filtered.length && emptyState) return <>{emptyState}</>

  return (
    <div data-testid={testId} className={cn('space-y-4', className)}>
      {searchable && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            placeholder={searchPlaceholder === 'Search...' && isHi ? 'खोजें...' : searchPlaceholder}
            className="pl-9"
            aria-label="Search table"
          />
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-neutral-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left font-medium text-neutral-600',
                    col.sortable && 'cursor-pointer select-none',
                    col.className,
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => (
              <tr
                key={getRowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'border-b border-neutral-200',
                  onRowClick && 'cursor-pointer hover:bg-neutral-50:bg-neutral-800/50',
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3', col.className)}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {paged.map((row) => (
          <div
            key={getRowKey(row)}
            onClick={() => onRowClick?.(row)}
            className={cn(
              'rounded-lg border border-neutral-200 p-4',
              onRowClick && 'cursor-pointer active:bg-neutral-50:bg-neutral-800',
            )}
          >
            {columns.map((col) => (
              <div key={col.key} className="flex justify-between py-1 gap-2">
                <span className="text-caption text-neutral-500 shrink-0">{col.header}</span>
                <span className="text-sm text-right">{col.cell(row)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-small text-neutral-600">
            {isHi 
              ? `पृष्ठ ${page + 1} / ${totalPages} (कुल ${filtered.length} आइटम)`
              : `Page ${page + 1} of ${totalPages} (${filtered.length} items)`}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="cursor-pointer">
              {isHi ? 'पिछला' : 'Previous'}
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} className="cursor-pointer">
              {isHi ? 'अगला' : 'Next'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
