import { apiClient, unwrapPaginated, unwrapResponse } from './client'
import { buildQueryParams, extractError, resolveStorageUrl, toCamelCase } from './mappers'
import type { APIResponse, PaginatedResult } from '@/types/api.types'

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
  /** Driver display name from card snapshot (for dropdown labels). */
  fullNameSnapshot?: string | null
  hasPdf?: boolean
}

export type CardSnapshot = {
  cardId: string
  driverId: string
  cardNumber: string
  verificationCode: string
  fullName?: string | null
  fatherName?: string | null
  designation?: string | null
  mobileNumber?: string | null
  licenseNumber?: string | null
  policeStation?: string | null
  city?: string | null
  state?: string | null
  bloodGroup?: string | null
  dateOfBirth?: string | null
  issueDate?: string | null
  expiryDate?: string | null
  generatedAt?: string | null
  hasPdf: boolean
  photoUrl?: string | null
  hasPhoto: boolean
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
  }): Promise<PaginatedResult<DriverCard>> {
    try {
      const { data } = await apiClient.get<APIResponse<ApiCard[]>>(
        `/cards${buildQueryParams({
          status: params?.status,
          page: params?.page ?? 1,
          size: params?.size ?? 10,
        })}`,
      )
      const res = unwrapPaginated(data)
      return {
        ...res,
        items: res.items.map(mapCard),
      }
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
      const resolved = resolveStorageUrl(result.download_url)
      return {
        downloadUrl: resolved ?? result.download_url,
        expiresIn: result.expires_in,
      }
    } catch (error) {
      throw await extractError(error)
    }
  },

  /**
   * Download the generated PDF without navigating the SPA away.
   *
   * `window.location.href = signedUrl` crashes many mobile browsers (Chrome /
   * OEM WebViews open the huge PDF in-viewer and OOM → "System crashed due to
   * an unknown error"). Instead we stream bytes through our API and save via
   * a same-origin blob URL + <a download>.
   */
  async downloadPdf(id: string, filename?: string): Promise<void> {
    try {
      const { data, headers } = await apiClient.get<Blob>(`/cards/${id}/pdf`, {
        responseType: 'blob',
        timeout: 120_000,
      })

      // Axios can hand us a JSON error body typed as Blob when the API fails.
      if (data.type && data.type.includes('application/json')) {
        const text = await data.text()
        let message = 'Could not download ID card PDF'
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
      link.download = filename || fromHeader || `ADWA-card-${id}.pdf`
      link.rel = 'noopener'
      document.body.appendChild(link)
      try {
        link.click()
      } finally {
        link.remove()
      }
      // Delayed revoke — some mobile browsers start the download asynchronously.
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
    } catch (error) {
      throw await extractError(error)
    }
  },

  async getVerifyUrl(id: string): Promise<{ verificationUrl: string; verificationCode: string }> {
    try {
      const { data } = await apiClient.get<APIResponse<{ verification_url: string; verification_code: string }>>(
        `/cards/${id}/verify-url`,
      )
      const result = unwrapResponse(data)
      return {
        verificationUrl: result.verification_url,
        verificationCode: result.verification_code,
      }
    } catch (error) {
      throw await extractError(error)
    }
  },

  async getQrBlob(id: string): Promise<Blob> {
    try {
      const { data } = await apiClient.get<Blob>(`/cards/${id}/qr`, { responseType: 'blob' })
      return data
    } catch (error) {
      throw await extractError(error)
    }
  },

  async getPhotoBlob(id: string): Promise<Blob> {
    try {
      const { data } = await apiClient.get<Blob>(`/cards/${id}/photo`, { responseType: 'blob' })
      return data
    } catch (error) {
      throw await extractError(error)
    }
  },

  async getSnapshot(id: string): Promise<CardSnapshot> {
    try {
      const { data } = await apiClient.get<APIResponse<Record<string, unknown>>>(`/cards/${id}/snapshot`)
      const snapshot = toCamelCase<CardSnapshot>(unwrapResponse(data))
      return { ...snapshot, photoUrl: resolveStorageUrl(snapshot.photoUrl) }
    } catch (error) {
      throw await extractError(error)
    }
  },

  async getPreviewBlob(id: string, payload?: Record<string, unknown>): Promise<Blob> {
    try {
      const { data } = await apiClient.post<Blob>(`/cards/${id}/preview`, payload ?? {}, {
        responseType: 'blob',
      })
      return data
    } catch (error) {
      throw await extractError(error)
    }
  },

  async generate(id: string, payload: Record<string, unknown>): Promise<CardSnapshot> {
    try {
      const { data } = await apiClient.post<APIResponse<Record<string, unknown>>>(
        `/cards/${id}/generate`,
        payload,
      )
      const snapshot = toCamelCase<CardSnapshot>(unwrapResponse(data))
      return { ...snapshot, photoUrl: resolveStorageUrl(snapshot.photoUrl) }
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

  /**
   * Soft delete. Excluded from listings; the card's number becomes eligible
   * for reuse by the next card issued in that district.
   */
  async deleteCard(id: string, reason?: string): Promise<DriverCard> {
    try {
      const { data } = await apiClient.delete<APIResponse<ApiCard>>(`/cards/${id}`, {
        data: { reason: reason ?? null },
      })
      return mapCard(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },

  async uploadPhoto(id: string, file: File): Promise<CardSnapshot> {
    try {
      const formData = new FormData()
      formData.append('photo', file)
      const { data } = await apiClient.post<APIResponse<Record<string, unknown>>>(
        `/cards/${id}/photo`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      const snapshot = toCamelCase<CardSnapshot>(unwrapResponse(data))
      return { ...snapshot, photoUrl: resolveStorageUrl(snapshot.photoUrl) }
    } catch (error) {
      throw await extractError(error)
    }
  },
}
