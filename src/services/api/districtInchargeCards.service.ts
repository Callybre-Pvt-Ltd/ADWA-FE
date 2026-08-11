import { apiClient, unwrapPaginated, unwrapResponse } from './client'
import { buildQueryParams, extractError, toCamelCase } from './mappers'
import type { APIResponse, PaginatedResult } from '@/types/api.types'

export type DistrictInchargeCard = {
  id: string
  districtId: string
  cardNumber: string
  verificationCode: string
  status: string
  fullName: string
  designation?: string
  districtNameSnapshot: string
  districtCodeSnapshot: string
  issuedAt?: string
  expiresAt?: string
  verificationUrl?: string
  createdAt?: string
}

export type IssueDistrictInchargeCardResult = {
  card: DistrictInchargeCard
  verificationUrl: string
}

export type IssueDistrictInchargeCardInput = {
  districtId: string
  fullName: string
  designation?: string
  issuedAt?: string
  expiresAt?: string
  photo: File
}

export type ListDistrictInchargeCardsFilters = {
  districtId?: string
  search?: string
  page?: number
  size?: number
}

export const districtInchargeCardsService = {
  async issue(input: IssueDistrictInchargeCardInput): Promise<IssueDistrictInchargeCardResult> {
    try {
      const formData = new FormData()
      formData.append('district_id', input.districtId)
      formData.append('full_name', input.fullName)
      if (input.designation) formData.append('designation', input.designation)
      if (input.issuedAt) formData.append('issued_at', input.issuedAt)
      if (input.expiresAt) formData.append('expires_at', input.expiresAt)
      formData.append('photo', input.photo)

      const { data } = await apiClient.post<APIResponse<Record<string, unknown>>>(
        '/district-incharge-cards',
        formData,
      )
      return toCamelCase<IssueDistrictInchargeCardResult>(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },

  async list(filters?: ListDistrictInchargeCardsFilters): Promise<PaginatedResult<DistrictInchargeCard>> {
    try {
      const params: Record<string, string | number | undefined> = {
        district_id: filters?.districtId,
        search: filters?.search,
        page: filters?.page ?? 1,
        size: filters?.size ?? 20,
      }
      const { data } = await apiClient.get<APIResponse<Record<string, unknown>[]>>(
        `/district-incharge-cards${buildQueryParams(params)}`,
      )
      const res = unwrapPaginated(data)
      return {
        ...res,
        items: res.items.map((item) => toCamelCase<DistrictInchargeCard>(item)),
      }
    } catch (error) {
      throw await extractError(error)
    }
  },
}
