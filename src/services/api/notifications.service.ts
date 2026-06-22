import type { CreateNotificationDto, Notification } from '@/types/notification.types'

/** Notifications UI API — backend CRUD not implemented yet; returns empty data. */
export const notificationsService = {
  async getAll(): Promise<Notification[]> {
    return []
  },

  async create(_data: CreateNotificationDto): Promise<Notification> {
    throw new Error('Notification management is not available yet.')
  },

  async markRead(_id: string): Promise<void> {
    return
  },

  async delete(_id: string): Promise<void> {
    return
  },
}
