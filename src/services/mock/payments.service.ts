import { mockPayments } from '../../mock-data/payments.mock'
import { delay } from '../../utils/formatters'
import type { Payment, PaymentFilters, PaymentStatus } from '../../types/payment.types'

const SIMULATED_DELAY = 800
let payments = [...mockPayments]

export const paymentsService = {
  async getAll(filters?: PaymentFilters): Promise<Payment[]> {
    await delay(SIMULATED_DELAY)
    let result = [...payments]
    if (filters?.status && filters.status !== 'all') {
      result = result.filter((p) => p.status === filters.status)
    }
    if (filters?.district) {
      result = result.filter((p) => p.district === filters.district)
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (p) => p.driverName.toLowerCase().includes(q) || p.referenceNumber.toLowerCase().includes(q),
      )
    }
    return result
  },

  async getById(id: string): Promise<Payment> {
    await delay(SIMULATED_DELAY)
    const payment = payments.find((p) => p.id === id)
    if (!payment) throw new Error('Payment not found')
    return payment
  },

  async updateStatus(id: string, status: PaymentStatus): Promise<Payment> {
    await delay(600)
    const idx = payments.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('Payment not found')
    const now = new Date().toISOString()
    const updates: Partial<Payment> = { status }
    if (status === 'collected') updates.collectedAt = now
    if (status === 'waiting_confirmation') updates.receivedAt = now
    if (status === 'confirmed') {
      updates.confirmedAt = now
      updates.receivedAt = payments[idx].receivedAt ?? now
    }
    payments[idx] = { ...payments[idx], ...updates }
    return payments[idx]
  },

  async getStats() {
    await delay(400)
    return {
      pending: payments.filter((p) => p.status === 'pending').length,
      collected: payments.filter((p) => p.status === 'collected').length,
      waiting: payments.filter((p) => p.status === 'waiting_confirmation').length,
      confirmed: payments.filter((p) => p.status === 'confirmed').length,
    }
  },
}
