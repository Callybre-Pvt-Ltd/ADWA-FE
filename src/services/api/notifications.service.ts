import type { CreateNotificationDto, Notification } from '@/types/notification.types'

/** Notifications UI API — backend CRUD not implemented yet; returns empty data. */
export const notificationsService = {
  async getAll(): Promise<Notification[]> {
    return []
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async create(_data: CreateNotificationDto): Promise<Notification> {
    throw new Error('Notification management is not available yet.')
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async markRead(_id: string): Promise<void> {
    return
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async delete(_id: string): Promise<void> {
    return
  },
}
