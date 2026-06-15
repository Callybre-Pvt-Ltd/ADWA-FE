import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNotifications, useCreateNotification } from '@/hooks/useNotifications'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { ErrorState } from '@/components/shared/ErrorState'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/utils/formatters'
import { Bell } from 'lucide-react'

const schema = z.object({
  title: z.string().min(3),
  body: z.string().min(10),
  type: z.enum(['info', 'warning', 'alert']),
  audience: z.enum(['all', 'drivers', 'district', 'admin']),
})

type FormData = z.infer<typeof schema>

export default function NotificationsManagementPage() {
  const { data, isLoading, isError, refetch } = useNotifications()
  const createNotification = useCreateNotification()
  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'info', audience: 'all' },
  })

  const onSubmit = handleSubmit(async (values) => {
    await createNotification.mutateAsync(values)
    reset({ type: 'info', audience: 'all', title: '', body: '' })
  })

  return (
    <div className="p-6">
      <PageHeader title="Notifications Management" subtitle="Create and manage system notifications" />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 p-6">
          <h2 className="font-semibold text-neutral-900">Create Notification</h2>
          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} className="mt-1" />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="body">Message</Label>
              <Textarea id="body" {...register('body')} rows={4} className="mt-1" />
              {errors.body && <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Type</Label>
                <Select value={watch('type')} onValueChange={(v) => setValue('type', v as FormData['type'])}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="alert">Alert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Audience</Label>
                <Select value={watch('audience')} onValueChange={(v) => setValue('audience', v as FormData['audience'])}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="drivers">Drivers</SelectItem>
                    <SelectItem value="district">District</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={createNotification.isPending} className="w-full">
              {createNotification.isPending ? 'Creating...' : 'Create Notification'}
            </Button>
          </form>
        </div>
        <div>
          <h2 className="font-semibold text-neutral-900">All Notifications</h2>
          {isLoading && <SkeletonCard />}
          {isError && <ErrorState onRetry={() => refetch()} />}
          <div className="mt-4 space-y-3">
            {data?.map((n) => (
              <div key={n.id} className="rounded-lg border border-neutral-200 p-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-royal-600" />
                  <span className="font-medium">{n.title}</span>
                  <StatusBadge variant={n.type === 'alert' ? 'danger' : n.type === 'warning' ? 'warning' : 'info'} label={n.type} />
                </div>
                <p className="mt-1 text-sm text-neutral-600">{n.body}</p>
                <p className="mt-2 text-xs text-neutral-500">{formatDate(n.createdAt)} · {n.audience}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
