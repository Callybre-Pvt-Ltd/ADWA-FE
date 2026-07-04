import { apiClient, unwrapPaginated, unwrapResponse } from './client'
import { buildQueryParams, extractError, toCamelCase } from './mappers'
import type { APIResponse } from '@/types/api.types'
import type { Driver, DriverFilters, DriverStatus } from '@/types/driver.types'
import type { DriverCard } from './cards.service'
import { driverRequestsService } from './driverRequests.service'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiDriver = Record<string, any>

function mapDriver(raw: ApiDriver): Driver {
  const item = toCamelCase<ApiDriver>(raw)
  return {
    id: item.id,
    name: item.fullName ?? '',
    mobile: item.phoneNumber ?? '',
    email: item.email ?? undefined,
    dateOfBirth: item.dateOfBirth ?? '',
    address: [item.city, item.state].filter(Boolean).join(', '),
    district: item.districtId ?? '',
    thana: item.policeStation ?? '',
    bloodGroup: item.bloodGroup ?? '',
    aadharNumber: '',
    licenseNumber: item.licenseNumber ?? '',
    licenseType: item.designation ?? '',
    licenseExpiryDate: '',
    photoUrl: '',
    status: item.status as DriverStatus,
    paymentConfirmed: false,
    createdAt: item.createdAt ?? '',
    updatedAt: item.updatedAt ?? '',
    memberNumber: item.memberNumber,
    districtId: item.districtId,
  }
}

export const driversService = {
  async getAll(filters?: DriverFilters): Promise<Driver[]> {
    try {
      const params: Record<string, string | number | undefined> = {
        search: filters?.search,
        district_id: filters?.districtId ?? filters?.district,
        page: filters?.page,
        size: filters?.size,
      }
      if (filters?.status && filters.status !== 'all') {
        params.status = filters.status
      }
      const { data } = await apiClient.get<APIResponse<ApiDriver[]>>(
        `/drivers${buildQueryParams(params)}`,
      )
      return unwrapPaginated(data).items.map(mapDriver)
    } catch (error) {
      throw await extractError(error)
    }
  },

  async getById(id: string): Promise<Driver> {
    try {
      const { data } = await apiClient.get<APIResponse<ApiDriver>>(`/drivers/${id}`)
      return mapDriver(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },

  async getActiveCard(driverId: string): Promise<DriverCard> {
    try {
      const { data } = await apiClient.get<APIResponse<Record<string, unknown>>>(
        `/drivers/${driverId}/active-card`,
      )
      return toCamelCase<DriverCard>(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },

  async update(id: string, payload: Record<string, unknown>): Promise<Driver> {
    try {
      const { data } = await apiClient.patch<APIResponse<ApiDriver>>(`/drivers/${id}`, payload)
      return mapDriver(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },

  async suspend(id: string, reason: string): Promise<Driver> {
    try {
      const { data } = await apiClient.post<APIResponse<ApiDriver>>(`/drivers/${id}/suspend`, {
        reason,
      })
      return mapDriver(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },

  async activate(id: string): Promise<Driver> {
    try {
      const { data } = await apiClient.post<APIResponse<ApiDriver>>(`/drivers/${id}/activate`)
      return mapDriver(unwrapResponse(data))
    } catch (error) {
      throw await extractError(error)
    }
  },

  async getRequests(filters?: DriverFilters) {
    return driverRequestsService.list(filters)
  },

  async getRenewals(): Promise<Driver[]> {
    return this.getAll({ status: 'EXPIRED' })
  },

  async updateStatus(id: string, status: DriverStatus): Promise<Driver> {
    return this.update(id, { status })
  },

  async getStats() {
    const { data } = await apiClient.get<APIResponse<Record<string, number>>>('/dashboard/district')
    const stats = unwrapResponse(data) ?? {}
    return {
      totalDrivers: stats.total_drivers ?? stats.totalDrivers ?? 0,
      pendingRequests: stats.pending_applications ?? stats.pendingApplications ?? 0,
      paymentPending: 0,
      idsGenerated: 0,
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async verify(_cardId: string) {
    throw new Error('Use verification endpoint for card lookup')
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async create(_data: unknown): Promise<Driver> {
    throw new Error('Use driverRequestsService.submit for new applications')
  },
}
