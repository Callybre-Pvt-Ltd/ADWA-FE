import { delay } from '@/lib/utils'
import { generateRefNumber } from '@/lib/utils'
import {
  mockLeadership, mockStatistics, mockServices, mockFAQs,
  mockTestimonials, mockDownloads,
} from '@/mocks/data'
import type {
  ApplicationStatus, RenewalRecord, ApplicationFormData, ContactFormData,
} from '@/types'
import { API_DELAY } from '@/constants'

export const homeService = {
  getStatistics: async () => {
    await delay(API_DELAY)
    return mockStatistics
  },
  getServices: async () => {
    await delay(API_DELAY)
    return mockServices
  },
  getLeadership: async () => {
    await delay(API_DELAY)
    return mockLeadership
  },
  getTestimonials: async () => {
    await delay(API_DELAY)
    return mockTestimonials
  },
  getFAQs: async () => {
    await delay(API_DELAY)
    return mockFAQs
  },
}

export const applicationService = {
  submit: async (data: Partial<ApplicationFormData>) => {
    await delay(1200)
    const referenceNumber = generateRefNumber()
    return {
      success: true,
      referenceNumber,
      submittedAt: new Date().toISOString(),
      message: 'Application submitted successfully',
      applicantName: data.fullName ?? 'Applicant',
    }
  },

  track: async (referenceNumber: string, dob: string): Promise<ApplicationStatus> => {
    await delay(API_DELAY)
    if (!referenceNumber.startsWith('ADWA') && referenceNumber !== 'TEST123') {
      throw new Error('NOT_FOUND')
    }
    return {
      referenceNumber,
      fullName: 'Rajesh Kumar',
      submittedAt: '2025-04-15T10:30:00Z',
      currentStep: 3,
      steps: [
        { id: 1, label: 'Application Submitted', description: 'Your application has been received and logged.', completedAt: '2025-04-15T10:30:00Z', status: 'completed' },
        { id: 2, label: 'Under Verification', description: 'Documents are being verified by our team.', completedAt: '2025-04-16T14:00:00Z', status: 'completed' },
        { id: 3, label: 'Approved', description: 'Application approved. Proceeding to printing.', completedAt: '2025-04-18T11:00:00Z', status: 'completed' },
        { id: 4, label: 'ID Card Printed', description: 'Your ID card has been printed.', completedAt: null, status: 'active' },
        { id: 5, label: 'Dispatched via Post', description: 'ID card dispatched via Indian Post.', completedAt: null, status: 'pending' },
      ],
    }
  },
}

export const renewalService = {
  search: async (membershipNumber: string, _dob: string): Promise<RenewalRecord> => {
    await delay(API_DELAY)
    if (!membershipNumber.trim()) throw new Error('NOT_FOUND')
    return {
      membershipNumber,
      fullName: 'Suresh Patel',
      dateOfBirth: '1985-06-22',
      phone: '9876543210',
      email: 'suresh.patel@email.com',
      address: 'Village Rampur, Dist. Ahmedabad, Gujarat - 380001',
      expiryDate: '2024-12-31',
      status: 'Expired',
    }
  },

  submit: async (membershipNumber: string) => {
    await delay(1200)
    return {
      success: true,
      referenceNumber: `REN-${membershipNumber}-2025`,
      message: 'Renewal submitted successfully',
    }
  },
}

export const downloadService = {
  getItems: async () => {
    await delay(API_DELAY)
    return mockDownloads
  },
  downloadFile: async (id: string) => {
    await delay(600)
    console.log(`Mock download: ${id}`)
    return { success: true }
  },
}

export const contactService = {
  submit: async (_data: ContactFormData) => {
    await delay(1000)
    return { success: true, ticketNumber: `TKT-${Date.now()}` }
  },
}
