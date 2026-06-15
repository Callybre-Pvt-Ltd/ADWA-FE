export type TeamMember = {
  id: string
  name: string
  role: string
  email?: string
  phone?: string
  image?: string
  bio?: string
}

export type Statistic = {
  id: string
  label: string
  value: number
  suffix?: string
  icon: string
}

export type Testimonial = {
  id: string
  name: string
  role: string
  state: string
  content: string
  rating: number
  avatar: string
}

export type AuditLog = {
  id: string
  actor: string
  actorType: 'admin' | 'district' | 'system'
  action: string
  entity: string
  entityId: string
  timestamp: string
  details?: string
}

export type AuditLogFilters = {
  actorType?: AuditLog['actorType'] | 'all'
  dateFrom?: string
  dateTo?: string
  search?: string
}

export type ActivityItem = {
  id: string
  message: string
  timestamp: string
  type: 'info' | 'success' | 'warning'
}

export type DashboardStats = {
  totalDrivers: number
  pendingRequests: number
  paymentPending: number
  idsGenerated: number
  totalDistricts?: number
  pendingPayments?: number
}

export type ChartDataPoint = {
  label: string
  value: number
}
