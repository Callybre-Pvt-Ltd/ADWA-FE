import { apiClient, unwrapResponse } from './client'
import { extractError, toCamelCase } from './mappers'
import type { APIResponse } from '@/types/api.types'

export type CardVerificationStatus = 'VALID' | 'EXPIRED' | 'REVOKED' | 'NOT_FOUND'

export type CardVerificationResult = {
  status: CardVerificationStatus
  driverName: string | null
  memberNumber: string | null
  district: string | null
  photoUrl: string | null
  expiryDate: string | null
  metadata?: {
    licenseNumber?: string
    vehicleNumber?: string
    issueDate?: string
    cardNumber?: string
    driverStatus?: string
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiVerification = Record<string, any>

function mapVerification(raw: ApiVerification): CardVerificationResult {
  const item = toCamelCase<ApiVerification>(raw)
  return {
    status: item.status as CardVerificationStatus,
    driverName: item.driverName ?? null,
    memberNumber: item.memberNumber ?? null,
    district: item.district ?? null,
    photoUrl: item.photoUrl ?? null,
    expiryDate: item.expiryDate ?? null,
    metadata: item.metadata ?? undefined,
  }
}

export const verificationService = {
  async verify(code: string): Promise<CardVerificationResult> {
    try {
      const { data } = await apiClient.get<APIResponse<ApiVerification>>(`/verification/${code}`)
      return mapVerification(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },
}
