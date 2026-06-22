export type Event = {
  id: string
  title: string
  description: string
  date: string
  location: string
  imageUrl?: string
  status: 'upcoming' | 'past' | 'cancelled'
  createdAt: string
  slug?: string
  backendStatus?: string
}

export type EventFilters = {
  status?: 'upcoming' | 'past' | 'all'
  search?: string
}

export type CreateEventDto = Omit<Event, 'id' | 'createdAt' | 'status'>
