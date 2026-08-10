import { apiClient, unwrapResponse } from './client'
import { extractError, toCamelCase } from './mappers'
import type { APIResponse } from '@/types/api.types'

export type IssueDistrictInchargeCardResult = {
  card: {
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
  }
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
}
