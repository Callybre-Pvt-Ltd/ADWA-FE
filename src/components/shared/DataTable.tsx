import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { matchesLocalizedSearch, normalizeSearchForApi } from '@/utils/translations'
import { useDebouncedValue } from '@/hooks/useDebounce'

export interface ColumnDef<T> {
  key: string
  header: string
  cell: (row: T) => React.ReactNode
  sortable?: boolean
  sortValue?: (row: T) => string | number
  className?: string
}

export interface ServerPaginationProps {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  onPageChange: (page: number) => void
  searchValue?: string
  onSearchChange?: (search: string) => void
}

export interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  isLoading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  onRowClick?: (row: T) => void
  onRowHover?: (row: T) => void
  emptyState?: React.ReactNode
  className?: string
  testId?: string
  getRowKey: (row: T) => string
  actions?: React.ReactNode
  pagination?: ServerPaginationProps
}

const PAGE_SIZE = 10
// Fires the API call this long after the user stops typing. 50ms used to be
// well under a typical inter-keystroke gap, so it fired a request on nearly
// every keystroke anyway — this is a real debounce window.
const SERVER_SEARCH_DEBOUNCE_MS = 350

export function DataTable<T>({
  data,
  columns,
  searchable,
  searchPlaceholder = 'Search...',
  onRowClick,
  onRowHover,
  emptyState,
  className,
  testId,
  getRowKey,
  actions,
  pagination,
}: DataTableProps<T>) {
  const { i18n } = useTranslation()
  const isHi = i18n.language === 'hi'
  const [localSearch, setLocalSearch] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [localPage, setLocalPage] = useState(0)

  const isServer = Boolean(pagination)
  // Keep the input local while typing; only notify the parent (and thus fire
  // the API call) once typing pauses, so a search word doesn't cost one
  // request per keystroke.
  const [serverDraft, setServerDraft] = useState(pagination?.searchValue ?? '')
  const debouncedServerDraft = useDebouncedValue(serverDraft, SERVER_SEARCH_DEBOUNCE_MS)
  const onSearchChangeRef = useRef(pagination?.onSearchChange)
  onSearchChangeRef.current = pagination?.onSearchChange
  const committedSearchRef = useRef(pagination?.searchValue ?? '')

  useEffect(() => {
    if (!isServer || !onSearchChangeRef.current) return
    if (debouncedServerDraft === committedSearchRef.current) return
    committedSearchRef.current = debouncedServerDraft
    // Hindi UI labels → English DB values so server search still matches
    onSearchChangeRef.current?.(normalizeSearchForApi(debouncedServerDraft))
  }, [debouncedServerDraft, isServer])

  const search = isServer ? serverDraft : localSearch

  const handleSearchChange = (value: string) => {
    if (isServer && pagination?.onSearchChange) {
      setServerDraft(value)
    } else {
      setLocalSearch(value)
      setLocalPage(0)
    }
  }

  const filtered = useMemo(() => {
    let result = [...data]
    if (!isServer && search) {
      result = result.filter((row) => {
        const fields = columns.map((col) => {
          if (col.sortValue) return col.sortValue(row)
          const rendered = col.cell(row)
          return typeof rendered === 'string' || typeof rendered === 'number' ? rendered : ''
        })
        return matchesLocalizedSearch(fields, search)
      })
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
  }, [data, search, sortKey, sortDir, columns, isServer])

  const totalPages = isServer ? (pagination?.totalPages ?? 1) : Math.ceil(filtered.length / PAGE_SIZE)
  const paged = isServer ? data : filtered.slice(localPage * PAGE_SIZE, (localPage + 1) * PAGE_SIZE)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const isEmpty = (isServer ? data : filtered).length === 0
  const emptyContent = emptyState ?? (
    <p className="py-8 text-center text-sm text-neutral-500">
      {isHi ? 'कोई डेटा नहीं मिला' : 'No data found'}
    </p>
  )

  const currentPage = isServer ? (pagination?.page ?? 1) : localPage + 1
  const totalItemCount = isServer ? (pagination?.totalItems ?? data.length) : filtered.length

  const handlePrevPage = () => {
    if (isServer) {
      if (pagination && pagination.page > 1) {
        pagination.onPageChange(pagination.page - 1)
      }
    } else {
      setLocalPage((p) => Math.max(0, p - 1))
    }
  }

  const handleNextPage = () => {
    if (isServer) {
      if (pagination && pagination.page < totalPages) {
        pagination.onPageChange(pagination.page + 1)
      }
    } else {
      setLocalPage((p) => p + 1)
    }
  }

  const isPrevDisabled = isServer ? (pagination ? pagination.page <= 1 : true) : localPage === 0
  const isNextDisabled = isServer
    ? (pagination ? pagination.page >= totalPages : true)
    : localPage >= totalPages - 1

  return (
    <div data-testid={testId} className={cn('space-y-4', className)}>
      {(searchable || actions) && (
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
          {searchable && (
            <div className="relative w-full sm:w-72 max-w-none sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={searchPlaceholder === 'Search...' && isHi ? 'खोजें...' : searchPlaceholder}
                className="pl-9"
                aria-label="Search table"
              />
            </div>
          )}
          {actions && <div className="w-full sm:w-auto flex items-center gap-2">{actions}</div>}
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
            {isEmpty && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6">
                  {emptyContent}
                </td>
              </tr>
            )}
            {paged.map((row) => (
              <tr
                key={getRowKey(row)}
                onClick={() => onRowClick?.(row)}
                onMouseEnter={() => onRowHover?.(row)}
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
        {isEmpty && (
          <div className="rounded-lg border border-neutral-200 p-4">{emptyContent}</div>
        )}
        {paged.map((row) => (
          <div
            key={getRowKey(row)}
            onClick={() => onRowClick?.(row)}
            onMouseEnter={() => onRowHover?.(row)}
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

      {(totalPages > 1 || (isServer && totalItemCount > 0)) && (
        <div className="flex items-center justify-between">
          <p className="text-small text-neutral-600">
            {isHi
              ? `पृष्ठ ${currentPage} / ${totalPages} (कुल ${totalItemCount} आइटम)`
              : `Page ${currentPage} of ${totalPages} (${totalItemCount} items)`}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isPrevDisabled}
              onClick={handlePrevPage}
              className="cursor-pointer"
            >
              {isHi ? 'पिछला' : 'Previous'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isNextDisabled}
              onClick={handleNextPage}
              className="cursor-pointer"
            >
              {isHi ? 'अगला' : 'Next'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

