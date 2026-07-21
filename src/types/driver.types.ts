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
  metadata?: {
    cardNumber?: string
    issueDate?: string
    licenseNumber?: string
    vehicleNumber?: string
    vehicleType?: string
    bloodGroup?: string
    phoneNumber?: string
    email?: string
    dateOfBirth?: string
    fatherOrSpouseName?: string
    city?: string
    state?: string
    policeStation?: string
    designation?: string
    driverStatus?: string
  }
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

export type ApplicationDocument = {
  id: string
  documentType: string
  fileName: string
  mimeType: string
  uploadedAt: string
  downloadUrl?: string | null
}

export type DriverRequest = {
  id: string
  name: string
  fullName?: string
  fatherName?: string
  motherName?: string
  gender?: string
  mobile: string
  altMobile?: string
  email?: string
  dateOfBirth: string
  address: string
  village?: string
  tehsil?: string
  state?: string
  pincode?: string
  district: string
  districtId?: string
  thana: string
  bloodGroup: string
  aadharNumber: string
  licenseNumber: string
  licenseIssueDate?: string
  licenseType: string
  licenseExpiryDate: string
  vehicleNumber?: string
  vehicleType?: string
  experienceYears?: number
  photoUrl: string
  status: RequestStatus
  paymentConfirmed: boolean
  createdAt: string
  updatedAt: string
  requestType: 'new' | 'renewal'
  submittedAt: string
  referenceNumber?: string
  verificationRemarks?: string
  diNotes?: string
  remarks?: string
  paymentProofUrl?: string
  forwardedAt?: string
  approvedAt?: string
  rejectedAt?: string
  registrationConflict?: string
  conflictMemberNumber?: string
  conflictReferenceNumber?: string
  documents?: ApplicationDocument[]
  statusHistory?: ApplicationStatusHistory[]
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

export type RecoveredApplication = {
  referenceNumber: string
  fullName: string
  status: RequestStatus
  districtName: string | null
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
