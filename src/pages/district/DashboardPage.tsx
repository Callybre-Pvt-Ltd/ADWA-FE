import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useDistrictDashboard } from '@/hooks/useDashboard'
import { useMonthlyRegistrations, useActivities } from '@/hooks/useTeam'
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

export default function DashboardPage() {
  const { t } = useTranslation('dashboard')
  const stats = useDistrictDashboard()
  const chart = useMonthlyRegistrations()
  const activities = useActivities()

  if (stats.isError) return <ErrorState onRetry={() => stats.refetch()} />

  return (
    <div className="max-w-5xl">
      <DashboardHeader
        title={t('dashboard.welcome')}
        subtitle="District office overview"
      />

      <StatGrid
        loading={stats.isLoading}
        items={[
          { label: t('dashboard.totalDrivers'), value: stats.data?.totalDrivers ?? 0 },
          { label: t('dashboard.pendingRequests'), value: stats.data?.pendingRequests ?? 0 },
          { label: t('dashboard.paymentPending'), value: stats.data?.paymentPending ?? 0 },
          { label: t('dashboard.idsGenerated'), value: stats.data?.idsGenerated ?? 0 },
        ]}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <DashboardSection title={t('dashboard.registrationsChart')} className="lg:col-span-3">
          {chart.isLoading ? (
            <EmptyChart message="Loading…" />
          ) : !chart.data?.length ? (
            <EmptyChart message="No applications yet this period." />
          ) : (
            <SimpleBars data={chart.data} />
          )}
        </DashboardSection>

        <DashboardSection title={t('dashboard.quickActions')} className="lg:col-span-2">
          <QuickLinks
            links={[
              { to: '/district/requests', label: t('dashboard.approve') },
              { to: '/district/payments', label: t('dashboard.confirmPayment') },
              { to: '/district/id-generation', label: t('dashboard.generateId') },
            ]}
          />
        </DashboardSection>
      </div>

      <div className="mt-6">
        <DashboardSection title={t('dashboard.recentActivity')}>
          {activities.isLoading ? (
            <EmptyChart message="Loading…" />
          ) : (
            <ActivityList
              items={activities.data?.slice(0, 8) ?? []}
              empty="No activity recorded yet."
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
