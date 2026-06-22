import { apiClient, unwrapPaginated, unwrapResponse } from './client'
import { buildQueryParams, extractError, toCamelCase } from './mappers'
import type { APIResponse } from '@/types/api.types'
import type {
  DriverFilters,
  DriverRequest,
  RequestStatus,
  TrackApplicationResult,
} from '@/types/driver.types'
import type { DriverRequestFormData } from '@/utils/validators'

export function buildSubmitFormData(data: DriverRequestFormData): FormData {
  const fd = new FormData()
  fd.append('district_id', data.districtId)
  fd.append('full_name', data.name)
  fd.append('father_name', data.fatherName)
  fd.append('mother_name', data.motherName)
  fd.append('date_of_birth', data.dateOfBirth)
  fd.append('gender', data.gender)
  fd.append('mobile_number', data.mobile)
  if (data.altMobile) fd.append('alt_mobile_number', data.altMobile)
  if (data.email) fd.append('email', data.email)
  fd.append('blood_group', data.bloodGroup)
  fd.append('address', data.address)
  fd.append('village', data.village)
  fd.append('tehsil', data.tehsil)
  fd.append('state', data.state)
  fd.append('pincode', data.pincode)
  fd.append('license_number', data.licenseNumber)
  fd.append('license_issue_date', data.licenseIssueDate)
  fd.append('license_expiry_date', data.licenseExpiryDate)
  fd.append('vehicle_type', data.vehicleType)
  fd.append('vehicle_number', data.vehicleNumber)
  fd.append('experience_years', String(data.experienceYears))
  fd.append('aadhaar_number', data.aadharNumber)
  if (data.driverPhoto) fd.append('driver_photo', data.driverPhoto)
  if (data.aadhaarFront) fd.append('aadhaar_front', data.aadhaarFront)
  if (data.aadhaarBack) fd.append('aadhaar_back', data.aadhaarBack)
  if (data.licenseFront) fd.append('license_front', data.licenseFront)
  if (data.licenseBack) fd.append('license_back', data.licenseBack)
  if (data.vehicleRc) fd.append('vehicle_rc', data.vehicleRc)
  return fd
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiDriverRequest = Record<string, any>

function mapDriverRequest(raw: ApiDriverRequest): DriverRequest {
  const item = toCamelCase<ApiDriverRequest>(raw)
  return {
    id: item.id,
    name: item.fullName ?? '',
    mobile: item.mobileNumber ?? '',
    email: item.email ?? undefined,
    dateOfBirth: item.dateOfBirth ?? '',
    address: item.address ?? '',
    district: item.districtName ?? '',
    thana: item.tehsil ?? '',
    bloodGroup: item.bloodGroup ?? '',
    aadharNumber: '',
    licenseNumber: item.licenseNumber ?? '',
    licenseType: item.vehicleType ?? '',
    licenseExpiryDate: item.licenseExpiryDate ?? '',
    vehicleNumber: item.vehicleNumber ?? undefined,
    photoUrl: '',
    status: item.status as RequestStatus,
    paymentConfirmed: false,
    createdAt: item.createdAt ?? '',
    updatedAt: item.createdAt ?? '',
    requestType: 'new',
    submittedAt: item.createdAt ?? '',
    referenceNumber: item.referenceNumber,
    districtId: item.districtId,
    verificationRemarks: item.verificationRemarks ?? undefined,
    diNotes: item.diNotes ?? undefined,
    paymentProofUrl: item.paymentProofUrl ?? undefined,
  }
}

export const driverRequestsService = {
  async submit(formData: FormData): Promise<DriverRequest> {
    try {
      const { data } = await apiClient.post<APIResponse<ApiDriverRequest>>(
        '/driver-requests',
        formData,
      )
      return mapDriverRequest(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },

  async track(ref: string, mobile: string): Promise<TrackApplicationResult> {
    try {
      const { data } = await apiClient.get<APIResponse<ApiDriverRequest>>(
        `/driver-requests/track${buildQueryParams({ ref, mobile })}`,
      )
      const item = toCamelCase<ApiDriverRequest>(unwrapResponse(data))
      return {
        referenceNumber: item.referenceNumber,
        fullName: item.fullName,
        status: item.status as RequestStatus,
        districtName: item.districtName ?? null,
        createdAt: item.createdAt,
        statusHistory: (item.statusHistory ?? []).map((h: ApiDriverRequest) => toCamelCase(h)),
      }
    } catch (error) {
      throw await extractError(error)
    }
  },

  async list(filters?: DriverFilters): Promise<DriverRequest[]> {
    try {
      const params: Record<string, string | number | undefined> = {
        search: filters?.search,
        page: filters?.page,
        size: filters?.size,
        date_from: filters?.dateFrom,
        date_to: filters?.dateTo,
      }
      if (filters?.status && filters.status !== 'all') {
        params.status = filters.status
      }
      const { data } = await apiClient.get<APIResponse<ApiDriverRequest[]>>(
        `/driver-requests${buildQueryParams(params)}`,
      )
      return unwrapPaginated(data).items.map(mapDriverRequest)
    } catch (error) {
      throw await extractError(error)
    }
  },

  async get(id: string): Promise<DriverRequest> {
    try {
      const { data } = await apiClient.get<APIResponse<ApiDriverRequest>>(`/driver-requests/${id}`)
      return mapDriverRequest(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },

  async update(id: string, payload: Record<string, unknown>): Promise<DriverRequest> {
    try {
      const { data } = await apiClient.patch<APIResponse<ApiDriverRequest>>(
        `/driver-requests/${id}`,
        payload,
      )
      return mapDriverRequest(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },

  async forward(
    id: string,
    verificationRemarks: string,
    paymentProof: File,
    diNotes?: string,
  ): Promise<DriverRequest> {
    try {
      const formData = new FormData()
      formData.append('verification_remarks', verificationRemarks)
      formData.append('payment_proof', paymentProof)
      if (diNotes) formData.append('di_notes', diNotes)

      const { data } = await apiClient.post<APIResponse<ApiDriverRequest>>(
        `/driver-requests/${id}/forward`,
        formData,
      )
      return mapDriverRequest(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },

  async reject(id: string, reason: string): Promise<DriverRequest> {
    try {
      const { data } = await apiClient.post<APIResponse<ApiDriverRequest>>(
        `/driver-requests/${id}/reject`,
        { reason },
      )
      return mapDriverRequest(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },

  async approve(id: string): Promise<{ driverId: string; memberNumber: string; referenceNumber: string }> {
    try {
      const { data } = await apiClient.post<APIResponse<{
        driver_id: string
        member_number: string
        reference_number: string
        card_id?: string
      }>>(`/driver-requests/${id}/approve`)
      const result = unwrapResponse(data)
      return {
        driverId: result.driver_id,
        memberNumber: result.member_number,
        referenceNumber: result.reference_number,
      }
    } catch (error) {
      throw await extractError(error)
    }
  },
}
