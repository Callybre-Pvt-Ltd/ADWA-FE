import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
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
import { EmptyState } from '@/components/shared/EmptyState'

const schema = z.object({
  title: z.string().min(3),
  body: z.string().min(10),
  type: z.enum(['info', 'warning', 'alert']),
  audience: z.enum(['all', 'drivers', 'district', 'admin']),
})

type FormData = z.infer<typeof schema>

const typeMapHi: Record<string, string> = {
  'info': 'जानकारी',
  'warning': 'चेतावनी',
  'alert': 'सतर्कता',
}

const audienceMapHi: Record<string, string> = {
  'all': 'सभी',
  'drivers': 'ड्राइवर',
  'district': 'जिला',
  'admin': 'एडमिन',
}

export default function NotificationsManagementPage() {
  const { i18n } = useTranslation('dashboard')
  const isHi = i18n.language === 'hi'
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

  const translateType = (type: string) => {
    if (!isHi) return type
    return typeMapHi[type] || type
  }

  const translateAudience = (aud: string) => {
    if (!isHi) return aud
    return audienceMapHi[aud] || aud
  }

  return (
    <div className="w-full space-y-6 pb-6 animate-fade-in">
      <PageHeader
        title={isHi ? 'सूचना प्रबंधन' : 'Notifications Management'}
        subtitle={isHi ? 'सिस्टम सूचनाएं बनाएं और प्रबंधित करें' : 'Create and manage system notifications'}
      />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 p-6 bg-white shadow-sm">
          <h2 className="font-semibold text-neutral-900">{isHi ? 'सूचना बनाएं' : 'Create Notification'}</h2>
          <p className="mt-2 text-sm text-neutral-600">
            {isHi
              ? 'सूचना प्रकाशन अभी उपलब्ध नहीं है। अभी के लिए बैकएंड वर्कफ़्लो से ईमेल अलर्ट का उपयोग करें।'
              : 'Notification publishing is not available yet. Use email alerts from the backend workflow for now.'}
          </p>
          <form onSubmit={onSubmit} className="mt-4 space-y-4 opacity-60 pointer-events-none" aria-disabled="true">
            <div>
              <Label htmlFor="title">{isHi ? 'शीर्षक' : 'Title'}</Label>
              <Input id="title" {...register('title')} className="mt-1" />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="body">{isHi ? 'संदेश' : 'Message'}</Label>
              <Textarea id="body" {...register('body')} rows={4} className="mt-1" />
              {errors.body && <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{isHi ? 'प्रकार' : 'Type'}</Label>
                <Select value={watch('type')} onValueChange={(v) => setValue('type', v as FormData['type'])}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">{isHi ? 'जानकारी' : 'Info'}</SelectItem>
                    <SelectItem value="warning">{isHi ? 'चेतावनी' : 'Warning'}</SelectItem>
                    <SelectItem value="alert">{isHi ? 'सतर्कता' : 'Alert'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{isHi ? 'दर्शक' : 'Audience'}</Label>
                <Select value={watch('audience')} onValueChange={(v) => setValue('audience', v as FormData['audience'])}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isHi ? 'सभी' : 'All'}</SelectItem>
                    <SelectItem value="drivers">{isHi ? 'ड्राइवर' : 'Drivers'}</SelectItem>
                    <SelectItem value="district">{isHi ? 'जिला' : 'District'}</SelectItem>
                    <SelectItem value="admin">{isHi ? 'एडमिन' : 'Admin'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={createNotification.isPending} className="w-full cursor-pointer">
              {createNotification.isPending ? (isHi ? 'बनाया जा रहा है...' : 'Creating...') : (isHi ? 'सूचना बनाएं' : 'Create Notification')}
            </Button>
          </form>
        </div>
        <div>
          <h2 className="font-semibold text-neutral-900 mb-4">{isHi ? 'सभी सूचनाएं' : 'All Notifications'}</h2>
          {isLoading && <SkeletonCard />}
          {isError && <ErrorState onRetry={() => refetch()} />}
          {!isLoading && !isError && !data?.length && (
            <EmptyState icon={Bell} title={isHi ? 'कोई सूचना नहीं' : 'No notifications'} description={isHi ? 'प्रकाशित सूचनाएं यहां दिखाई देंगी।' : 'Published notifications will appear here.'} className="py-10" />
          )}
          <div className="space-y-3">
            {data?.map((n) => (
              <div key={n.id} className="rounded-lg border border-neutral-200 p-4 bg-white shadow-sm">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-neutral-900">{n.title}</span>
                  <StatusBadge variant={n.type === 'alert' ? 'danger' : n.type === 'warning' ? 'warning' : 'info'} label={translateType(n.type)} />
                </div>
                <p className="mt-1.5 text-sm text-neutral-600">{n.body}</p>
                <p className="mt-2 text-xs text-neutral-500">{formatDate(n.createdAt)} · {translateAudience(n.audience)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
