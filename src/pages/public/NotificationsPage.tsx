import { useState } from 'react'
import { useNotifications, useMarkNotificationRead } from '@/hooks/useNotifications'

import { StatusBadge } from '@/components/shared/StatusBadge'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate } from '@/utils/formatters'
import { PageHero } from '@/components/shared/PageHero'
import { Bell } from 'lucide-react'

export default function NotificationsPage() {
  const { data, isLoading, isFetching, isError, refetch } = useNotifications()
  const markRead = useMarkNotificationRead()
  const [tab, setTab] = useState('all')

  const filtered = data?.filter((n) => {
    if (tab === 'unread') return !n.read
    if (tab === 'read') return n.read
    return true
  })

  return (
    <div className="bg-white">
      <PageHero title="Notifications" subtitle="Latest updates from ADWA" />
      <section className="section-padding">
        <div className="container-wide max-w-3xl">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
            </TabsList>
            <TabsContent value={tab} className="mt-6">
              {isLoading && <SkeletonCard />}
              {isError && <ErrorState onRetry={() => refetch()} loading={isFetching} />}
              {!isLoading && !isError && !filtered?.length && <EmptyState icon={Bell} title="No notifications" />}
              <div className="space-y-3">
                {filtered?.map((n) => (
                  <div key={n.id} className={`rounded-lg border p-4 ${n.read ? 'border-neutral-200' : 'border-royal-200 bg-royal-50'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-neutral-900">{n.title}</h3>
                          <StatusBadge variant={n.type === 'alert' ? 'danger' : n.type === 'warning' ? 'warning' : 'info'} label={n.type} />
                        </div>
                        <p className="mt-1 text-sm text-neutral-600">{n.body}</p>
                        <p className="mt-2 text-xs text-neutral-500">{formatDate(n.createdAt)}</p>
                      </div>
                      {!n.read && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markRead.mutate(n.id)}
                          loading={markRead.isPending && markRead.variables === n.id}
                          loadingText="Marking…"
                          disabled={markRead.isPending}
                        >
                          Mark read
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  )
}
