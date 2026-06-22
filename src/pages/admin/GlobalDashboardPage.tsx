import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAdminDashboard } from '@/hooks/useDashboard'
import { useDistrictRegistrations, usePaymentBreakdown, useActivities } from '@/hooks/useTeam'
import { ErrorState } from '@/components/shared/ErrorState'
import {
  ActivityList,
  DashboardHeader,
  DashboardSection,
  EmptyChart,
  QuickLinks,
  SimpleBars,
  StatGrid,
} from '@/components/portal/DashboardPrimitives'

export default function GlobalDashboardPage() {
  const { t } = useTranslation('dashboard')
  const stats = useAdminDashboard()
  const districts = useDistrictRegistrations()
  const payments = usePaymentBreakdown()
  const activities = useActivities()

  if (stats.isError) return <ErrorState onRetry={() => stats.refetch()} />

  return (
    <div className="max-w-5xl">
      <DashboardHeader
        title="Overview"
        subtitle="National platform summary"
      />

      <StatGrid
        loading={stats.isLoading}
        items={[
          { label: t('dashboard.totalDrivers'), value: stats.data?.totalDrivers ?? 0 },
          { label: t('dashboard.totalDistricts'), value: stats.data?.totalDistricts ?? 0 },
          { label: t('dashboard.pendingPayments'), value: stats.data?.paymentPending ?? 0 },
          { label: t('dashboard.generatedIds'), value: stats.data?.idsGenerated ?? 0 },
        ]}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <DashboardSection title={t('dashboard.districtChart')}>
          {districts.isLoading ? (
            <EmptyChart message="Loading…" />
          ) : !districts.data?.length ? (
            <EmptyChart message="No district data yet." />
          ) : (
            <SimpleBars data={districts.data} />
          )}
        </DashboardSection>

        <DashboardSection title={t('dashboard.paymentChart')}>
          {payments.isLoading ? (
            <EmptyChart message="Loading…" />
          ) : !payments.data?.length ? (
            <EmptyChart message="No payment data yet." />
          ) : (
            <SimpleBars data={payments.data} />
          )}
        </DashboardSection>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <DashboardSection title="Shortcuts" className="lg:col-span-2">
          <QuickLinks
            links={[
              { to: '/admin/applications', label: 'Review applications' },
              { to: '/admin/drivers', label: 'Manage drivers' },
              { to: '/admin/districts', label: 'Districts' },
              { to: '/admin/users', label: 'Users' },
            ]}
          />
        </DashboardSection>

        <DashboardSection title={t('dashboard.recentActivity')} className="lg:col-span-3">
          {activities.isLoading ? (
            <EmptyChart message="Loading…" />
          ) : (
            <ActivityList
              items={activities.data?.slice(0, 8) ?? []}
              empty="No system activity yet."
            />
          )}
        </DashboardSection>
      </div>

      <p className="mt-8 text-xs text-neutral-400">
        <Link to="/" className="hover:text-neutral-600 underline-offset-2 hover:underline">
          ← Back to public site
        </Link>
      </p>
    </div>
  )
}
