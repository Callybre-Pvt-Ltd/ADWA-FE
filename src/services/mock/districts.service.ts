import { mockDistricts } from '../../mock-data/districts.mock'
import { delay } from '../../utils/formatters'
import type { District, CreateDistrictDto } from '../../types/district.types'

const SIMULATED_DELAY = 800
let districts = [...mockDistricts]

export const districtsService = {
  async getAll(): Promise<District[]> {
    await delay(SIMULATED_DELAY)
    return [...districts]
  },

  async getById(id: string): Promise<District> {
    await delay(SIMULATED_DELAY)
    const district = districts.find((d) => d.id === id)
    if (!district) throw new Error('District not found')
    return district
  },

  async create(data: CreateDistrictDto): Promise<District> {
    await delay(800)
    const district: District = {
      ...data,
      id: `d-${Date.now()}`,
      driverCount: 0,
      activeRequests: 0,
    }
    districts = [district, ...districts]
    return district
  },

  async update(id: string, data: Partial<CreateDistrictDto>): Promise<District> {
    await delay(600)
    const idx = districts.findIndex((d) => d.id === id)
    if (idx === -1) throw new Error('District not found')
    districts[idx] = { ...districts[idx], ...data }
    return districts[idx]
  },
}
