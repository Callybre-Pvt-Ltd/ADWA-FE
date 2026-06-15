import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Users, Clock, CreditCard, IdCard, ArrowRight } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useDriverStats } from '@/hooks/useDrivers'
import { useMonthlyRegistrations, useActivities } from '@/hooks/useTeam'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatsCard } from '@/components/shared/StatsCard'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { ErrorState } from '@/components/shared/ErrorState'
import { formatDateTime } from '@/utils/formatters'
import { Button } from '@/components/ui/button'
import { colors } from '@/styles/tokens'

export default function DashboardPage() {
  const { t } = useTranslation('dashboard')
  const stats = useDriverStats()
  const chart = useMonthlyRegistrations()
  const activities = useActivities()

  if (stats.isError) return <ErrorState onRetry={() => stats.refetch()} />

  return (
    <div className="p-6">
      <PageHeader title={t('dashboard.welcome')} subtitle="District Office Dashboard" />
      {stats.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[1,2,3,4].map((i) => <SkeletonCard key={i} />)}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title={t('dashboard.totalDrivers')} value={stats.data?.totalDrivers ?? 0} icon={Users} variant="primary" />
          <StatsCard title={t('dashboard.pendingRequests')} value={stats.data?.pendingRequests ?? 0} icon={Clock} variant="warning" />
          <StatsCard title={t('dashboard.paymentPending')} value={stats.data?.paymentPending ?? 0} icon={CreditCard} variant="warning" />
          <StatsCard title={t('dashboard.idsGenerated')} value={stats.data?.idsGenerated ?? 0} icon={IdCard} variant="success" />
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-neutral-200 bg-white p-4">
          <h2 className="font-semibold text-neutral-900">{t('dashboard.registrationsChart')}</h2>
          {chart.isLoading ? <SkeletonCard /> : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke={colors.navy[600]} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <h2 className="font-semibold text-neutral-900">{t('dashboard.quickActions')}</h2>
          <div className="mt-4 space-y-2">
            {[
              { to: '/district/requests', label: t('dashboard.approve') },
              { to: '/district/payments', label: t('dashboard.confirmPayment') },
              { to: '/district/id-generation', label: t('dashboard.generateId') },
            ].map((a) => (
              <Button key={a.to} asChild variant="outline" className="w-full justify-between">
                <Link to={a.to}>{a.label} <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="font-semibold text-neutral-900">{t('dashboard.recentActivity')}</h2>
        {activities.isLoading ? <SkeletonCard /> : (
          <ul className="mt-4 space-y-3">
            {activities.data?.slice(0, 5).map((a) => (
              <li key={a.id} className="flex justify-between text-sm border-b border-neutral-100 pb-2">
                <span className="text-neutral-700">{a.message}</span>
                <span className="text-neutral-500 shrink-0 ml-4">{formatDateTime(a.timestamp)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
