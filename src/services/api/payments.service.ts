import { apiClient, unwrapPaginated, unwrapResponse } from './client'
import { buildQueryParams, extractError, toCamelCase } from './mappers'
import type { APIResponse } from '@/types/api.types'
import type { Payment, PaymentFilters, PaymentStatus } from '@/types/payment.types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiPayment = Record<string, any>

function mapPaymentStatus(status: string): PaymentStatus {
  if (status === 'COLLECTED') return 'collected'
  if (status === 'CONFIRMED') return 'confirmed'
  return 'pending'
}

function mapPayment(raw: ApiPayment): Payment {
  const item = toCamelCase<ApiPayment>(raw)
  const card = item.driverCard as ApiPayment | undefined
  const driver = card?.driver as ApiPayment | undefined
  return {
    id: item.id,
    driverId: item.driverCardId ?? '',
    driverName: card?.fullNameSnapshot ?? driver?.fullName ?? '',
    district: driver?.district?.name ?? '',
    amount: Number(item.amount ?? 0),
    status: mapPaymentStatus(item.status),
    collectedAt: item.collectedAt ?? undefined,
    confirmedAt: item.confirmedAt ?? undefined,
    collectedBy: item.collectedBy ?? undefined,
    referenceNumber: card?.cardNumber ?? item.id,
    createdAt: item.createdAt,
  }
}

export const paymentsService = {
  async getAll(filters?: PaymentFilters): Promise<Payment[]> {
    try {
      const backendStatus =
        filters?.status === 'collected'
          ? 'COLLECTED'
          : filters?.status === 'confirmed'
            ? 'CONFIRMED'
            : undefined

      const { data } = await apiClient.get<APIResponse<ApiPayment[]>>(
        `/payments${buildQueryParams({
          status: backendStatus,
          page: 1,
          size: 100,
        })}`,
      )
      let items = unwrapPaginated(data).items.map(mapPayment)
      if (filters?.search) {
        const q = filters.search.toLowerCase()
        items = items.filter((p) => p.referenceNumber.toLowerCase().includes(q))
      }
      return items
    } catch (error) {
      throw await extractError(error)
    }
  },

  async getById(id: string): Promise<Payment> {
    try {
      const { data } = await apiClient.get<APIResponse<ApiPayment>>(`/payments/${id}`)
      return mapPayment(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },

  async collect(driverCardId: string, amount: number, file: File): Promise<Payment> {
    try {
      const formData = new FormData()
      formData.append('driver_card_id', driverCardId)
      formData.append('amount', String(amount))
      formData.append('file', file)

      const { data } = await apiClient.post<APIResponse<ApiPayment>>('/payments/collect', formData)
      return mapPayment(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },

  async confirm(id: string): Promise<Payment> {
    try {
      const { data } = await apiClient.post<APIResponse<ApiPayment>>(`/payments/${id}/confirm`)
      return mapPayment(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },

  async updateStatus(id: string, status: PaymentStatus): Promise<Payment> {
    if (status === 'confirmed') return this.confirm(id)
    throw new Error(`Cannot set payment status to ${status} via API`)
  },

  async getStats() {
    const payments = await this.getAll()
    return {
      total: payments.length,
      pending: payments.filter((p) => p.status === 'pending').length,
      collected: payments.filter((p) => p.status === 'collected').length,
      confirmed: payments.filter((p) => p.status === 'confirmed').length,
    }
  },
}
