import type { ApplicationDocument, DriverRequest } from '@/types/driver.types'
import { resolveStorageUrl, toCamelCase } from './mappers'
import type { ApplicationStatusHistory } from '@/types/driver.types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiDriverRequest = Record<string, any>

function mapDocument(raw: ApiDriverRequest): ApplicationDocument {
  const doc = toCamelCase<ApplicationDocument>(raw)
  return {
    ...doc,
    downloadUrl: resolveStorageUrl(doc.downloadUrl),
  }
}

export function mapDriverRequest(raw: ApiDriverRequest): DriverRequest {
  const item = toCamelCase<ApiDriverRequest>(raw)
  const photoDoc = (item.documents as ApiDriverRequest[] | undefined)?.find(
    (d) => d.documentType === 'DRIVER_PHOTO',
  )

  return {
    id: item.id,
    name: item.fullName ?? '',
    fullName: item.fullName ?? '',
    fatherName: item.fatherName ?? undefined,
    motherName: item.motherName ?? undefined,
    gender: item.gender ?? undefined,
    mobile: item.mobileNumber ?? '',
    altMobile: item.altMobileNumber ?? undefined,
    email: item.email ?? undefined,
    dateOfBirth: item.dateOfBirth ?? '',
    address: item.address ?? '',
    village: item.village ?? undefined,
    tehsil: item.tehsil ?? undefined,
    state: item.state ?? undefined,
    pincode: item.pincode ?? undefined,
    district: item.districtName ?? '',
    districtId: item.districtId,
    thana: item.tehsil ?? '',
    bloodGroup: item.bloodGroup ?? '',
    aadharNumber: item.aadhaarNumber ?? '',
    licenseNumber: item.licenseNumber ?? '',
    licenseIssueDate: item.licenseIssueDate ?? undefined,
    licenseType: item.vehicleType ?? '',
    licenseExpiryDate: item.licenseExpiryDate ?? '',
    vehicleNumber: item.vehicleNumber ?? undefined,
    vehicleType: item.vehicleType ?? undefined,
    experienceYears: item.experienceYears ?? undefined,
    photoUrl: resolveStorageUrl(photoDoc?.downloadUrl) ?? '',
    status: item.status,
    paymentConfirmed: false,
    createdAt: item.createdAt ?? '',
    updatedAt: item.createdAt ?? '',
    requestType: 'new',
    submittedAt: item.createdAt ?? '',
    referenceNumber: item.referenceNumber,
    verificationRemarks: item.verificationRemarks ?? undefined,
    diNotes: item.diNotes ?? undefined,
    remarks: item.remarks ?? undefined,
    paymentProofUrl: resolveStorageUrl(item.paymentProofUrl) ?? undefined,
    forwardedAt: item.forwardedAt ?? undefined,
    approvedAt: item.approvedAt ?? undefined,
    rejectedAt: item.rejectedAt ?? undefined,
    registrationConflict: item.registrationConflict ?? undefined,
    conflictMemberNumber: item.conflictMemberNumber ?? undefined,
    conflictReferenceNumber: item.conflictReferenceNumber ?? undefined,
    documents: (item.documents as ApiDriverRequest[] | undefined)?.map(mapDocument) ?? [],
    statusHistory:
      (item.statusHistory as ApiDriverRequest[] | undefined)?.map(
        (h) => toCamelCase<ApplicationStatusHistory>(h),
      ) ?? [],
  }
}
