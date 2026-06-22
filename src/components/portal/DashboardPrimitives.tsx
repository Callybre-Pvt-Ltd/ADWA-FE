import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatDateTime } from '@/utils/formatters'
import type { ActivityItem, ChartDataPoint } from '@/types/common.types'

export function DashboardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-10 border-b border-neutral-200 pb-6">
      <h1 className="text-2xl font-medium tracking-tight text-neutral-900">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
    </header>
  )
}

export function StatGrid({
  items,
  loading,
}: {
  items: { label: string; value: number | string }[]
  loading?: boolean
}) {
  if (loading) {
    return (
      <div className="grid gap-px bg-neutral-200 sm:grid-cols-2 lg:grid-cols-4 border border-neutral-200">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 animate-pulse">
            <div className="h-3 w-20 bg-neutral-100 rounded" />
            <div className="mt-3 h-8 w-12 bg-neutral-100 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-px bg-neutral-200 sm:grid-cols-2 lg:grid-cols-4 border border-neutral-200">
      {items.map((item) => (
        <div key={item.label} className="bg-white px-6 py-5">
          <p className="text-xs uppercase tracking-wider text-neutral-400">{item.label}</p>
          <p className="mt-2 text-3xl font-light tabular-nums text-neutral-900">{item.value}</p>
        </div>
      ))}
    </div>
  )
}

export function DashboardSection({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('border border-neutral-200 bg-white', className)}>
      <div className="border-b border-neutral-100 px-5 py-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-neutral-500">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

export function QuickLinks({ links }: { links: { to: string; label: string }[] }) {
  return (
    <ul className="divide-y divide-neutral-100">
      {links.map((link) => (
        <li key={link.to}>
          <Link
            to={link.to}
            className="group flex items-center justify-between py-3 text-sm text-neutral-800 hover:text-neutral-900 transition-colors"
          >
            <span>{link.label}</span>
            <ArrowUpRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-600" />
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function SimpleBars({ data }: { data: ChartDataPoint[] }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <ul className="space-y-3">
      {data.map((row) => (
        <li key={row.label}>
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>{row.label}</span>
            <span className="tabular-nums text-neutral-900">{row.value}</span>
          </div>
          <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-neutral-900 rounded-full transition-all"
              style={{ width: `${(row.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function ActivityList({
  items,
  empty,
}: {
  items: ActivityItem[]
  empty: string
}) {
  if (!items.length) {
    return <p className="text-sm text-neutral-400 py-4">{empty}</p>
  }
  return (
    <ul className="divide-y divide-neutral-100">
      {items.map((item) => (
        <li key={item.id} className="flex items-start justify-between gap-4 py-3 text-sm">
          <span className="text-neutral-700 leading-snug">{item.message}</span>
          <time className="shrink-0 text-xs text-neutral-400 tabular-nums">
            {formatDateTime(item.timestamp)}
          </time>
        </li>
      ))}
    </ul>
  )
}

export function EmptyChart({ message }: { message: string }) {
  return <p className="text-sm text-neutral-400 py-8 text-center">{message}</p>
}
