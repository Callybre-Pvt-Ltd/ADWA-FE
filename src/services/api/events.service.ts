import { apiClient, unwrapPaginated, unwrapResponse } from './client'
import { buildQueryParams, extractError, toCamelCase } from './mappers'
import type { APIResponse } from '@/types/api.types'
import type { CreateEventDto, Event, EventFilters } from '@/types/event.types'
import i18n from '@/i18n'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiEvent = Record<string, any>

function mapEvent(raw: ApiEvent): Event {
  const item = toCamelCase<ApiEvent>(raw)
  const startDate = item.startDate ?? item.createdAt
  const isPast = startDate ? new Date(startDate) < new Date() : false
  let status: Event['status'] = 'upcoming'
  if (item.status === 'ARCHIVED') status = 'cancelled'
  else if (item.status === 'DRAFT') status = 'draft'
  else if (isPast) status = 'past'

  return {
    id: item.id,
    title: item.title,
    description: item.description ?? item.shortDescription ?? '',
    date: startDate ?? item.createdAt,
    location: item.location ?? '',
    imageUrl: item.imageUrl ?? undefined,
    status,
    createdAt: item.createdAt,
    slug: item.slug,
    backendStatus: item.status,
  }
}

const MOCK_EVENTS = [
  {
    id: 'evt-1',
    titleEn: 'National Drivers Awareness Summit 2026',
    titleHi: 'राष्ट्रीय चालक जागरूकता शिखर सम्मेलन 2026',
    descriptionEn: 'A national level summit focused on road safety, driver rights, and welfare policies. Joined by ministry officials and association leaders.',
    descriptionHi: 'सड़क सुरक्षा, चालक अधिकार और कल्याण नीतियों पर केंद्रित एक राष्ट्रीय स्तर का शिखर सम्मेलन। मंत्रालय के अधिकारी और संघ के नेता शामिल होंगे।',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(),
    locationEn: 'Bhopal, Madhya Pradesh',
    locationHi: 'भोपाल, मध्य प्रदेश',
    imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80',
    status: 'upcoming' as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'evt-2',
    titleEn: 'Free Health & Eye Checkup Camp',
    titleHi: 'निःशुल्क स्वास्थ्य एवं नेत्र जांच शिविर',
    descriptionEn: 'Free healthcare checkup camp focusing on vision tests and general physical checkups for all commercial vehicle drivers.',
    descriptionHi: 'सभी व्यावसायिक वाहन चालकों के लिए दृष्टि परीक्षण और सामान्य शारीरिक जांच पर केंद्रित मुफ्त स्वास्थ्य जांच शिविर।',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    locationEn: 'Indore, Madhya Pradesh',
    locationHi: 'इन्दौर, मध्य प्रदेश',
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
    status: 'upcoming' as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'evt-3',
    titleEn: 'Digital Literacy Workshop',
    titleHi: 'डिजिटल साक्षरता कार्यशाला',
    descriptionEn: 'Training drivers on how to access the ADWA portal, retrieve digital ID cards, apply for renewals, and use mobile payment gateways.',
    descriptionHi: 'चालकों को ADWA पोर्टल तक पहुंचने, डिजिटल आईडी कार्ड प्राप्त करने, नवीनीकरण के लिए आवेदन करने और मोबाइल भुगतान गेटवे का उपयोग करने का प्रशिक्षण।',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    locationEn: 'Gwalior, Madhya Pradesh',
    locationHi: 'ग्वालियर, मध्य प्रदेश',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    status: 'past' as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'evt-4',
    titleEn: 'ADWA Foundation Day Celebration',
    titleHi: 'ADWA स्थापना दिवस समारोह',
    descriptionEn: 'Celebrating years of unity and welfare services for commercial drivers across India with honors for long-serving members.',
    descriptionHi: 'लंबे समय तक सेवा करने वाले सदस्यों के सम्मान के साथ भारत भर में व्यावसायिक चालकों के लिए एकता और कल्याणकारी सेवाओं के वर्षों का जश्न मनाना।',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    locationEn: 'Jabalpur, Madhya Pradesh',
    locationHi: 'जबलपुर, मध्य प्रदेश',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    status: 'past' as const,
    createdAt: new Date().toISOString(),
  }
]

function getMockEvents(): Event[] {
  const isHi = i18n.language === 'hi'
  return MOCK_EVENTS.map(e => ({
    id: e.id,
    title: isHi ? e.titleHi : e.titleEn,
    description: isHi ? e.descriptionHi : e.descriptionEn,
    date: e.date,
    location: isHi ? e.locationHi : e.locationEn,
    imageUrl: e.imageUrl,
    status: e.status,
    createdAt: e.createdAt,
  }))
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
      console.warn('API call failed, returning mock events fallback:', error)
      let items = getMockEvents()
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
    }
  },

  async getPublic(): Promise<Event[]> {
    try {
      const { data } = await apiClient.get<APIResponse<ApiEvent[]>>('/events/public')
      const items = (unwrapResponse(data) ?? []).map(mapEvent)
      if (items.length > 0) return items
      return getMockEvents()
    } catch (error) {
      console.warn('API call failed, returning mock events fallback:', error)
      return getMockEvents()
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
