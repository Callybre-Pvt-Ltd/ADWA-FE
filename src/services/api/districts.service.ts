import { apiClient, unwrapPaginated, unwrapResponse } from './client'
import { buildQueryParams, extractError, toCamelCase } from './mappers'
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
    status: item.status === 'INACTIVE' ? 'inactive' : 'active',
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

  async getPublic(): Promise<District[]> {
    try {
      const { data } = await apiClient.get<APIResponse<ApiDistrict[]>>('/districts/public')
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
        status: dto.status === 'inactive' ? 'INACTIVE' : 'ACTIVE',
      })
      return mapDistrict(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },

  async update(id: string, dto: Partial<CreateDistrictDto>): Promise<District> {
    try {
      const payload: Record<string, string> = {}
      if (dto.name) payload.name = dto.name
      if (dto.code) payload.code = dto.code
      if (dto.status) payload.status = dto.status === 'inactive' ? 'INACTIVE' : 'ACTIVE'

      const { data } = await apiClient.patch<APIResponse<ApiDistrict>>(`/districts/${id}`, payload)
      return mapDistrict(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },
}
