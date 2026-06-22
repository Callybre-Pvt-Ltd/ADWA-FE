import { lazy, type LazyExoticComponent, type ComponentType } from 'react'

export type RouteConfig = {
  key: string
  path: string
  label: string
  icon: string
  component: LazyExoticComponent<ComponentType>
  layout: 'public' | 'district' | 'admin'
  showInNav: boolean
  showInSidebar: boolean
  navOrder?: number
  meta?: {
    title: string
    description?: string
    requiresRole?: 'district' | 'admin'
  }
  children?: RouteConfig[]
}

const lazyPage = (factory: () => Promise<{ default: ComponentType }>) => lazy(factory)

/** Navbar: Home, Application, Support — Services via /services & footer */
export const publicRoutes: RouteConfig[] = [
  {
    key: 'home',
    path: '/',
    label: 'nav.home',
    icon: 'Home',
    component: lazyPage(() => import('../pages/public/HomePage')),
    layout: 'public',
    showInNav: true,
    showInSidebar: false,
    navOrder: 1,
    meta: { title: 'Home' },
  },
  {
    key: 'services',
    path: '/services',
    label: 'nav.services',
    icon: 'LayoutGrid',
    component: lazyPage(() => import('../pages/public/ServicesPage')),
    layout: 'public',
    showInNav: false,
    showInSidebar: false,
    navOrder: 2,
    meta: { title: 'Services' },
  },
  {
    key: 'apply',
    path: '/apply',
    label: 'nav.application',
    icon: 'FileText',
    component: lazyPage(() => import('../pages/public/DriverRequestPage')),
    layout: 'public',
    showInNav: true,
    showInSidebar: false,
    navOrder: 3,
    meta: { title: 'Application' },
  },
  {
    key: 'renewal',
    path: '/renewal',
    label: 'nav.renewal',
    icon: 'RefreshCw',
    component: lazyPage(() => import('../pages/public/RenewalPage')),
    layout: 'public',
    showInNav: false,
    showInSidebar: false,
    navOrder: 4,
    meta: { title: 'Renewal' },
  },
  {
    key: 'status',
    path: '/status',
    label: 'nav.status',
    icon: 'CheckCircle',
    component: lazyPage(() => import('../pages/public/StatusPage')),
    layout: 'public',
    showInNav: false,
    showInSidebar: false,
    navOrder: 5,
    meta: { title: 'Application Status' },
  },
  {
    key: 'payment',
    path: '/payment',
    label: 'nav.payment',
    icon: 'CreditCard',
    component: lazyPage(() => import('../pages/public/PaymentPage')),
    layout: 'public',
    showInNav: false,
    showInSidebar: false,
    navOrder: 6,
    meta: { title: 'Payment' },
  },
  {
    key: 'download',
    path: '/download',
    label: 'nav.download',
    icon: 'Download',
    component: lazyPage(() => import('../pages/public/DownloadPage')),
    layout: 'public',
    showInNav: false,
    showInSidebar: false,
    navOrder: 7,
    meta: { title: 'Download' },
  },
  {
    key: 'support',
    path: '/support',
    label: 'nav.support',
    icon: 'Headphones',
    component: lazyPage(() => import('../pages/public/ContactPage')),
    layout: 'public',
    showInNav: true,
    showInSidebar: false,
    navOrder: 6,
    meta: { title: 'Support' },
  },
  // Secondary pages — accessible via member dashboard & footer, not navbar
  {
    key: 'dashboard',
    path: '/dashboard',
    label: 'nav.memberDashboard',
    icon: 'LayoutDashboard',
    component: lazyPage(() => import('../pages/public/MemberDashboardPage')),
    layout: 'public',
    showInNav: false,
    showInSidebar: false,
    meta: { title: 'Member Dashboard' },
  },
  {
    key: 'about',
    path: '/about',
    label: 'nav.about',
    icon: 'Info',
    component: lazyPage(() => import('../pages/public/AboutPage')),
    layout: 'public',
    showInNav: false,
    showInSidebar: false,
    meta: { title: 'About' },
  },
  {
    key: 'history',
    path: '/history',
    label: 'nav.history',
    icon: 'History',
    component: lazyPage(() => import('../pages/public/HistoryPage')),
    layout: 'public',
    showInNav: false,
    showInSidebar: false,
    meta: { title: 'History' },
  },
  {
    key: 'guidelines',
    path: '/guidelines',
    label: 'nav.guidelines',
    icon: 'BookOpen',
    component: lazyPage(() => import('../pages/public/GuidelinesPage')),
    layout: 'public',
    showInNav: false,
    showInSidebar: false,
    meta: { title: 'Guidelines' },
  },
  {
    key: 'rules',
    path: '/rules',
    label: 'nav.rules',
    icon: 'Scale',
    component: lazyPage(() => import('../pages/public/RulesPage')),
    layout: 'public',
    showInNav: false,
    showInSidebar: false,
    meta: { title: 'Rules' },
  },
  {
    key: 'team',
    path: '/team',
    label: 'nav.team',
    icon: 'Users',
    component: lazyPage(() => import('../pages/public/TeamPage')),
    layout: 'public',
    showInNav: false,
    showInSidebar: false,
    meta: { title: 'Team' },
  },
  {
    key: 'events',
    path: '/events',
    label: 'nav.events',
    icon: 'Calendar',
    component: lazyPage(() => import('../pages/public/EventsPage')),
    layout: 'public',
    showInNav: true,
    showInSidebar: false,
    navOrder: 4,
    meta: { title: 'Events' },
  },
  {
    key: 'members',
    path: '/members',
    label: 'nav.members',
    icon: 'Users',
    component: lazyPage(() => import('../pages/public/MembersPage')),
    layout: 'public',
    showInNav: false,
    showInSidebar: false,
    navOrder: 5,
    meta: { title: 'Members' },
  },
  {
    key: 'notifications',
    path: '/notifications',
    label: 'nav.notifications',
    icon: 'Bell',
    component: lazyPage(() => import('../pages/public/NotificationsPage')),
    layout: 'public',
    showInNav: false,
    showInSidebar: false,
    meta: { title: 'Notifications' },
  },
  {
    key: 'verify',
    path: '/verify/:id',
    label: 'nav.verify',
    icon: 'QrCode',
    component: lazyPage(() => import('../pages/public/QRVerifyPage')),
    layout: 'public',
    showInNav: false,
    showInSidebar: false,
    meta: { title: 'Verify Card' },
  },
  {
    key: 'contact',
    path: '/contact',
    label: 'nav.contact',
    icon: 'Mail',
    component: lazyPage(() => import('../pages/public/ContactPage')),
    layout: 'public',
    showInNav: false,
    showInSidebar: false,
    meta: { title: 'Contact' },
  },
]

export function getPrimaryNavRoutes(): RouteConfig[] {
  return publicRoutes
    .filter((r) => r.showInNav)
    .sort((a, b) => (a.navOrder ?? 99) - (b.navOrder ?? 99))
}

export function getSecondaryPublicRoutes(): RouteConfig[] {
  const secondaryKeys = new Set([
    'dashboard', 'renewal', 'status', 'payment', 'download',
    'about', 'history', 'guidelines', 'rules', 'team', 'events', 'notifications', 'verify',
  ])
  return publicRoutes.filter((r) => secondaryKeys.has(r.key))
}

export const districtRoutes: RouteConfig[] = [
  {
    key: 'district-dashboard',
    path: '/district/dashboard',
    label: 'nav.districtDashboard',
    icon: 'LayoutDashboard',
    component: lazyPage(() => import('../pages/district/DashboardPage')),
    layout: 'district',
    showInNav: true,
    showInSidebar: true,
    meta: { title: 'District Dashboard', requiresRole: 'district' },
  },
  {
    key: 'district-requests',
    path: '/district/requests',
    label: 'nav.districtRequests',
    icon: 'ClipboardList',
    component: lazyPage(() => import('../pages/district/RequestsPage')),
    layout: 'district',
    showInNav: true,
    showInSidebar: true,
    meta: { title: 'Driver Requests', requiresRole: 'district' },
  },
  {
    key: 'district-drivers',
    path: '/district/drivers',
    label: 'nav.districtDrivers',
    icon: 'Users',
    component: lazyPage(() => import('../pages/district/DriversPage')),
    layout: 'district',
    showInNav: true,
    showInSidebar: true,
    meta: { title: 'Drivers', requiresRole: 'district' },
  },
  {
    key: 'district-renewals',
    path: '/district/renewals',
    label: 'nav.districtRenewals',
    icon: 'RefreshCw',
    component: lazyPage(() => import('../pages/district/RenewalsPage')),
    layout: 'district',
    showInNav: true,
    showInSidebar: true,
    meta: { title: 'Renewals', requiresRole: 'district' },
  },
  {
    key: 'district-payments',
    path: '/district/payments',
    label: 'nav.districtPayments',
    icon: 'CreditCard',
    component: lazyPage(() => import('../pages/district/PaymentsPage')),
    layout: 'district',
    showInNav: false,
    showInSidebar: true,
    meta: { title: 'Payments', requiresRole: 'district' },
  },
  {
    key: 'district-id-generation',
    path: '/district/id-generation',
    label: 'nav.districtIdGeneration',
    icon: 'BadgeCheck',
    component: lazyPage(() => import('../pages/district/IDGenerationPage')),
    layout: 'district',
    showInNav: false,
    showInSidebar: true,
    meta: { title: 'ID Generation', requiresRole: 'district' },
  },
  {
    key: 'district-profile',
    path: '/district/profile',
    label: 'nav.districtProfile',
    icon: 'User',
    component: lazyPage(() => import('../pages/district/ProfilePage')),
    layout: 'district',
    showInNav: false,
    showInSidebar: true,
    meta: { title: 'Profile', requiresRole: 'district' },
  },
]

export const adminRoutes: RouteConfig[] = [
  {
    key: 'admin-dashboard',
    path: '/admin/dashboard',
    label: 'nav.adminDashboard',
    icon: 'LayoutDashboard',
    component: lazyPage(() => import('../pages/admin/GlobalDashboardPage')),
    layout: 'admin',
    showInNav: true,
    showInSidebar: true,
    meta: { title: 'Admin Dashboard', requiresRole: 'admin' },
  },
  {
    key: 'admin-applications',
    path: '/admin/applications',
    label: 'nav.adminApplications',
    icon: 'ClipboardList',
    component: lazyPage(() => import('../pages/admin/ApplicationsPage')),
    layout: 'admin',
    showInNav: true,
    showInSidebar: true,
    meta: { title: 'Applications', requiresRole: 'admin' },
  },
  {
    key: 'admin-users',
    path: '/admin/users',
    label: 'nav.adminUsers',
    icon: 'UserCog',
    component: lazyPage(() => import('../pages/admin/UserManagementPage')),
    layout: 'admin',
    showInNav: true,
    showInSidebar: true,
    meta: { title: 'User Management', requiresRole: 'admin' },
  },
  {
    key: 'admin-districts',
    path: '/admin/districts',
    label: 'nav.adminDistricts',
    icon: 'MapPin',
    component: lazyPage(() => import('../pages/admin/DistrictManagementPage')),
    layout: 'admin',
    showInNav: true,
    showInSidebar: true,
    meta: { title: 'District Management', requiresRole: 'admin' },
  },
  {
    key: 'admin-drivers',
    path: '/admin/drivers',
    label: 'nav.adminDrivers',
    icon: 'Users',
    component: lazyPage(() => import('../pages/admin/DriverManagementPage')),
    layout: 'admin',
    showInNav: true,
    showInSidebar: true,
    meta: { title: 'Driver Management', requiresRole: 'admin' },
  },
  {
    key: 'admin-id-cards',
    path: '/admin/id-cards',
    label: 'nav.adminIdCards',
    icon: 'BadgeCheck',
    component: lazyPage(() => import('../pages/admin/IdCardGenerationPage')),
    layout: 'admin',
    showInNav: false,
    showInSidebar: true,
    meta: { title: 'ID Card Generation', requiresRole: 'admin' },
  },
  {
    key: 'admin-payments',
    path: '/admin/payments',
    label: 'nav.adminPayments',
    icon: 'CreditCard',
    component: lazyPage(() => import('../pages/admin/PaymentConfirmationsPage')),
    layout: 'admin',
    showInNav: true,
    showInSidebar: true,
    meta: { title: 'Payment Confirmations', requiresRole: 'admin' },
  },
  {
    key: 'admin-events',
    path: '/admin/events',
    label: 'nav.adminEvents',
    icon: 'Calendar',
    component: lazyPage(() => import('../pages/admin/EventsManagementPage')),
    layout: 'admin',
    showInNav: false,
    showInSidebar: true,
    meta: { title: 'Events Management', requiresRole: 'admin' },
  },
  {
    key: 'admin-notifications',
    path: '/admin/notifications',
    label: 'nav.adminNotifications',
    icon: 'Bell',
    component: lazyPage(() => import('../pages/admin/NotificationsManagementPage')),
    layout: 'admin',
    showInNav: false,
    showInSidebar: true,
    meta: { title: 'Notifications Management', requiresRole: 'admin' },
  },
  {
    key: 'admin-audit',
    path: '/admin/audit',
    label: 'nav.adminAudit',
    icon: 'ScrollText',
    component: lazyPage(() => import('../pages/admin/AuditLogsPage')),
    layout: 'admin',
    showInNav: false,
    showInSidebar: true,
    meta: { title: 'Audit Logs', requiresRole: 'admin' },
  },
  {
    key: 'admin-profile',
    path: '/admin/profile',
    label: 'nav.adminProfile',
    icon: 'User',
    component: lazyPage(() => import('../pages/admin/AdminProfilePage')),
    layout: 'admin',
    showInNav: false,
    showInSidebar: true,
    meta: { title: 'Admin Profile', requiresRole: 'admin' },
  },
]

export const allRoutes = [...publicRoutes, ...districtRoutes, ...adminRoutes]

export function findRouteByPath(pathname: string): RouteConfig | undefined {
  return allRoutes.find((route) => {
    if (route.path.includes(':')) {
      const pattern = route.path.replace(/:[^/]+/g, '[^/]+')
      return new RegExp(`^${pattern}$`).test(pathname)
    }
    return route.path === pathname
  })
}

export function getBreadcrumbTrail(pathname: string): RouteConfig[] {
  const exact = allRoutes.find((r) => r.path === pathname)
  if (exact) return [exact]
  const dynamic = findRouteByPath(pathname)
  if (dynamic) {
    const parent = allRoutes.find((r) => pathname.startsWith(r.path.split(':')[0]) && r.path !== dynamic.path)
    return parent ? [parent, dynamic] : [dynamic]
  }
  return []
}

