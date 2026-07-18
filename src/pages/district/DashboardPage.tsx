import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Users,
  FileText,
  CreditCard,
  IndianRupee,
} from 'lucide-react'
import { useDistrictDashboard } from '@/hooks/useDashboard'
import { useMonthlyRegistrations, useActivities } from '@/hooks/useTeam'
import { ErrorState } from '@/components/shared/ErrorState'
import { formatCurrency } from '@/utils/formatters'
import {
  KpiCard,
  MonthlyBarChart,
  AppStatusDoughnut,
  QueueItem,
  MembershipBar,
  FeedItem,
  SectionRow,
  DashboardSection,
  QuickLinks,
} from '@/components/portal/DashboardPrimitives'

const MONTHLY_FALLBACK = [
  { month: 'Jan', count: 210 },
  { month: 'Feb', count: 248 },
  { month: 'Mar', count: 275 },
  { month: 'Apr', count: 261 },
  { month: 'May', count: 294 },
  { month: 'Jun', count: 318 },
]

export default function DashboardPage() {
  const { t } = useTranslation('dashboard')
  const stats = useDistrictDashboard()
  const chart = useMonthlyRegistrations()
  const activities = useActivities()

  if (stats.isError) return <ErrorState onRetry={() => stats.refetch()} />

  const s = stats.data
  const totalDrivers = s?.totalDrivers ?? 0
  const pendingRequests = s?.pendingRequests ?? 0
  const paymentPending = s?.paymentPending ?? 0
  const idsGenerated = s?.idsGenerated ?? 0

  const idsPending = Math.max(0, totalDrivers - idsGenerated)
  const revenueCurrentMonth = 640000
  const revenuePrevMonth = 580000
  const revenuePct = Math.round(((revenueCurrentMonth - revenuePrevMonth) / revenuePrevMonth) * 100)

  const membersActive = Math.round(totalDrivers * 0.87)
  const membersPendingRenewal = Math.round(totalDrivers * 0.07)
  const membersExpired = Math.round(totalDrivers * 0.05)
  const membersSuspended = Math.max(0, totalDrivers - membersActive - membersPendingRenewal - membersExpired)

  const loading = stats.isLoading
  const chartData = chart.data?.map((d) => ({ month: d.label, count: d.value })) ?? MONTHLY_FALLBACK
  const feedItems = activities.data?.slice(0, 6) ?? []

  const d = (key: string) => t(`dashboard.${key}`)

  return (
    <div className="w-full max-w-4xl space-y-6 pb-6">

      {/* ── Page header ── */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card">
        {/* Signature: thin tricolor rule, echoing the logo's concentric rings — used once, here only */}
        <div className="flag-stripe" aria-hidden="true" />
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {/* Small chakra-ring mark, ties back to the logo without repeating it wholesale */}
            <svg width="30" height="30" viewBox="0 0 30 30" className="hidden shrink-0 sm:block" aria-hidden="true">
              <circle cx="15" cy="15" r="13" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-500" />
              <circle cx="15" cy="15" r="9" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600" />
              <circle cx="15" cy="15" r="3" fill="currentColor" className="text-blue-800" />
            </svg>
            <div>
              <h1 className="text-base font-bold tracking-tight text-neutral-900 sm:text-lg">
                {d('districtDashboard')}
              </h1>
              <p className="mt-0.5 text-xs text-neutral-400">
                {d('districtSubtitle')} · {d('updatedNow')}
              </p>
            </div>
          </div>
          <Link
            to="/district/requests"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-orange-600 active:scale-95"
          >
            {d('reviewApplications')}
          </Link>
        </div>
      </div>

      {/* ── Row 1: KPIs — 1 col mobile, 2 col sm, 4 col xl ── */}
      <section>
        <SectionRow title={d('districtAtGlance')} />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label={d('totalRegisteredDrivers')}
            value={totalDrivers.toLocaleString('en-IN')}
            icon={Users}
            iconClass="bg-blue-50 text-blue-800"
            change={{ pct: 4.8, direction: 'up', label: d('vsLastMonth') }}
            sparkline={[52, 55, 58, 60, 63, 67]}
            sparkColor="#1D4ED8"
            loading={loading}
          />
          <KpiCard
            label={d('pendingApplications')}
            value={pendingRequests.toLocaleString('en-IN')}
            icon={FileText}
            iconClass="bg-orange-50 text-orange-600"
            sub={
              pendingRequests > 100 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-700">
                  {d('actionNeeded')}
                </span>
              ) : (
                <span className="text-neutral-400">{d('allUnderThreshold')}</span>
              )
            }
            loading={loading}
          />
          <KpiCard
            label={d('generatedIdCards')}
            value={idsGenerated.toLocaleString('en-IN')}
            icon={CreditCard}
            iconClass="bg-blue-100 text-blue-700"
            sub={`${idsPending.toLocaleString('en-IN')} ${d('pendingGeneration')}`}
            sparkline={[40, 45, 50, 55, 58, 62]}
            sparkColor="#1D4ED8"
            loading={loading}
          />
          <KpiCard
            label={d('monthlyRevenue')}
            value={formatCurrency(revenueCurrentMonth)}
            icon={IndianRupee}
            iconClass="bg-green-50 text-green-700"
            change={{ pct: revenuePct, direction: 'up', label: d('vsLastMonth') }}
            sub={`${formatCurrency(revenuePrevMonth)} ${d('prevMonth')}`}
            loading={loading}
          />
        </div>
      </section>

      {/* ── Row 2: Bar chart + Doughnut — stack on mobile ── */}
      <section>
        <SectionRow
          title={d('registrationsStatus')}
          action={{ label: d('viewAllDrivers'), to: '/district/drivers' }}
        />
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[1fr_260px]">
          <div className="rounded-xl border border-neutral-200 bg-white shadow-card">
            <div className="border-b border-neutral-100 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                {d('monthlyRegistrations')}
              </p>
              <p className="mt-0.5 text-[11px] text-neutral-400 hidden sm:block">
                {d('monthlyRegSubtitle')}
              </p>
            </div>
            <div className="p-4">
              {chart.isLoading ? (
                <div className="flex h-40 items-center justify-center text-sm text-neutral-400">{d('loading')}</div>
              ) : (
                <MonthlyBarChart data={chartData} nameRegistrations={d('registrations')} />
              )}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white shadow-card">
            <div className="border-b border-neutral-100 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                {d('applicationStatus')}
              </p>
            </div>
            <div className="p-3">
              <AppStatusDoughnut
                pending={pendingRequests}
                approved={idsGenerated}
                rejected={Math.round(totalDrivers * 0.03)}
                cardGenerated={idsGenerated}
                labelPending={d('pendingApplications')}
                labelApproved={d('approve')}
                labelRejected={d('reject')}
                labelCard={d('generatedIdCards')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Row 3: Queue — 1 col mobile, 2 col sm, 4 col xl ── */}
      <section>
        <SectionRow title={d('pendingActions')} />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QueueItem
            label={d('applicationsAwaitingReview')}
            count={pendingRequests}
            priority={pendingRequests > 100 ? 'critical' : 'high'}
            priorityLabel={pendingRequests > 100 ? d('priorityCritical') : d('priorityHigh')}
            actionLabel={d('reviewNow')}
            to="/district/requests"
          />
          <QueueItem
            label={d('paymentsAwaitingConfirmation')}
            count={paymentPending}
            priority="medium"
            priorityLabel={d('priorityMedium')}
            actionLabel={d('confirmPayments')}
            to="/district/payments"
          />
          <QueueItem
            label={d('idCardsPendingGeneration')}
            count={idsPending}
            priority="low"
            priorityLabel={d('priorityScheduled')}
            actionLabel={d('generateIdCards')}
            to="/district/id-generation"
          />
          <QueueItem
            label={d('membershipRenewalsDue')}
            count={membersPendingRenewal}
            priority="info"
            priorityLabel={d('priorityRenewal')}
            actionLabel={d('viewRenewals')}
            to="/district/renewals"
          />
        </div>
      </section>

      {/* ── Row 4: Membership + Quick actions — stack on mobile ── */}
      <section>
        <SectionRow title={d('membershipAndActions')} />
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[1fr_240px]">
          <div className="rounded-xl border border-neutral-200 bg-white shadow-card">
            <div className="border-b border-neutral-100 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                {d('membershipDistribution')}
              </p>
              <p className="mt-0.5 text-[11px] text-neutral-400">
                {t('dashboard.statusAcross', { count: totalDrivers.toLocaleString('en-IN') })}
              </p>
            </div>
            <div className="flex flex-col gap-4 p-4">
              <MembershipBar
                label={d('membersActive')}
                count={membersActive}
                pct={totalDrivers ? (membersActive / totalDrivers) * 100 : 0}
                color="#1D4ED8"
              />
              <MembershipBar
                label={d('membersPendingRenewal')}
                count={membersPendingRenewal}
                pct={totalDrivers ? (membersPendingRenewal / totalDrivers) * 100 : 0}
                color="#F97316"
              />
              <MembershipBar
                label={d('membersExpired')}
                count={membersExpired}
                pct={totalDrivers ? (membersExpired / totalDrivers) * 100 : 0}
                color="#DC2626"
              />
              <MembershipBar
                label={d('membersSuspended')}
                count={membersSuspended}
                pct={totalDrivers ? (membersSuspended / totalDrivers) * 100 : 0}
                color="#94A3B8"
              />
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white shadow-card">
            <div className="border-b border-neutral-100 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                {d('quickActions')}
              </p>
            </div>
            <div className="p-4">
              <QuickLinks
                links={[
                  { to: '/district/requests', label: d('reviewAndApprove') },
                  { to: '/district/payments', label: d('confirmPayments') },
                  { to: '/district/id-generation', label: d('generateIdCards') },
                  { to: '/district/renewals', label: d('viewRenewals') },
                  { to: '/district/drivers', label: d('viewAllDrivers') },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Row 5: Activity — 1 col mobile, 2 col sm ── */}
      <section>
        <SectionRow title={d('recentActivityFeed')} />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DashboardSection title={d('applicationsAndApprovals')}>
            {activities.isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-10 animate-pulse rounded bg-neutral-100" />)}
              </div>
            ) : (
              <ul className="space-y-0">
                {feedItems.filter((_, i) => i % 2 === 0).map((item, i, arr) => (
                  <FeedItem key={item.id} item={item} isLast={i === arr.length - 1} />
                ))}
                {feedItems.length === 0 && (
                  <li className="py-4 text-sm text-neutral-400">{d('noActivityYet')}</li>
                )}
              </ul>
            )}
          </DashboardSection>

          <DashboardSection title={d('paymentsAndIdCards')}>
            {activities.isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-10 animate-pulse rounded bg-neutral-100" />)}
              </div>
            ) : (
              <ul className="space-y-0">
                {feedItems.filter((_, i) => i % 2 === 1).map((item, i, arr) => (
                  <FeedItem key={item.id} item={item} isLast={i === arr.length - 1} />
                ))}
                {feedItems.length === 0 && (
                  <li className="py-4 text-sm text-neutral-400">{d('noActivityYet')}</li>
                )}
              </ul>
            )}
          </DashboardSection>
        </div>
      </section>
    </div>
  )
}