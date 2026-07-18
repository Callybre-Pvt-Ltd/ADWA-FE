import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Users,
  FileText,
  CreditCard,
  IndianRupee,
} from 'lucide-react'
import { useAdminDashboard } from '@/hooks/useDashboard'
import { useActivities } from '@/hooks/useTeam'
import { ErrorState } from '@/components/shared/ErrorState'
import { formatCurrency } from '@/utils/formatters'
import {
  KpiCard,
  RegistrationTrendChart,
  AppStatusDoughnut,
  DistrictTable,
  QueueItem,
  RevenueTrendChart,
  MembershipBar,
  FeedItem,
  SectionRow,
  DashboardSection,
} from '@/components/portal/DashboardPrimitives'
import type { DistrictPerformanceRow } from '@/types/common.types'

// ─── Static chart data (replaced by real API as backend expands) ─────────────

const REG_TREND = [
  { month: 'Jul', registrations: 4200, approvals: 3800 },
  { month: 'Aug', registrations: 4800, approvals: 4100 },
  { month: 'Sep', registrations: 5100, approvals: 4600 },
  { month: 'Oct', registrations: 4900, approvals: 4400 },
  { month: 'Nov', registrations: 5400, approvals: 4800 },
  { month: 'Dec', registrations: 5800, approvals: 5100 },
  { month: 'Jan', registrations: 6100, approvals: 5500 },
  { month: 'Feb', registrations: 6400, approvals: 5800 },
  { month: 'Mar', registrations: 6200, approvals: 5600 },
  { month: 'Apr', registrations: 6800, approvals: 6100 },
  { month: 'May', registrations: 7100, approvals: 6400 },
  { month: 'Jun', registrations: 7400, approvals: 6700 },
]

const REV_TREND = [
  { month: 'Jul', amount: 2840000 },
  { month: 'Aug', amount: 3010000 },
  { month: 'Sep', amount: 3150000 },
  { month: 'Oct', amount: 2980000 },
  { month: 'Nov', amount: 3320000 },
  { month: 'Dec', amount: 3540000 },
  { month: 'Jan', amount: 3410000 },
  { month: 'Feb', amount: 3680000 },
  { month: 'Mar', amount: 3820000 },
  { month: 'Apr', amount: 3690000 },
  { month: 'May', amount: 3840000 },
  { month: 'Jun', amount: 4280000 },
]

const DISTRICT_ROWS: DistrictPerformanceRow[] = [
  { id: 'd1', district: 'Mumbai', state: 'Maharashtra', totalDrivers: 12847, newRegistrations: 843, activeMembers: 11204, pendingApplications: 312, revenueGenerated: 840000, revenueMax: 840000, officerStatus: 'active' },
  { id: 'd2', district: 'Delhi', state: 'Delhi NCR', totalDrivers: 10312, newRegistrations: 621, activeMembers: 9104, pendingApplications: 248, revenueGenerated: 710000, revenueMax: 840000, officerStatus: 'active' },
  { id: 'd3', district: 'Bengaluru Urban', state: 'Karnataka', totalDrivers: 9651, newRegistrations: 534, activeMembers: 8440, pendingApplications: 127, revenueGenerated: 640000, revenueMax: 840000, officerStatus: 'active' },
  { id: 'd4', district: 'Hyderabad', state: 'Telangana', totalDrivers: 8203, newRegistrations: 412, activeMembers: 7341, pendingApplications: 94, revenueGenerated: 520000, revenueMax: 840000, officerStatus: 'inactive' },
  { id: 'd5', district: 'Chennai', state: 'Tamil Nadu', totalDrivers: 7889, newRegistrations: 389, activeMembers: 7012, pendingApplications: 41, revenueGenerated: 500000, revenueMax: 840000, officerStatus: 'active' },
  { id: 'd6', district: 'Kolkata', state: 'West Bengal', totalDrivers: 7441, newRegistrations: 301, activeMembers: 6512, pendingApplications: 203, revenueGenerated: 410000, revenueMax: 840000, officerStatus: 'vacant' },
  { id: 'd7', district: 'Pune', state: 'Maharashtra', totalDrivers: 6104, newRegistrations: 278, activeMembers: 5612, pendingApplications: 52, revenueGenerated: 380000, revenueMax: 840000, officerStatus: 'active' },
]

const monthMapEnToHi: Record<string, string> = {
  'Jan': 'जन',
  'Feb': 'फर',
  'Mar': 'मार्च',
  'Apr': 'अप्रैल',
  'May': 'मई',
  'Jun': 'जून',
  'Jul': 'जुलाई',
  'Aug': 'अगस्त',
  'Sep': 'सित',
  'Oct': 'अक्टू',
  'Nov': 'नव',
  'Dec': 'दिस'
}

import { districtMapEnToHi, stateMapEnToHi } from '@/utils/translations'

export default function GlobalDashboardPage() {
  const { t, i18n } = useTranslation('dashboard')
  const stats = useAdminDashboard()
  const activities = useActivities()

  if (stats.isError) return <ErrorState onRetry={() => stats.refetch()} />

  const s = stats.data
  const totalDrivers = s?.totalDrivers ?? 0
  const idsGenerated = s?.idsGenerated ?? 0
  const pendingPayments = s?.pendingPayments ?? 0

  const pendingAdminApproval = Math.round(pendingPayments * 0.42)
  const pendingDistrictReview = pendingPayments - pendingAdminApproval
  const idsPending = Math.max(0, totalDrivers - idsGenerated)
  const revenueCurrentMonth = 4280000
  const revenuePrevMonth = 3840000
  const revenuePct = Math.round(((revenueCurrentMonth - revenuePrevMonth) / revenuePrevMonth) * 100)

  const membersActive = Math.round(totalDrivers * 0.845)
  const membersPendingRenewal = Math.round(totalDrivers * 0.087)
  const membersExpired = Math.round(totalDrivers * 0.055)
  const membersSuspended = Math.max(0, totalDrivers - membersActive - membersPendingRenewal - membersExpired)

  const loading = stats.isLoading
  const feedItems = activities.data?.slice(0, 6) ?? []

  const d = (key: string) => t(`dashboard.${key}`)

  const isHi = i18n.language === 'hi'
  const regTrend = REG_TREND.map(pt => ({
    ...pt,
    month: isHi ? (monthMapEnToHi[pt.month] || pt.month) : pt.month
  }))
  const revTrend = REV_TREND.map(pt => ({
    ...pt,
    month: isHi ? (monthMapEnToHi[pt.month] || pt.month) : pt.month
  }))
  const districtRows = DISTRICT_ROWS.map(row => ({
    ...row,
    district: isHi ? (districtMapEnToHi[row.district] || row.district) : row.district,
    state: isHi ? (stateMapEnToHi[row.state] || row.state) : row.state
  }))

  return (
    <div className="w-full space-y-6 pb-6">

      {/* ── Page header ── */}
      <div className="flex flex-col gap-3 border-b border-neutral-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-base font-bold tracking-tight text-neutral-900 sm:text-lg">
            {d('nationalDashboard')}
          </h1>
          <p className="mt-0.5 text-xs text-neutral-400">
            {d('nationalSubtitle')} · {d('updatedNow')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/applications"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition active:scale-95 hover:bg-blue-700"
          >
            {d('newApplication')}
          </Link>
        </div>
      </div>

      {/* ── Row 1: KPIs — 1 col mobile, 2 col sm, 4 col xl ── */}
      <section>
        <SectionRow title={d('keyIndicators')} />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label={d('totalRegisteredDrivers')}
            value={totalDrivers.toLocaleString('en-IN')}
            icon={Users}
            iconClass="bg-blue-50 text-blue-600"
            change={{ pct: 6.2, direction: 'up', label: d('vsLastMonth') }}
            sparkline={[52, 58, 61, 59, 64, 68, 71, 74, 72, 78, 81, 84]}
            sparkColor="#1D4ED8"
            loading={loading}
          />
          <KpiCard
            label={d('pendingApplications')}
            value={(pendingDistrictReview + pendingAdminApproval).toLocaleString('en-IN')}
            icon={FileText}
            iconClass="bg-amber-50 text-amber-600"
            sub={
              <span className="flex flex-col gap-0.5 text-left">
                <span className="text-neutral-400">
                  {d('districtReviewPending')}:{' '}
                  <b className="text-neutral-700">{pendingDistrictReview.toLocaleString('en-IN')}</b>
                </span>
                <span className="text-neutral-400">
                  {d('superAdminApprovals')}:{' '}
                  <b className={pendingAdminApproval > 300 ? 'text-red-600' : 'text-neutral-700'}>
                    {pendingAdminApproval.toLocaleString('en-IN')}
                    {pendingAdminApproval > 300 && (
                      <span className="ml-1 rounded-sm bg-red-600 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                        {d('priorityCritical')}
                      </span>
                    )}
                  </b>
                </span>
              </span>
            }
            loading={loading}
          />
          <KpiCard
            label={d('generatedIdCards')}
            value={idsGenerated.toLocaleString('en-IN')}
            icon={CreditCard}
            iconClass="bg-indigo-50 text-indigo-600"
            change={{ pct: 94, direction: 'neutral', label: d('percentIssued') }}
            sub={`${idsPending.toLocaleString('en-IN')} ${d('pendingGeneration')}`}
            sparkline={[74, 75, 76, 76, 77, 78, 78, 79, 79, 79, 79, 79]}
            sparkColor="#6366F1"
            loading={loading}
          />
          <KpiCard
            label={d('membershipRevenue')}
            value={formatCurrency(revenueCurrentMonth)}
            icon={IndianRupee}
            iconClass="bg-green-50 text-green-700"
            change={{ pct: revenuePct, direction: 'up', label: d('vsLastMonth') }}
            sub={`${formatCurrency(revenuePrevMonth)} ${d('prevMonth')}`}
            sparkline={[28, 30, 32, 30, 33, 35, 34, 37, 38, 37, 38, 43]}
            sparkColor="#16A34A"
            loading={loading}
          />
        </div>
      </section>

      {/* ── Row 2: Trend chart (full width mobile) + doughnut below on mobile ── */}
      <section>
        <SectionRow
          title={d('registrationsAndApps')}
          action={{ label: d('fullReport'), to: '/admin/drivers' }}
        />
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[1fr_300px]">
          {/* Line chart */}
          <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="flex flex-col gap-1 border-b border-neutral-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  {d('driverRegistrationTrend')}
                </p>
                <p className="mt-0.5 text-[11px] text-neutral-400 hidden sm:block">
                  {d('trendSubtitle')}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-4 rounded-full bg-blue-600" />
                  {d('registrations')}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-amber-500" />
                  {d('approvals')}
                </span>
              </div>
            </div>
            <div className="p-4">
              <RegistrationTrendChart data={regTrend} nameRegistrations={d('registrations')} nameApprovals={d('approvals')} />
            </div>
          </div>

          {/* Doughnut */}
          <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-100 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                {d('applicationStatus')}
              </p>
              <p className="mt-0.5 text-[11px] text-neutral-400">
                {d('applicationStatusSubtitle')}
              </p>
            </div>
            <div className="p-3">
              <AppStatusDoughnut
                pending={pendingDistrictReview + pendingAdminApproval}
                approved={idsGenerated}
                rejected={Math.round(totalDrivers * 0.034)}
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

      {/* ── Row 3: District table — horizontal scroll on mobile ── */}
      <section>
        <SectionRow
          title={d('districtPerformance')}
          action={{ label: d('managedDistricts'), to: '/admin/districts' }}
        />
        <div className="mt-3">
          <DistrictTable
            rows={districtRows}
            loading={loading}
            searchPlaceholder={d('searchDistricts')}
            colDistrict={d('district')}
            colTotalDrivers={d('totalDrivers')}
            colNewReg={d('newRegistrations')}
            colActive={d('activeMembers')}
            colPending={d('pendingApps')}
            colRevenue={d('revenue')}
            colOfficer={d('officerStatus')}
            labelQuickView={d('quickView')}
            labelActive={d('officerActive')}
            labelInactive={d('officerInactive')}
            labelVacant={d('officerVacant')}
            emptyMessage={d('noDistrictsMatch')}
          />
        </div>
      </section>

      {/* ── Row 4: Queue — 1 col mobile, 2 col sm, 5 col xl ── */}
      <section>
        <SectionRow title={d('operationalQueue')} />
        <p className="mt-1 text-xs text-neutral-400">{d('actionsRequired')}</p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <QueueItem
            label={d('superAdminApprovals')}
            count={pendingAdminApproval}
            priority="critical"
            priorityLabel={d('priorityCritical')}
            actionLabel={d('reviewAndApprove')}
            to="/admin/applications"
          />
          <QueueItem
            label={d('districtReviewPending')}
            count={pendingDistrictReview}
            priority="high"
            priorityLabel={d('priorityHigh')}
            actionLabel={d('viewQueue')}
            to="/admin/applications"
          />
          <QueueItem
            label={d('paymentsAwaitingVerification')}
            count={Math.round(pendingPayments * 0.16)}
            priority="medium"
            priorityLabel={d('priorityMedium')}
            actionLabel={d('verifyPayments')}
            to="/admin/payments"
          />
          <QueueItem
            label={d('idCardsPendingGeneration')}
            count={idsPending}
            priority="low"
            priorityLabel={d('priorityScheduled')}
            actionLabel={d('generateBatch')}
            to="/admin/id-cards"
          />
          <QueueItem
            label={d('membershipRenewalsDue')}
            count={membersPendingRenewal}
            priority="info"
            priorityLabel={d('priorityRenewal')}
            actionLabel={d('sendReminders')}
            to="/admin/drivers"
          />
        </div>
      </section>

      {/* ── Row 5: Revenue + Membership — stack on mobile ── */}
      <section>
        <SectionRow
          title={d('revenueAndMembership')}
          action={{ label: d('financialReport'), to: '/admin/payments' }}
        />
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[1fr_280px]">
          <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-100 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                {d('monthlyRevenueTrend')}
              </p>
              <p className="mt-0.5 text-[11px] text-neutral-400 hidden sm:block">
                {d('revenueTrendSubtitle')}
              </p>
            </div>
            <div className="p-4">
              <RevenueTrendChart data={revTrend} nameRevenue={d('revenue')} />
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
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
                color="#D97706"
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
        </div>
      </section>

      {/* ── Row 6: Activity — 1 col mobile, 3 col xl ── */}
      <section>
        <SectionRow
          title={d('recentActivityFeed')}
          action={{ label: d('auditLog'), to: '/admin/audit' }}
        />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <DashboardSection title={d('driverRegistrations')}>
            {activities.isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-10 animate-pulse rounded bg-neutral-100" />)}
              </div>
            ) : (
              <ul className="space-y-0">
                {feedItems.filter((_, i) => i % 3 === 0).map((item, i, arr) => (
                  <FeedItem key={item.id} item={item} isLast={i === arr.length - 1} />
                ))}
                {feedItems.length === 0 && (
                  <li className="py-4 text-sm text-neutral-400">{d('noRegistrationsYet')}</li>
                )}
              </ul>
            )}
          </DashboardSection>

          <DashboardSection title={d('approvalsAndPayments')}>
            {activities.isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-10 animate-pulse rounded bg-neutral-100" />)}
              </div>
            ) : (
              <ul className="space-y-0">
                {feedItems.filter((_, i) => i % 3 === 1).map((item, i, arr) => (
                  <FeedItem key={item.id} item={item} isLast={i === arr.length - 1} />
                ))}
                {feedItems.length === 0 && (
                  <li className="py-4 text-sm text-neutral-400">{d('noActivityYet')}</li>
                )}
              </ul>
            )}
          </DashboardSection>

          <DashboardSection title={d('idCardsAndAccounts')}>
            {activities.isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-10 animate-pulse rounded bg-neutral-100" />)}
              </div>
            ) : (
              <ul className="space-y-0">
                {feedItems.filter((_, i) => i % 3 === 2).map((item, i, arr) => (
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
