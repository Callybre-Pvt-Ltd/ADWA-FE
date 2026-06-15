export type NotificationType = 'info' | 'warning' | 'alert'

export type NotificationAudience = 'all' | 'drivers' | 'district' | 'admin'

export type Notification = {
  id: string
  type: NotificationType
  title: string
  body: string
  audience: NotificationAudience
  read: boolean
  createdAt: string
  archived?: boolean
}

export type CreateNotificationDto = Omit<Notification, 'id' | 'read' | 'createdAt' | 'archived'>
