import { apiClient, unwrapResponse } from './client'
import { extractError, toCamelCase } from './mappers'
import type { APIResponse } from '@/types/api.types'

export type DocumentAvailability = {
  available: boolean
  downloadUrl: string | null
  expiresIn: number | null
  reason: string | null
}

export type PublicDocuments = {
  memberNumber: string
  fullName: string
  idCard: DocumentAvailability
  paymentReceipt: DocumentAvailability
  certificate: DocumentAvailability
}

export const publicDocumentsService = {
  async getDocuments(memberNumber: string): Promise<PublicDocuments> {
    try {
      const { data } = await apiClient.get<APIResponse<Record<string, unknown>>>(
        `/public/documents/${encodeURIComponent(memberNumber)}`,
      )
      return toCamelCase<PublicDocuments>(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },
}
