import type { ContactFormData } from '@/utils/validators'

/** Contact form — no backend endpoint yet; directs users to helpline. */
export const contactService = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async submit(data: ContactFormData): Promise<{ success: boolean; ticketNumber: string }> {
    throw new Error(
      'Online contact submission is not available yet. Please use the helpline or email shown on this page.',
    )
  },
}
