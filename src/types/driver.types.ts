export type RequestStatus =
  | 'SUBMITTED'
  | 'PENDING_DISTRICT_REVIEW'
  | 'REJECTED_BY_DISTRICT'
  | 'FORWARDED_TO_ADMIN'
  | 'REJECTED_BY_ADMIN'
  | 'APPROVED'

export type DriverStatus =
  | 'APPROVED'
  | 'ID_CARD_GENERATED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'EXPIRED'

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

export type CardVerificationStatus = 'VALID' | 'EXPIRED' | 'REVOKED' | 'NOT_FOUND'

export type CardVerificationResult = {
  status: CardVerificationStatus
  driverName?: string
  memberNumber?: string
  district?: string
  photoUrl?: string
  expiryDate?: string
}

/** @deprecated Use CardVerificationResult */
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
  vehicleNumber?: string
  photoUrl: string
  status: DriverStatus
  issueDate?: string
  expiryDate?: string
  cardId?: string
  paymentConfirmed: boolean
  createdAt: string
  updatedAt: string
  memberNumber?: string
  districtId?: string
}

export type DriverRequest = Omit<Driver, 'status'> & {
  requestType: 'new' | 'renewal'
  submittedAt: string
  status: RequestStatus
  referenceNumber?: string
  districtId?: string
  verificationRemarks?: string
  diNotes?: string
  paymentProofUrl?: string
}

export type DriverFilters = {
  status?: DriverStatus | RequestStatus | 'all'
  district?: string
  districtId?: string
  search?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  size?: number
}

export type CreateDriverDto = Omit<
  Driver,
  'id' | 'status' | 'createdAt' | 'updatedAt' | 'paymentConfirmed' | 'cardId' | 'issueDate' | 'expiryDate'
>

export type ApplicationStatusHistory = {
  id: string
  fromStatus: RequestStatus | null
  toStatus: RequestStatus
  notes: string | null
  createdAt: string
}

export type TrackApplicationResult = {
  referenceNumber: string
  fullName: string
  status: RequestStatus
  districtName: string | null
  createdAt: string
  statusHistory: ApplicationStatusHistory[]
}
