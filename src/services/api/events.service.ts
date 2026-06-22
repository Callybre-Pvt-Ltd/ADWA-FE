import { apiClient, unwrapPaginated, unwrapResponse } from './client'
import { buildQueryParams, extractError, toCamelCase } from './mappers'
import type { APIResponse } from '@/types/api.types'
import type { CreateEventDto, Event, EventFilters } from '@/types/event.types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiEvent = Record<string, any>

function mapEvent(raw: ApiEvent): Event {
  const item = toCamelCase<ApiEvent>(raw)
  const startDate = item.startDate ?? item.createdAt
  const isPast = startDate ? new Date(startDate) < new Date() : false
  let status: Event['status'] = 'upcoming'
  if (item.status === 'ARCHIVED' || item.status === 'DRAFT') status = 'cancelled'
  else if (isPast) status = 'past'

  return {
    id: item.id,
    title: item.title,
    description: item.description ?? item.shortDescription ?? '',
    date: startDate ?? item.createdAt,
    location: '',
    imageUrl: undefined,
    status,
    createdAt: item.createdAt,
    slug: item.slug,
    backendStatus: item.status,
  }
}

export const eventsService = {
  async getAll(filters?: EventFilters): Promise<Event[]> {
    try {
      const publishedOnly = filters?.status === 'upcoming'
      const { data } = await apiClient.get<APIResponse<ApiEvent[]>>(
        `/events${buildQueryParams({
          published_only: publishedOnly ? true : undefined,
          page: 1,
          size: 100,
        })}`,
      )
      let items = unwrapPaginated(data).items.map(mapEvent)
      if (filters?.search) {
        const q = filters.search.toLowerCase()
        items = items.filter(
          (e) => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q),
        )
      }
      if (filters?.status && filters.status !== 'all') {
        items = items.filter((e) => e.status === filters.status)
      }
      return items
    } catch (error) {
      throw await extractError(error)
    }
  },

  async getPublic(): Promise<Event[]> {
    try {
      const { data } = await apiClient.get<APIResponse<ApiEvent[]>>('/events/public')
      return (unwrapResponse(data) ?? []).map(mapEvent)
    } catch (error) {
      throw await extractError(error)
    }
  },

  async create(dto: CreateEventDto): Promise<Event> {
    try {
      const slug =
        dto.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') + `-${Date.now()}`

      const { data } = await apiClient.post<APIResponse<ApiEvent>>('/events', {
        title: dto.title,
        slug,
        description: dto.description,
        short_description: dto.description.slice(0, 200),
        start_date: dto.date,
      })
      return mapEvent(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiClient.patch(`/events/${id}`, { status: 'ARCHIVED' })
    } catch (error) {
      throw await extractError(error)
    }
  },

  async publish(id: string): Promise<Event> {
    try {
      const { data } = await apiClient.post<APIResponse<ApiEvent>>(`/events/${id}/publish`)
      return mapEvent(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },
}
