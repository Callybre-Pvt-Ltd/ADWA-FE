import { mockEvents } from '../../mock-data/events.mock'
import { delay } from '../../utils/formatters'
import type { Event, EventFilters, CreateEventDto } from '../../types/event.types'

const SIMULATED_DELAY = 800
let events = [...mockEvents]

export const eventsService = {
  async getAll(filters?: EventFilters): Promise<Event[]> {
    await delay(SIMULATED_DELAY)
    let result = [...events]
    if (filters?.status && filters.status !== 'all') {
      result = result.filter((e) => e.status === filters.status)
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      result = result.filter((e) => e.title.toLowerCase().includes(q))
    }
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },

  async create(data: CreateEventDto): Promise<Event> {
    await delay(800)
    const event: Event = {
      ...data,
      id: `evt-${Date.now()}`,
      status: new Date(data.date) > new Date() ? 'upcoming' : 'past',
      createdAt: new Date().toISOString(),
    }
    events = [event, ...events]
    return event
  },

  async delete(id: string): Promise<void> {
    await delay(400)
    events = events.filter((e) => e.id !== id)
  },
}
