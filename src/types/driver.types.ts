export type DriverStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'payment_pending'
  | 'payment_confirmed'
  | 'id_generated'
  | 'expired'

export type DriverPublicInfo = {
  name: string
  photoUrl: string
  district: string
  bloodGroup: string
  licenseNumber: string
  issueDate: string
  expiryDate: string
  cardId: string
  status: 'valid' | 'expired'
}

export type VerificationState =
  | { status: 'valid'; driver: DriverPublicInfo }
  | { status: 'invalid'; reason: 'not_found' | 'data_mismatch' }
  | { status: 'expired'; driver: DriverPublicInfo; expiredAt: string }

export type Driver = {
  id: string
  name: string
  mobile: string
  email?: string
  dateOfBirth: string
  address: string
  district: string
  thana: string
  bloodGroup: string
  aadharNumber: string
  licenseNumber: string
  licenseType: string
  licenseExpiryDate: string
  photoUrl: string
  status: DriverStatus
  issueDate?: string
  expiryDate?: string
  cardId?: string
  paymentConfirmed: boolean
  createdAt: string
  updatedAt: string
}

export type DriverRequest = Driver & {
  requestType: 'new' | 'renewal'
  submittedAt: string
}

export type DriverFilters = {
  status?: DriverStatus | 'all'
  district?: string
  search?: string
  dateFrom?: string
  dateTo?: string
}

export type CreateDriverDto = Omit<Driver, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'paymentConfirmed' | 'cardId' | 'issueDate' | 'expiryDate'>
