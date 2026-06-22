import { apiClient, unwrapPaginated, unwrapResponse } from './client'
import { buildQueryParams, extractError, toCamelCase } from './mappers'
import type { APIResponse } from '@/types/api.types'

export type CardStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'REPLACED'

export type DriverCard = {
  id: string
  driverId: string
  cardNumber: string
  verificationCode: string
  version: number
  status: CardStatus
  issuedAt: string | null
  expiresAt: string | null
  generatedAt: string | null
  createdAt: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiCard = Record<string, any>

function mapCard(raw: ApiCard): DriverCard {
  return toCamelCase<DriverCard>(raw)
}

export const cardsService = {
  async list(params?: {
    status?: CardStatus
    page?: number
    size?: number
  }): Promise<DriverCard[]> {
    try {
      const { data } = await apiClient.get<APIResponse<ApiCard[]>>(
        `/cards${buildQueryParams({
          status: params?.status,
          page: params?.page,
          size: params?.size,
        })}`,
      )
      return unwrapPaginated(data).items.map(mapCard)
    } catch (error) {
      throw await extractError(error)
    }
  },

  async get(id: string): Promise<DriverCard> {
    try {
      const { data } = await apiClient.get<APIResponse<ApiCard>>(`/cards/${id}`)
      return mapCard(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },

  async getHistory(id: string): Promise<DriverCard[]> {
    try {
      const { data } = await apiClient.get<APIResponse<ApiCard[]>>(`/cards/${id}/history`)
      return (unwrapResponse(data) ?? []).map(mapCard)
    } catch (error) {
      throw await extractError(error)
    }
  },

  async getDownloadUrl(id: string): Promise<{ downloadUrl: string; expiresIn: number }> {
    try {
      const { data } = await apiClient.get<APIResponse<{ download_url: string; expires_in: number }>>(
        `/cards/${id}/download`,
      )
      const result = unwrapResponse(data)
      return { downloadUrl: result.download_url, expiresIn: result.expires_in }
    } catch (error) {
      throw await extractError(error)
    }
  },

  async renew(id: string): Promise<DriverCard> {
    try {
      const { data } = await apiClient.post<APIResponse<ApiCard>>(`/cards/${id}/renew`)
      return mapCard(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },

  async revoke(id: string, reason: string): Promise<DriverCard> {
    try {
      const { data } = await apiClient.post<APIResponse<ApiCard>>(`/cards/${id}/revoke`, { reason })
      return mapCard(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },
}
