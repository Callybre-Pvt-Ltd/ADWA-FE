export type PaymentStatus =
  | 'pending'
  | 'collected'
  | 'waiting_confirmation'
  | 'confirmed'

export type Payment = {
  id: string
  driverId: string
  driverName: string
  district: string
  amount: number
  status: PaymentStatus
  collectedAt?: string
  receivedAt?: string
  confirmedAt?: string
  collectedBy?: string
  referenceNumber: string
  createdAt: string
}

export type PaymentFilters = {
  status?: PaymentStatus | 'all'
  district?: string
  search?: string
}

export type UpdatePaymentDto = {
  id: string
  status: PaymentStatus
}
