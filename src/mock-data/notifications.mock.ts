import type { Notification } from '../types/notification.types'

export const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    type: 'info',
    title: 'New ID Card Application Portal Live',
    body: 'The online driver ID card application portal is now live. Apply today!',
    audience: 'all',
    read: false,
    createdAt: '2025-02-01T08:00:00Z',
  },
  {
    id: 'notif-002',
    type: 'warning',
    title: 'Payment Confirmation Pending',
    body: '12 payments are awaiting super admin confirmation across 3 districts.',
    audience: 'admin',
    read: false,
    createdAt: '2025-02-05T10:00:00Z',
  },
  {
    id: 'notif-003',
    type: 'alert',
    title: 'License Expiry Reminder',
    body: '5 drivers in your district have licenses expiring within 30 days.',
    audience: 'district',
    read: true,
    createdAt: '2025-02-03T14:00:00Z',
  },
  {
    id: 'notif-004',
    type: 'info',
    title: 'Annual Summit Registration Open',
    body: 'Register for the National Driver Welfare Summit 2025 before March 31.',
    audience: 'all',
    read: true,
    createdAt: '2025-01-20T09:00:00Z',
  },
  {
    id: 'notif-005',
    type: 'warning',
    title: 'Document Verification Delay',
    body: 'Document verification may take 2-3 extra days due to high volume.',
    audience: 'drivers',
    read: false,
    createdAt: '2025-02-06T11:00:00Z',
  },
]
