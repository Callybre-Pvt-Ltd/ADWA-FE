import { apiClient, unwrapPaginated, unwrapResponse } from './client'
import { buildQueryParams, extractError, toCamelCase } from './mappers'
import type { APIResponse } from '@/types/api.types'
import type { CreateUserDto, UpdateUserDto, User, UserFilters } from '@/types/user.types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiUser = Record<string, any>

function mapUser(raw: ApiUser): User {
  const item = toCamelCase<ApiUser>(raw)
  return {
    id: item.id,
    fullName: item.fullName,
    email: item.email,
    mobileNumber: item.mobileNumber,
    role: item.role,
    status: item.status,
    districtId: item.districtId ?? null,
    lastLoginAt: item.lastLoginAt ?? null,
    createdAt: item.createdAt,
  }
}

export const usersService = {
  async list(filters?: UserFilters): Promise<User[]> {
    try {
      const { data } = await apiClient.get<APIResponse<ApiUser[]>>(
        `/users${buildQueryParams({
          search: filters?.search,
          role: filters?.role,
          status: filters?.status,
          district_id: filters?.districtId,
          page: filters?.page,
          size: filters?.size,
        })}`,
      )
      return unwrapPaginated(data).items.map(mapUser)
    } catch (error) {
      throw await extractError(error)
    }
  },

  async get(id: string): Promise<User> {
    try {
      const { data } = await apiClient.get<APIResponse<ApiUser>>(`/users/${id}`)
      return mapUser(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },

  async create(dto: CreateUserDto): Promise<User> {
    try {
      const { data } = await apiClient.post<APIResponse<ApiUser>>('/users', {
        full_name: dto.fullName,
        email: dto.email,
        mobile_number: dto.mobileNumber,
        password: dto.password,
        role: dto.role,
        district_id: dto.districtId ?? null,
      })
      return mapUser(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    try {
      const payload: Record<string, string | null> = {}
      if (dto.fullName) payload.full_name = dto.fullName
      if (dto.email) payload.email = dto.email
      if (dto.mobileNumber) payload.mobile_number = dto.mobileNumber
      if (dto.role) payload.role = dto.role
      if (dto.status) payload.status = dto.status
      if (dto.districtId !== undefined) payload.district_id = dto.districtId

      const { data } = await apiClient.patch<APIResponse<ApiUser>>(`/users/${id}`, payload)
      return mapUser(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },

  async deactivate(id: string): Promise<void> {
    try {
      const { data } = await apiClient.delete<APIResponse<null>>(`/users/${id}`)
      unwrapResponse(data)
    } catch (error) {
      throw await extractError(error)
    }
  },

  async resetPassword(id: string, password: string): Promise<void> {
    try {
      const { data } = await apiClient.post<APIResponse<null>>(`/users/${id}/reset-password`, {
        password,
      })
      unwrapResponse(data)
    } catch (error) {
      throw await extractError(error)
    }
  },
}
