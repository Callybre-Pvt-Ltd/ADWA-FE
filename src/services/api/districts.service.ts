import { apiClient, unwrapResponse } from './client'
import { extractError, toCamelCase } from './mappers'
import type { APIResponse } from '@/types/api.types'
import type { District, CreateDistrictDto } from '@/types/district.types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiDistrict = Record<string, any>

function mapDistrict(raw: ApiDistrict): District {
  const item = toCamelCase<ApiDistrict>(raw)
  return {
    id: item.id,
    name: item.name,
    code: item.code ?? '',
    state: item.state ?? '',
    status: item.status === 'INACTIVE' ? 'inactive' : 'active',
    contactPhone: item.contactPhone ?? null,
  }
}

export const districtsService = {
  async getAll(): Promise<District[]> {
    try {
      const { data } = await apiClient.get<APIResponse<ApiDistrict[]>>('/districts')
      return (unwrapResponse(data) ?? []).map(mapDistrict)
    } catch (error) {
      throw await extractError(error)
    }
  },

  async getPublic(state?: string): Promise<District[]> {
    try {
      const { data } = await apiClient.get<APIResponse<ApiDistrict[]>>('/districts/public', {
        params: state ? { state } : undefined,
      })
      return (unwrapResponse(data) ?? []).map(mapDistrict)
    } catch (error) {
      throw await extractError(error)
    }
  },

  async getById(id: string): Promise<District> {
    try {
      const { data } = await apiClient.get<APIResponse<ApiDistrict>>(`/districts/${id}`)
      return mapDistrict(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },

  async create(dto: CreateDistrictDto): Promise<District> {
    try {
      const { data } = await apiClient.post<APIResponse<ApiDistrict>>('/districts', {
        name: dto.name,
        code: dto.code ?? dto.name.toLowerCase().replace(/\s+/g, '-').slice(0, 50),
        state: dto.state,
        status: dto.status === 'inactive' ? 'INACTIVE' : 'ACTIVE',
        contact_phone: dto.contactPhone?.trim() || null,
      })
      return mapDistrict(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },

  async update(id: string, dto: Partial<CreateDistrictDto>): Promise<District> {
    try {
      const payload: Record<string, string | null> = {}
      if (dto.name) payload.name = dto.name
      if (dto.code) payload.code = dto.code
      if (dto.state) payload.state = dto.state
      if (dto.status) payload.status = dto.status === 'inactive' ? 'INACTIVE' : 'ACTIVE'
      if (dto.contactPhone !== undefined) {
        payload.contact_phone = dto.contactPhone?.trim() || null
      }

      const { data } = await apiClient.patch<APIResponse<ApiDistrict>>(`/districts/${id}`, payload)
      return mapDistrict(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },
}
