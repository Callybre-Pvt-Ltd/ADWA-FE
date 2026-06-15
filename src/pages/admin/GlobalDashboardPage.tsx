import { useTranslation } from 'react-i18next'
import { Users, MapPin, CreditCard, IdCard } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useDriverStats } from '@/hooks/useDrivers'
import { useDistrictRegistrations, usePaymentBreakdown, useActivities } from '@/hooks/useTeam'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatsCard } from '@/components/shared/StatsCard'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { ErrorState } from '@/components/shared/ErrorState'
import { formatDateTime } from '@/utils/formatters'
import { colors } from '@/styles/tokens'

const PIE_COLORS = [colors.emerald[600], colors.amber[600], colors.royal[600], colors.neutral[500]]

export default function GlobalDashboardPage() {
  const { t } = useTranslation('dashboard')
  const stats = useDriverStats()
  const districts = useDistrictRegistrations()
  const payments = usePaymentBreakdown()
  const activities = useActivities()

  if (stats.isError) return <ErrorState onRetry={() => stats.refetch()} />

  return (
    <div className="p-6">
      <PageHeader title="Global Dashboard" subtitle="National overview across all districts" />
      {stats.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[1,2,3,4].map((i) => <SkeletonCard key={i} />)}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title={t('dashboard.totalDrivers')} value={stats.data?.totalDrivers ?? 0} icon={Users} variant="primary" />
          <StatsCard title={t('dashboard.totalDistricts')} value={200} icon={MapPin} />
          <StatsCard title={t('dashboard.pendingPayments')} value={stats.data?.paymentPending ?? 0} icon={CreditCard} variant="warning" />
          <StatsCard title={t('dashboard.generatedIds')} value={stats.data?.idsGenerated ?? 0} icon={IdCard} variant="success" />
        </div>
      )}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <h2 className="font-semibold">{t('dashboard.districtChart')}</h2>
          {districts.isLoading ? <SkeletonCard /> : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={districts.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={colors.navy[600]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <h2 className="font-semibold">{t('dashboard.paymentChart')}</h2>
          {payments.isLoading ? <SkeletonCard /> : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={payments.data} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={80} label>
                  {payments.data?.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="font-semibold">{t('dashboard.recentActivity')}</h2>
        <ul className="mt-4 space-y-3">
          {activities.data?.map((a) => (
            <li key={a.id} className="flex justify-between text-sm border-b border-neutral-100 pb-2">
              <span>{a.message}</span>
              <span className="text-neutral-500">{formatDateTime(a.timestamp)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
