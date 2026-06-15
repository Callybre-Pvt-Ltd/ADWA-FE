import { mockNotifications } from '../../mock-data/notifications.mock'
import { delay } from '../../utils/formatters'
import type { Notification, CreateNotificationDto } from '../../types/notification.types'

const SIMULATED_DELAY = 800
let notifications = [...mockNotifications]

export const notificationsService = {
  async getAll(): Promise<Notification[]> {
    await delay(SIMULATED_DELAY)
    return [...notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  },

  async create(data: CreateNotificationDto): Promise<Notification> {
    await delay(600)
    const notification: Notification = {
      ...data,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    }
    notifications = [notification, ...notifications]
    return notification
  },

  async markRead(id: string): Promise<Notification> {
    await delay(300)
    notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    const n = notifications.find((x) => x.id === id)
    if (!n) throw new Error('Notification not found')
    return n
  },

  async archive(id: string): Promise<void> {
    await delay(300)
    notifications = notifications.map((n) => (n.id === id ? { ...n, archived: true } : n))
  },

  async delete(id: string): Promise<void> {
    await delay(300)
    notifications = notifications.filter((n) => n.id !== id)
  },
}
