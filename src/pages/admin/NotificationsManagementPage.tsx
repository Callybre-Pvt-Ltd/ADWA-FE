/* eslint-disable react-hooks/incompatible-library */
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
import { Bell, Megaphone, Users, Clock, AlertTriangle, FileText, Send } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn } from '@/utils/cn'

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
  "use no memo";
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
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Form Panel */}
        <div className="lg:col-span-5 rounded-2xl border border-neutral-200 p-5 bg-white shadow-card space-y-4">
          <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 shadow-sm">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-neutral-900 text-base">{isHi ? 'नई सूचना प्रसारित करें' : 'Broadcast New Notification'}</h2>
              <p className="text-xs text-neutral-500">{isHi ? 'ड्राइवरों और जिला प्रभारियों को संदेश भेजें' : 'Send messages to drivers and district incharges'}</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-black text-neutral-600 uppercase tracking-wider">{isHi ? 'सूचना का शीर्षक' : 'Notification Title'}</Label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                  <FileText className="h-4 w-4" />
                </span>
                <Input
                  id="title"
                  placeholder={isHi ? 'उदा. नवीनीकरण की अंतिम तिथि' : 'e.g., Renewal Deadline Notice'}
                  {...register('title')}
                  className="pl-10 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl"
                />
              </div>
              {errors.title && <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="body" className="text-xs font-black text-neutral-600 uppercase tracking-wider">{isHi ? 'मुख्य संदेश' : 'Message Body'}</Label>
              <Textarea
                id="body"
                placeholder={isHi ? 'सूचना का विवरण लिखें...' : 'Type the broadcast message details here...'}
                {...register('body')}
                rows={3}
                className="focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl resize-none"
              />
              {errors.body && <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {errors.body.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-black text-neutral-600 uppercase tracking-wider">{isHi ? 'सूचना का प्रकार' : 'Broadcast Type'}</Label>
                <Select value={watch('type')} onValueChange={(v) => setValue('type', v as FormData['type'])} className="w-full">
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder={isHi ? 'जानकारी' : 'Info'} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">{isHi ? 'जानकारी' : 'Info'}</SelectItem>
                    <SelectItem value="warning">{isHi ? 'चेतावनी' : 'Warning'}</SelectItem>
                    <SelectItem value="alert">{isHi ? 'सतर्कता' : 'Alert'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-black text-neutral-600 uppercase tracking-wider">{isHi ? 'लक्षित दर्शक' : 'Target Audience'}</Label>
                <Select value={watch('audience')} onValueChange={(v) => setValue('audience', v as FormData['audience'])} className="w-full">
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder={isHi ? 'सभी' : 'All'} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isHi ? 'सभी (All)' : 'All'}</SelectItem>
                    <SelectItem value="drivers">{isHi ? 'ड्राइवर (Drivers)' : 'Drivers'}</SelectItem>
                    <SelectItem value="district">{isHi ? 'जिला अधिकारी (District)' : 'District'}</SelectItem>
                    <SelectItem value="admin">{isHi ? 'केवल एडमिन (Admin)' : 'Admin'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              disabled={createNotification.isPending}
              className="w-full rounded-xl bg-blue-950 hover:bg-blue-900 py-3 text-sm font-black text-white transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <Send className="h-4 w-4" />
              {createNotification.isPending ? (isHi ? 'प्रसारित किया जा रहा है...' : 'Broadcasting...') : (isHi ? 'सूचना प्रसारित करें' : 'Broadcast Notification')}
            </Button>
          </form>
        </div>

        {/* Right Notifications List Panel */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-3 border-b border-neutral-100 pb-4 mb-2">
            <div className="rounded-xl bg-neutral-100 p-2.5 text-neutral-600 shadow-sm">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-neutral-900 text-base">{isHi ? 'प्रसारण इतिहास' : 'Broadcast History'}</h2>
              <p className="text-xs text-neutral-500">{isHi ? 'हाल ही में जारी किए गए अलर्ट और ब्रॉडकास्ट' : 'Recently issued system alerts and broadcasts'}</p>
            </div>
          </div>

          {isLoading && <SkeletonCard />}
          {isError && <ErrorState onRetry={() => refetch()} />}
          {!isLoading && !isError && !data?.length && (
            <EmptyState
              icon={Bell}
              title={isHi ? 'कोई सूचना नहीं' : 'No notifications'}
              description={isHi ? 'प्रकाशित सूचनाएं यहां दिखाई देंगी।' : 'Published notifications will appear here.'}
              className="py-10 bg-white border border-neutral-200 rounded-2xl shadow-card"
            />
          )}

          <div className="space-y-4">
            {data?.map((n) => {
              const isAlert = n.type === 'alert'
              const isWarning = n.type === 'warning'
              return (
                <div
                  key={n.id}
                  className={cn(
                    'rounded-xl border p-4 bg-white shadow-card hover:-translate-y-0.5 transition-all duration-200 border-l-4',
                    isAlert
                      ? 'border-red-500 border-neutral-200/80 bg-gradient-to-r from-red-50/20 to-transparent'
                      : isWarning
                      ? 'border-amber-500 border-neutral-200/80 bg-gradient-to-r from-amber-50/20 to-transparent'
                      : 'border-blue-500 border-neutral-200/80 bg-gradient-to-r from-blue-50/10 to-transparent'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 min-w-0 w-full">
                      <div
                        className={cn(
                          'rounded-lg p-2 mt-0.5 shrink-0',
                          isAlert
                            ? 'bg-red-50 text-red-600'
                            : isWarning
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-blue-50 text-blue-600'
                        )}
                      >
                        <Bell className="h-4.5 w-4.5" />
                      </div>
                      <div className="space-y-1 min-w-0 w-full">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-neutral-900 text-sm leading-tight truncate">{n.title}</span>
                          <StatusBadge
                            variant={isAlert ? 'danger' : isWarning ? 'warning' : 'info'}
                            label={translateType(n.type)}
                          />
                        </div>
                        <p className="text-sm text-neutral-700 leading-relaxed break-words">{n.body}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 mt-2 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDate(n.createdAt)}
                          </span>
                          <span className="text-neutral-300">•</span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {isHi ? 'लक्षित दर्शक:' : 'Audience:'} {translateAudience(n.audience)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
