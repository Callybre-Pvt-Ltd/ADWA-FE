import { apiClient, unwrapResponse } from './client'
import { extractError, toCamelCase } from './mappers'
import type { APIResponse } from '@/types/api.types'
import type { CardVerificationResult } from '@/types/driver.types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiVerification = Record<string, any>

function mapVerification(raw: ApiVerification): CardVerificationResult {
  const item = toCamelCase<ApiVerification>(raw)
  return {
    status: item.status,
    driverName: item.driverName ?? undefined,
    memberNumber: item.memberNumber ?? undefined,
    district: item.district ?? undefined,
    photoUrl: item.photoUrl ?? undefined,
    expiryDate: item.expiryDate ?? undefined,
    metadata: item.metadata
      ? {
          cardNumber: item.metadata.cardNumber,
          issueDate: item.metadata.issueDate,
          licenseNumber: item.metadata.licenseNumber,
          vehicleNumber: item.metadata.vehicleNumber,
          vehicleType: item.metadata.vehicleType,
          bloodGroup: item.metadata.bloodGroup,
          phoneNumber: item.metadata.phoneNumber,
          email: item.metadata.email,
          dateOfBirth: item.metadata.dateOfBirth,
          fatherOrSpouseName: item.metadata.fatherOrSpouseName,
          city: item.metadata.city,
          state: item.metadata.state,
          policeStation: item.metadata.policeStation,
          designation: item.metadata.designation,
          driverStatus: item.metadata.driverStatus,
        }
      : undefined,
  }
}

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v1\/?$/, '') ?? 'http://localhost:8000'

export function resolveVerificationPhotoUrl(photoPath: string | undefined): string | undefined {
  if (!photoPath) return undefined
  if (photoPath.startsWith('http')) return photoPath
  return `${API_BASE}${photoPath}`
}

export const verificationService = {
  async verify(code: string): Promise<CardVerificationResult> {
    try {
      const { data } = await apiClient.get<APIResponse<ApiVerification>>(`/verification/${code}`)
      const result = mapVerification(unwrapResponse(data))
      return {
        ...result,
        photoUrl: resolveVerificationPhotoUrl(result.photoUrl),
      }
    } catch (error) {
      throw await extractError(error)
    }
  },
}
