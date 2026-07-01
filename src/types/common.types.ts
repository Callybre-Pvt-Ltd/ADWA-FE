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

export type AdminDashboardStats = {
  totalDrivers: number
  driverGrowthPct: number
  driverSparkline: number[]
  pendingDistrictReview: number
  pendingAdminApproval: number
  adminApprovalCritical: boolean
  idsGenerated: number
  idsPending: number
  idSparkline: number[]
  revenueCurrentMonth: number
  revenuePrevMonth: number
  revenueSparkline: number[]
  // application status distribution
  appPending: number
  appApproved: number
  appRejected: number
  appCardGenerated: number
  // membership
  membersActive: number
  membersExpired: number
  membersSuspended: number
  membersPendingRenewal: number
  // operational queue
  queueDistrictReview: number
  queueAdminApproval: number
  queuePaymentVerification: number
  queueIdGeneration: number
  queueMembershipRenewal: number
  // monthly registration trend (12 months)
  registrationTrend: { month: string; registrations: number; approvals: number }[]
  // monthly revenue trend (12 months)
  revenueTrend: { month: string; amount: number }[]
}

export type DistrictDashboardStats = {
  districtName: string
  totalDrivers: number
  driverGrowthPct: number
  pendingRequests: number
  pendingRequestsCritical: boolean
  paymentPending: number
  idsGenerated: number
  idsPending: number
  // application status distribution
  appPending: number
  appApproved: number
  appRejected: number
  appCardGenerated: number
  // membership
  membersActive: number
  membersExpired: number
  membersSuspended: number
  membersPendingRenewal: number
  // monthly registration trend (6 months)
  registrationTrend: { month: string; count: number }[]
  // queue
  queueNewRequests: number
  queuePaymentVerification: number
  queueIdGeneration: number
  queueRenewals: number
  // revenue
  revenueCurrentMonth: number
  revenuePrevMonth: number
}

export type DistrictPerformanceRow = {
  id: string
  district: string
  state: string
  totalDrivers: number
  newRegistrations: number
  activeMembers: number
  pendingApplications: number
  revenueGenerated: number
  revenueMax: number
  officerStatus: 'active' | 'inactive' | 'vacant'
}

export type ChartDataPoint = {
  label: string
  value: number
}
