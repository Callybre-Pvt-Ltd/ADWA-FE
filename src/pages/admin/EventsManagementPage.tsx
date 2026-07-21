import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useEvents, useDeleteEvent, usePublishEvent } from '@/hooks/useEvents'
import { PageHeader } from '@/components/shared/PageHeader'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { AppDrawer } from '@/components/shared/AppDrawer'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import EventCard from '@/features/events/EventCard'
import EventForm from '@/features/events/EventForm'
import { Calendar, Plus } from 'lucide-react'

export default function EventsManagementPage() {
  const { i18n } = useTranslation('dashboard')
  const isHi = i18n.language === 'hi'
  const { data, isLoading, isError, refetch } = useEvents()
  const deleteEvent = useDeleteEvent()
  const publishEvent = usePublishEvent()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  return (
    <div className="w-full space-y-6 pb-6 animate-fade-in">
      <PageHeader
        title={isHi ? 'कार्यक्रम प्रबंधन' : 'Events Management'}
        action={
          <Button onClick={() => setDrawerOpen(true)} className="cursor-pointer">
            <Plus className="h-4 w-4" /> {isHi ? 'कार्यक्रम बनाएं' : 'Create Event'}
          </Button>
        }
      />
      {isLoading && <div className="grid gap-4 md:grid-cols-3">{[1,2,3].map((i) => <SkeletonCard key={i} />)}</div>}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && !data?.length && <EmptyState icon={Calendar} title={isHi ? 'कोई कार्यक्रम नहीं' : 'No events'} />}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.map((e) => (
          <div key={e.id} className="relative">
            <EventCard event={e} />
            <div className="absolute right-2 top-2 flex gap-1">
              {e.status === 'draft' && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    if (!publishEvent.isPending) publishEvent.mutate(e.id)
                  }}
                  loading={publishEvent.isPending && publishEvent.variables === e.id}
                  loadingText="Publishing…"
                  disabled={publishEvent.isPending}
                >
                  Publish
                </Button>
              )}
              <Button variant="destructive" size="sm" onClick={() => setDeleteId(e.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
      <AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={isHi ? 'कार्यक्रम बनाएं' : 'Create Event'}>
        <EventForm onSuccess={() => setDrawerOpen(false)} />
      </AppDrawer>
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title={isHi ? 'कार्यक्रम हटाएं?' : 'Delete Event?'}
        description={isHi ? 'यह क्रिया वापस नहीं ली जा सकती।' : 'This action cannot be undone.'}
        confirmLabel={isHi ? 'हटाएं' : 'Delete'}
        variant="destructive"
        onConfirm={() => deleteId && deleteEvent.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
        loading={deleteEvent.isPending}
      />
    </div>
  )
}
