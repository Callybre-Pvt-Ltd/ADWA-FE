import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsService } from '../services/mock/events.service'
import type { EventFilters, CreateEventDto } from '../types/event.types'
import { toast } from 'sonner'

export const EVENTS_QUERY_KEY = ['events'] as const

export function useEvents(filters?: EventFilters) {
  return useQuery({
    queryKey: [...EVENTS_QUERY_KEY, filters],
    queryFn: () => eventsService.getAll(filters),
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateEventDto) => eventsService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EVENTS_QUERY_KEY })
      toast.success('Event created')
    },
    onError: (err: Error) => toast.error(`Failed: ${err.message}`),
  })
}

export function useDeleteEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => eventsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EVENTS_QUERY_KEY })
      toast.success('Event deleted')
    },
    onError: (err: Error) => toast.error(`Failed: ${err.message}`),
  })
}
