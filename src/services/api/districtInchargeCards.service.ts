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
  bloodGroup?: string
  mobileNumber?: string
  aadhaarNumber?: string
  licenseNumber?: string
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
  bloodGroup?: string
  mobileNumber?: string
  aadhaarNumber?: string
  licenseNumber?: string
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

export type UpdateDistrictInchargeCardInput = {
  fullName?: string
  designation?: string
  bloodGroup?: string
  mobileNumber?: string
  aadhaarNumber?: string
  licenseNumber?: string
  issuedAt?: string
  expiresAt?: string
}

export const districtInchargeCardsService = {
  async issue(input: IssueDistrictInchargeCardInput): Promise<IssueDistrictInchargeCardResult> {
    try {
      const formData = new FormData()
      formData.append('district_id', input.districtId)
      formData.append('full_name', input.fullName)
      if (input.designation) formData.append('designation', input.designation)
      if (input.bloodGroup) formData.append('blood_group', input.bloodGroup)
      if (input.mobileNumber) formData.append('mobile_number', input.mobileNumber)
      if (input.aadhaarNumber) formData.append('aadhaar_number', input.aadhaarNumber)
      if (input.licenseNumber) formData.append('license_number', input.licenseNumber)
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

  async update(id: string, input: UpdateDistrictInchargeCardInput): Promise<DistrictInchargeCard> {
    try {
      const payload: Record<string, string | undefined> = {
        full_name: input.fullName,
        designation: input.designation,
        blood_group: input.bloodGroup,
        mobile_number: input.mobileNumber,
        aadhaar_number: input.aadhaarNumber,
        license_number: input.licenseNumber,
        issued_at: input.issuedAt,
        expires_at: input.expiresAt,
      }
      const { data } = await apiClient.patch<APIResponse<Record<string, unknown>>>(
        `/district-incharge-cards/${id}`,
        payload,
      )
      return toCamelCase<DistrictInchargeCard>(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },

  async uploadPhoto(id: string, file: File): Promise<DistrictInchargeCard> {
    try {
      const formData = new FormData()
      formData.append('photo', file)
      const { data } = await apiClient.post<APIResponse<Record<string, unknown>>>(
        `/district-incharge-cards/${id}/photo`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      return toCamelCase<DistrictInchargeCard>(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },

  async getPhotoBlob(id: string): Promise<Blob> {
    try {
      const { data } = await apiClient.get<Blob>(`/district-incharge-cards/${id}/photo`, {
        responseType: 'blob',
      })
      return data
    } catch (error) {
      throw await extractError(error)
    }
  },

  /** Server-rendered PDF — card data + photo fetched from storage on the backend. */
  async downloadPdf(id: string, filename?: string): Promise<void> {
    try {
      const { data, headers } = await apiClient.get<Blob>(`/district-incharge-cards/${id}/pdf`, {
        responseType: 'blob',
        timeout: 120_000,
      })

      if (data.type?.includes('application/json')) {
        const text = await data.text()
        let message = 'Could not download district ID card PDF'
        try {
          const parsed = JSON.parse(text) as { message?: string; detail?: string }
          message = parsed.message || parsed.detail || message
        } catch { /* keep default */ }
        throw new Error(message)
      }

      const fromHeader = (() => {
        const cd = headers['content-disposition'] as string | undefined
        if (!cd) return undefined
        const m = /filename="([^"]+)"/i.exec(cd)
        return m?.[1]
      })()

      const objectUrl = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = filename || fromHeader || `ADWA-district-${id}.pdf`
      link.rel = 'noopener'
      document.body.appendChild(link)
      try {
        link.click()
      } finally {
        link.remove()
        setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000)
      }
    } catch (error) {
      throw await extractError(error)
    }
  },

  /**
   * Soft delete. Excluded from listings; the card's number becomes eligible
   * for reuse by the next card issued in that district.
   */
  async deleteCard(id: string, reason?: string): Promise<DistrictInchargeCard> {
    try {
      const { data } = await apiClient.delete<APIResponse<Record<string, unknown>>>(
        `/district-incharge-cards/${id}`,
        { data: { reason: reason ?? null } },
      )
      return toCamelCase<DistrictInchargeCard>(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },
}
