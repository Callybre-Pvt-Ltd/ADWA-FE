import { useState } from 'react'
import { useEvents, useDeleteEvent } from '@/hooks/useEvents'
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
  const { data, isLoading, isError, refetch } = useEvents()
  const deleteEvent = useDeleteEvent()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  return (
    <div className="p-6">
      <PageHeader title="Events Management" action={<Button onClick={() => setDrawerOpen(true)}><Plus className="h-4 w-4" /> Create Event</Button>} />
      {isLoading && <div className="grid gap-4 md:grid-cols-3">{[1,2,3].map((i) => <SkeletonCard key={i} />)}</div>}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && !data?.length && <EmptyState icon={Calendar} title="No events" />}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.map((e) => (
          <div key={e.id} className="relative">
            <EventCard event={e} />
            <Button variant="destructive" size="sm" className="absolute right-2 top-2" onClick={() => setDeleteId(e.id)}>Delete</Button>
          </div>
        ))}
      </div>
      <AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Create Event">
        <EventForm onSuccess={() => setDrawerOpen(false)} />
      </AppDrawer>
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Event?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteId && deleteEvent.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
        loading={deleteEvent.isPending}
      />
    </div>
  )
}
