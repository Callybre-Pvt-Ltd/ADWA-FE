import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsService } from '../services'
import type { EventFilters, CreateEventDto } from '../types/event.types'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

export const EVENTS_QUERY_KEY = ['events'] as const

export function useEvents(filters?: EventFilters) {
  const { i18n } = useTranslation()
  return useQuery({
    queryKey: [...EVENTS_QUERY_KEY, i18n.language, filters],
    queryFn: () => eventsService.getAll(filters),
    staleTime: 1000 * 60 * 5,
  })
}

export function usePublicEvents(filters?: EventFilters) {
  const { i18n } = useTranslation()
  return useQuery({
    queryKey: [...EVENTS_QUERY_KEY, 'public', i18n.language, filters],
    queryFn: async () => {
      const events = await eventsService.getPublic()
      if (!filters?.status || filters.status === 'all') return events
      return events.filter((e) => e.status === filters.status)
    },
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

export function usePublishEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => eventsService.publish(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EVENTS_QUERY_KEY })
      toast.success('Event published')
    },
    onError: (err: Error) => toast.error(`Failed to publish: ${err.message}`),
  })
}
