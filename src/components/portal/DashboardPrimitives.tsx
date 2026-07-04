import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, TrendingDown, TrendingUp, Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts'
import { cn } from '@/utils/cn'
import { formatDateTime, formatCurrency } from '@/utils/formatters'
import type { ActivityItem, ChartDataPoint, DistrictPerformanceRow } from '@/types/common.types'

// ─── Legacy exports (kept for non-dashboard pages) ──────────────────────────

export function DashboardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-6 border-b border-neutral-200 pb-5">
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
    </header>
  )
}

export function StatGrid({ items, loading }: { items: { label: string; value: number | string }[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="h-3 w-20 rounded bg-neutral-100" />
            <div className="mt-3 h-8 w-12 rounded bg-neutral-100" />
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-neutral-400">{item.label}</p>
          <p className="mt-2 text-3xl font-light tabular-nums text-neutral-900">{item.value}</p>
        </div>
      ))}
    </div>
  )
}

export function DashboardSection({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-xl border border-neutral-200 bg-white shadow-sm', className)}>
      <div className="border-b border-neutral-100 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
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
            className="group flex items-center justify-between py-3.5 text-sm text-neutral-800 transition-colors hover:text-blue-600 active:text-blue-700"
          >
            <span>{link.label}</span>
            <ArrowUpRight className="h-4 w-4 text-neutral-300 group-hover:text-blue-500" />
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
          <div className="mb-1 flex items-center justify-between text-xs text-neutral-500">
            <span>{row.label}</span>
            <span className="tabular-nums text-neutral-900">{row.value}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
            <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${(row.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function ActivityList({ items, empty }: { items: ActivityItem[]; empty: string }) {
  if (!items.length) return <p className="py-4 text-sm text-neutral-400">{empty}</p>
  return (
    <ul className="divide-y divide-neutral-100">
      {items.map((item) => (
        <li key={item.id} className="flex items-start justify-between gap-4 py-3 text-sm">
          <span className="leading-snug text-neutral-700">{item.message}</span>
          <time className="shrink-0 tabular-nums text-xs text-neutral-400">{formatDateTime(item.timestamp)}</time>
        </li>
      ))}
    </ul>
  )
}

export function EmptyChart({ message }: { message: string }) {
  return <p className="py-8 text-center text-sm text-neutral-400">{message}</p>
}

// ─── Section row header ──────────────────────────────────────────────────────

export function SectionRow({ title, action }: { title: string; action?: { label: string; to: string } }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-3.5 w-0.5 rounded-full bg-blue-600" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-600">{title}</h2>
      </div>
      {action && (
        <Link to={action.to} className="text-xs font-semibold text-blue-600 hover:text-blue-800">
          {action.label} →
        </Link>
      )}
    </div>
  )
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

export interface KpiCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  iconClass?: string
  change?: { pct: number; direction: 'up' | 'down' | 'neutral'; label?: string }
  sub?: React.ReactNode
  sparkline?: number[]
  sparkColor?: string
  loading?: boolean
}

export function KpiCard({ label, value, icon: Icon, iconClass = 'bg-blue-50 text-blue-600', change, sub, sparkline, sparkColor = '#1D4ED8', loading = false }: KpiCardProps) {
  if (loading) {
    return (
      <div className="animate-pulse rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="h-3 w-24 rounded bg-neutral-100" />
          <div className="h-9 w-9 rounded-lg bg-neutral-100" />
        </div>
        <div className="mt-4 h-8 w-20 rounded bg-neutral-100" />
        <div className="mt-3 h-8 w-full rounded bg-neutral-50" />
        <div className="mt-2 h-3 w-16 rounded bg-neutral-100" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 leading-tight pr-2">{label}</p>
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', iconClass)}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>
      <p className="text-3xl font-bold tabular-nums tracking-tight text-neutral-900">{value}</p>
      {sparkline && sparkline.length > 1 && <Sparkline data={sparkline} color={sparkColor} />}
      <div className="flex flex-wrap items-start justify-between gap-2">
        {change && (
          <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
            change.direction === 'up' && 'bg-green-50 text-green-700',
            change.direction === 'down' && 'bg-red-50 text-red-700',
            change.direction === 'neutral' && 'bg-amber-50 text-amber-700',
          )}>
            {change.direction === 'up' && <TrendingUp className="h-3 w-3" />}
            {change.direction === 'down' && <TrendingDown className="h-3 w-3" />}
            {change.direction === 'up' ? '+' : change.direction === 'down' ? '-' : ''}
            {Math.abs(change.pct)}%{change.label ? ` ${change.label}` : ''}
          </span>
        )}
        {sub && <div className="text-xs text-neutral-400">{sub}</div>}
      </div>
    </div>
  )
}

// ─── Sparkline canvas ────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.scale(dpr, dpr)

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const pad = { x: 2, y: 3 }
    const cw = w - pad.x * 2
    const ch = h - pad.y * 2

    const pts = data.map((v, i) => ({
      x: pad.x + (i / (data.length - 1)) * cw,
      y: pad.y + ch - ((v - min) / range) * ch,
    }))

    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, color + '28')
    grad.addColorStop(1, color + '00')
    ctx.beginPath()
    ctx.moveTo(pts[0].x, h)
    pts.forEach((p) => ctx.lineTo(p.x, p.y))
    ctx.lineTo(pts[pts.length - 1].x, h)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()

    ctx.beginPath()
    pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
    ctx.strokeStyle = color
    ctx.lineWidth = 1.75
    ctx.lineJoin = 'round'
    ctx.stroke()

    const last = pts[pts.length - 1]
    ctx.beginPath()
    ctx.arc(last.x, last.y, 2.5, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
  }, [data, color])

  return <canvas ref={ref} className="h-8 w-full" aria-hidden="true" />
}

// ─── Charts ──────────────────────────────────────────────────────────────────

export function RegistrationTrendChart({ data, nameRegistrations = 'Registrations', nameApprovals = 'Approvals' }: { data: { month: string; registrations: number; approvals: number }[]; nameRegistrations?: string; nameApprovals?: string }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px 0 rgb(0 0 0 / 0.08)' }} />
        <Line type="monotone" dataKey="registrations" stroke="#1D4ED8" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#1D4ED8' }} name={nameRegistrations} />
        <Line type="monotone" dataKey="approvals" stroke="#D97706" strokeWidth={2} dot={false} strokeDasharray="4 3" activeDot={{ r: 4, fill: '#D97706' }} name={nameApprovals} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function MonthlyBarChart({ data, nameRegistrations = 'Registrations' }: { data: { month: string; count: number }[]; nameRegistrations?: string }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barSize={24}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px 0 rgb(0 0 0 / 0.08)' }} />
        <Bar dataKey="count" fill="#1D4ED8" radius={[4, 4, 0, 0]} name={nameRegistrations} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function RevenueTrendChart({ data, nameRevenue = 'Revenue' }: { data: { month: string; amount: number }[]; nameRevenue?: string }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px 0 rgb(0 0 0 / 0.08)' }} formatter={(v: any) => [formatCurrency(Number(v)), nameRevenue]} />
        <Line type="monotone" dataKey="amount" stroke="#1D4ED8" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#1D4ED8' }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ─── App Status Doughnut ─────────────────────────────────────────────────────

const DONUT_COLORS = ['#D97706', '#1D4ED8', '#DC2626', '#16A34A']

export function AppStatusDoughnut({ pending, approved, rejected, cardGenerated, labelPending = 'Pending', labelApproved = 'Approved', labelRejected = 'Rejected', labelCard = 'Card Issued' }: {
  pending: number; approved: number; rejected: number; cardGenerated: number
  labelPending?: string; labelApproved?: string; labelRejected?: string; labelCard?: string
}) {
  const data = [
    { name: labelPending, value: pending },
    { name: labelApproved, value: approved },
    { name: labelRejected, value: rejected },
    { name: labelCard, value: cardGenerated },
  ]
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} cx="50%" cy="45%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
          {data.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
        </Pie>
        <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} formatter={(v: any) => [Number(v).toLocaleString('en-IN'), '']} />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ─── Operational Queue Item ──────────────────────────────────────────────────

type Priority = 'critical' | 'high' | 'medium' | 'low' | 'info'

const priorityConfig: Record<Priority, { bar: string; badge: string }> = {
  critical: { bar: 'bg-red-600', badge: 'bg-red-50 text-red-700' },
  high:     { bar: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700' },
  medium:   { bar: 'bg-yellow-400', badge: 'bg-yellow-50 text-yellow-700' },
  low:      { bar: 'bg-green-500', badge: 'bg-green-50 text-green-700' },
  info:     { bar: 'bg-indigo-500', badge: 'bg-indigo-50 text-indigo-700' },
}

export function QueueItem({ label, count, priority, priorityLabel, actionLabel, to }: {
  label: string; count: number; priority: Priority; priorityLabel: string; actionLabel: string; to: string
}) {
  const cfg = priorityConfig[priority]
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className={cn('h-0.5 w-full', cfg.bar)} />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-xs font-medium leading-snug text-neutral-500">{label}</p>
        <p className="text-3xl font-bold tabular-nums tracking-tight text-neutral-900">
          {count.toLocaleString('en-IN')}
        </p>
        <span className={cn('w-fit rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', cfg.badge)}>
          {priorityLabel}
        </span>
        <Link to={to} className="mt-auto block border-t border-neutral-100 py-3 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-800 active:text-blue-900 min-h-[44px] flex items-center">
          {actionLabel} →
        </Link>
      </div>
    </div>
  )
}

// ─── Membership Distribution Bar ─────────────────────────────────────────────

export function MembershipBar({ label, count, pct, color }: { label: string; count: number; pct: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-500">{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-bold tabular-nums text-neutral-900">{count.toLocaleString('en-IN')}</span>
          <span className="w-10 text-right text-xs text-neutral-400">{pct.toFixed(1)}%</span>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

// ─── Activity Feed Item ──────────────────────────────────────────────────────

const feedDotColor: Record<ActivityItem['type'], string> = {
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
}

export function FeedItem({ item, isLast }: { item: ActivityItem; isLast: boolean }) {
  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', feedDotColor[item.type])} />
        {!isLast && <div className="mt-1 w-px flex-1 bg-neutral-100" />}
      </div>
      <div className={cn('pb-4', isLast && 'pb-0')}>
        <p className="text-sm text-neutral-700 leading-snug">{item.message}</p>
        <time className="mt-0.5 block text-xs text-neutral-400">{formatDateTime(item.timestamp)}</time>
      </div>
    </li>
  )
}

// ─── District Performance Table ──────────────────────────────────────────────

type SortKey = keyof Pick<DistrictPerformanceRow,
  'district' | 'totalDrivers' | 'newRegistrations' | 'activeMembers' | 'pendingApplications' | 'revenueGenerated'>

export interface DistrictTableProps {
  rows: DistrictPerformanceRow[]
  loading?: boolean
  searchPlaceholder?: string
  colDistrict?: string
  colTotalDrivers?: string
  colNewReg?: string
  colActive?: string
  colPending?: string
  colRevenue?: string
  colOfficer?: string
  labelQuickView?: string
  labelActive?: string
  labelInactive?: string
  labelVacant?: string
  emptyMessage?: string
}

export function DistrictTable({
  rows,
  loading,
  searchPlaceholder = 'Search districts…',
  colDistrict = 'District',
  colTotalDrivers = 'Total Drivers',
  colNewReg = 'New Registrations',
  colActive = 'Active Members',
  colPending = 'Pending Apps',
  colRevenue = 'Revenue',
  colOfficer = 'Officer',
  labelQuickView = 'Quick View',
  labelActive = 'Active',
  labelInactive = 'Inactive',
  labelVacant = 'Vacant',
  emptyMessage = 'No districts match your search.',
}: DistrictTableProps) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('totalDrivers')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const filtered = rows
    .filter((r) =>
      r.district.toLowerCase().includes(search.toLowerCase()) ||
      r.state.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      const av = a[sortKey]; const bv = b[sortKey]
      const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number)
      return sortDir === 'asc' ? cmp : -cmp
    })

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (col !== sortKey) return <ChevronsUpDown className="ml-1 inline h-3 w-3 text-neutral-300" />
    return sortDir === 'asc'
      ? <ChevronUp className="ml-1 inline h-3 w-3 text-blue-600" />
      : <ChevronDown className="ml-1 inline h-3 w-3 text-blue-600" />
  }

  const officerBadge: Record<DistrictPerformanceRow['officerStatus'], string> = {
    active: 'bg-green-50 text-green-700',
    inactive: 'bg-amber-50 text-amber-700',
    vacant: 'bg-red-50 text-red-700',
  }

  const officerLabel: Record<DistrictPerformanceRow['officerStatus'], string> = {
    active: labelActive,
    inactive: labelInactive,
    vacant: labelVacant,
  }

  const columns: { key: SortKey; label: string }[] = [
    { key: 'district', label: colDistrict },
    { key: 'totalDrivers', label: colTotalDrivers },
    { key: 'newRegistrations', label: colNewReg },
    { key: 'activeMembers', label: colActive },
    { key: 'pendingApplications', label: colPending },
    { key: 'revenueGenerated', label: colRevenue },
  ]

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
      {/* Search bar */}
      <div className="flex flex-col gap-3 border-b border-neutral-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 hidden sm:block">
          {colDistrict}
        </h2>
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-8 pr-3 text-sm text-neutral-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-1 focus:ring-blue-200"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 p-5">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-neutral-100" />)}
        </div>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="sm:hidden divide-y divide-neutral-100">
            {filtered.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-neutral-400">{emptyMessage}</p>
            ) : (
              filtered.map((row) => (
                <div key={row.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-neutral-900">{row.district}</p>
                      <p className="text-xs text-neutral-400">{row.state}</p>
                    </div>
                    <span className={cn('shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', officerBadge[row.officerStatus])}>
                      {officerLabel[row.officerStatus]}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-neutral-400">{colTotalDrivers}</p>
                      <p className="font-semibold tabular-nums text-neutral-900">{row.totalDrivers.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-neutral-400">{colPending}</p>
                      <p className={cn('font-semibold tabular-nums',
                        row.pendingApplications > 200 && 'text-red-600',
                        row.pendingApplications > 50 && row.pendingApplications <= 200 && 'text-amber-600',
                        row.pendingApplications <= 50 && 'text-green-700',
                      )}>
                        {row.pendingApplications.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-neutral-400">{colRevenue}</p>
                      <p className="font-semibold tabular-nums text-neutral-900 text-xs">{formatCurrency(row.revenueGenerated)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-neutral-400">{colNewReg}</p>
                      <p className="font-semibold tabular-nums text-neutral-700">{row.newRegistrations.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <Link
                    to={`/admin/districts/${row.id}`}
                    className="block w-full rounded-lg border border-neutral-200 py-2 text-center text-xs font-semibold text-neutral-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {labelQuickView}
                  </Link>
                </div>
              ))
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/60">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="cursor-pointer select-none px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-neutral-600"
                    >
                      {col.label}
                      <SortIcon col={col.key} />
                    </th>
                  ))}
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-400">{colOfficer}</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-neutral-400">{emptyMessage}</td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.id} className="group hover:bg-neutral-50/80">
                      <td className="px-4 py-3">
                        <p className="font-medium text-neutral-900">{row.district}</p>
                        <p className="text-xs text-neutral-400">{row.state}</p>
                      </td>
                      <td className="px-4 py-3 tabular-nums font-semibold text-neutral-900">{row.totalDrivers.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 tabular-nums text-neutral-700">{row.newRegistrations.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 tabular-nums text-neutral-700">{row.activeMembers.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <span className={cn('tabular-nums font-semibold',
                          row.pendingApplications > 200 && 'text-red-600',
                          row.pendingApplications > 50 && row.pendingApplications <= 200 && 'text-amber-600',
                          row.pendingApplications <= 50 && 'text-green-700',
                        )}>
                          {row.pendingApplications.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="tabular-nums text-neutral-700 text-xs">{formatCurrency(row.revenueGenerated)}</span>
                          <div className="h-1 w-14 overflow-hidden rounded-full bg-neutral-100">
                            <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.round((row.revenueGenerated / row.revenueMax) * 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', officerBadge[row.officerStatus])}>
                          {officerLabel[row.officerStatus]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/districts/${row.id}`}
                          className="rounded border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                        >
                          {labelQuickView}
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
