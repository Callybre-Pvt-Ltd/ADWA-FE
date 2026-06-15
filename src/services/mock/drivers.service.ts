import { mockDrivers, mockDriverRequests, VALID_CARD_ID, EXPIRED_CARD_ID, INVALID_CARD_ID } from '../../mock-data/drivers.mock'
import { delay } from '../../utils/formatters'
import { maskLicenseNumber } from '../../utils/formatters'
import type {
  Driver, DriverFilters, DriverStatus, DriverRequest,
  CreateDriverDto, VerificationState, DriverPublicInfo,
} from '../../types/driver.types'

const SIMULATED_DELAY = 800
let drivers = [...mockDrivers]
let requests = [...mockDriverRequests]

function toPublicInfo(driver: Driver): DriverPublicInfo {
  return {
    name: driver.name,
    photoUrl: driver.photoUrl,
    district: driver.district,
    bloodGroup: driver.bloodGroup,
    licenseNumber: maskLicenseNumber(driver.licenseNumber),
    issueDate: driver.issueDate ?? driver.createdAt,
    expiryDate: driver.expiryDate ?? driver.licenseExpiryDate,
    cardId: driver.cardId ?? driver.id,
    status: driver.status === 'expired' ? 'expired' : 'valid',
  }
}

export const driversService = {
  async getAll(filters?: DriverFilters): Promise<Driver[]> {
    await delay(SIMULATED_DELAY)
    let result = [...drivers]
    if (filters?.status && filters.status !== 'all') {
      result = result.filter((d) => d.status === filters.status)
    }
    if (filters?.district) {
      result = result.filter((d) => d.district === filters.district)
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.licenseNumber.toLowerCase().includes(q) ||
          d.mobile.includes(q),
      )
    }
    return result
  },

  async getById(id: string): Promise<Driver> {
    await delay(SIMULATED_DELAY)
    const driver = drivers.find((d) => d.id === id)
    if (!driver) throw new Error('Driver not found')
    return driver
  },

  async getRequests(filters?: DriverFilters): Promise<DriverRequest[]> {
    await delay(SIMULATED_DELAY)
    let result = [...requests]
    if (filters?.status && filters.status !== 'all') {
      result = result.filter((d) => d.status === filters.status)
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      result = result.filter((d) => d.name.toLowerCase().includes(q))
    }
    return result
  },

  async getRenewals(): Promise<Driver[]> {
    await delay(SIMULATED_DELAY)
    return drivers.filter(
      (d) => d.status === 'expired' || (d.expiryDate && new Date(d.expiryDate) < new Date(Date.now() + 30 * 86400000)),
    )
  },

  async create(data: CreateDriverDto): Promise<Driver> {
    await delay(1000)
    const newDriver: Driver = {
      ...data,
      id: `drv-${Date.now()}`,
      status: 'pending',
      paymentConfirmed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    drivers = [newDriver, ...drivers]
    requests = [{ ...newDriver, requestType: 'new', submittedAt: newDriver.createdAt }, ...requests]
    return newDriver
  },

  async updateStatus(id: string, status: DriverStatus): Promise<Driver> {
    await delay(600)
    const idx = drivers.findIndex((d) => d.id === id)
    if (idx === -1) throw new Error('Driver not found')
    drivers[idx] = { ...drivers[idx], status, updatedAt: new Date().toISOString() }
    requests = requests.map((r) => (r.id === id ? { ...r, status } : r))
    return drivers[idx]
  },

  async verify(cardId: string): Promise<VerificationState> {
    await delay(SIMULATED_DELAY)
    if (cardId === INVALID_CARD_ID || cardId === 'invalid') {
      return { status: 'invalid', reason: 'not_found' }
    }
    const driver = drivers.find((d) => d.cardId === cardId || d.id === cardId)
    if (!driver) return { status: 'invalid', reason: 'not_found' }
    if (cardId === EXPIRED_CARD_ID || driver.status === 'expired') {
      return {
        status: 'expired',
        driver: toPublicInfo(driver),
        expiredAt: driver.expiryDate ?? driver.licenseExpiryDate,
      }
    }
    return { status: 'valid', driver: toPublicInfo(driver) }
  },

  async getStats() {
    await delay(400)
    return {
      totalDrivers: drivers.length,
      pendingRequests: requests.filter((r) => r.status === 'pending').length,
      paymentPending: drivers.filter((d) => d.status === 'payment_pending').length,
      idsGenerated: drivers.filter((d) => d.status === 'id_generated').length,
    }
  },
}

export { VALID_CARD_ID, EXPIRED_CARD_ID, INVALID_CARD_ID }
