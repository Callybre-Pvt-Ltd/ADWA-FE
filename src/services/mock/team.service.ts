import {
  mockTeam, mockStatistics, mockTestimonials,
  mockMonthlyRegistrations, mockDistrictRegistrations,
  mockPaymentBreakdown, mockActivities,
} from '../../mock-data/team.mock'
import { delay } from '../../utils/formatters'
import type { ContactFormData } from '../../utils/validators'
import { generateRefNumber } from '../../utils/formatters'
import type { DriverRequestFormData } from '../../utils/validators'

const SIMULATED_DELAY = 800

export const teamService = {
  async getTeam() {
    await delay(SIMULATED_DELAY)
    return mockTeam
  },
  async getStatistics() {
    await delay(SIMULATED_DELAY)
    return mockStatistics
  },
  async getTestimonials() {
    await delay(SIMULATED_DELAY)
    return mockTestimonials
  },
  async getMonthlyRegistrations() {
    await delay(400)
    return mockMonthlyRegistrations
  },
  async getDistrictRegistrations() {
    await delay(400)
    return mockDistrictRegistrations
  },
  async getPaymentBreakdown() {
    await delay(400)
    return mockPaymentBreakdown
  },
  async getActivities() {
    await delay(400)
    return mockActivities
  },
}

export const homeService = teamService

export const contactService = {
  async submit(_data: ContactFormData) {
    await delay(1000)
    return { success: true, ticketNumber: `TKT-${Date.now()}` }
  },
}

export const applicationService = {
  async submit(_data: Partial<DriverRequestFormData>) {
    await delay(1200)
    return {
      success: true,
      referenceNumber: generateRefNumber(),
      submittedAt: new Date().toISOString(),
      message: 'Application submitted successfully',
    }
  },
}
