import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreateEvent } from '@/hooks/useEvents'
import type { Event } from '@/types/event.types'

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  date: z.string().min(1),
  location: z.string().min(2),
  imageUrl: z.string().url().optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

interface EventFormProps {
  event?: Event
  onSuccess?: () => void
}

export default function EventForm({ onSuccess }: EventFormProps) {
  const createEvent = useCreateEvent()
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = handleSubmit(async (data) => {
    await createEvent.mutateAsync({
      title: data.title,
      description: data.description,
      date: new Date(data.date).toISOString(),
      location: data.location,
      imageUrl: data.imageUrl || undefined,
    })
    reset()
    onSuccess?.()
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register('title')} className="mt-1" />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} rows={3} className="mt-1" />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="datetime-local" {...register('date')} className="mt-1" />
          {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" {...register('location')} className="mt-1" />
          {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
        </div>
      </div>
      <div>
        <Label htmlFor="imageUrl">Image URL (optional)</Label>
        <Input id="imageUrl" {...register('imageUrl')} className="mt-1" />
      </div>
      <Button
        type="submit"
        loading={createEvent.isPending}
        loadingText="Creating…"
        className="w-full"
      >
        Create Event
      </Button>
    </form>
  )
}
