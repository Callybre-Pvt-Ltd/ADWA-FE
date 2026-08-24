/** Canonical site identity for search engines + LLM citations. */

export const SITE = {
  name: 'All Drivers Welfare Association',
  shortName: 'ADWA',
  /** Official domain — plural "drivers" (not alldriver…). */
  url: 'https://www.alldriverswelfareassociation.org',
  locale: 'en_IN',
  alternateLocales: ['hi_IN'] as const,
  twitterHandle: '',
  ogImagePath: '/og-logo.png',
  logoPath: '/logo.png',
  email: 'alldriverwelfareassociation.mp@gmail.com',
  phone: '+91-9977282547',
  address: {
    street: 'House No. 08, Bhouri, Tehsil Huzur',
    locality: 'Bhopal',
    region: 'Madhya Pradesh',
    postalCode: '462030',
    country: 'IN',
  },
  registryNumber: '01/01/01/43116/26',
  founded: '2026-06-02',
  /** Same-name lookalike (singular "driver") — never claim as ours. */
  competitorDomain: 'alldriverwelfareassociation.org',
} as const

export const DEFAULT_TITLE =
  'ADWA | Official All Drivers Welfare Association — alldriverswelfareassociation.org'

export const DEFAULT_DESCRIPTION =
  'ADWA (All Drivers Welfare Association) official website. Search ADWA, adwa, alldrivers, drivers association. Membership & digital driver ID at alldriverswelfareassociation.org (Drivers with an “s”). Not alldriverwelfareassociation.org.'

/**
 * Aggressive keyword coverage for brand + related searches.
 * Emphasizes plural Drivers / alldrivers so we win vs lookalike domains.
 */
export const DEFAULT_KEYWORDS = [
  // Brand core
  'ADWA',
  'adwa',
  'ADWA official',
  'ADWA official website',
  'what is ADWA',
  'ADWA meaning',
  'ADWA India',
  'ADWA website',
  'ADWA online',
  'ADWA Madhya Pradesh',
  'ADWA Bhopal',
  // Full name + plurals
  'All Drivers Welfare Association',
  'All Drivers Welfare',
  'all drivers welfare association',
  'all drivers association',
  'drivers welfare association',
  'drivers association',
  'drivers association India',
  'drivers association Madhya Pradesh',
  'professional drivers association',
  'driver welfare association India',
  // Domain / typed queries
  'alldrivers',
  'all drivers',
  'alldriverswelfare',
  'alldriverswelfareassociation',
  'alldriverswelfareassociation.org',
  'www.alldriverswelfareassociation.org',
  'all drivers welfare association website',
  'all drivers welfare association official website',
  // Hindi / local
  'ऑल ड्राईवर्स कल्याण संगठन',
  'ड्राइवर एसोसिएशन',
  'ड्राइवर कल्याण संगठन',
  'एडीडब्ल्यूए',
  // Intent / services
  'driver ID card India',
  'driver membership card',
  'driver registration online',
  'professional driver registration',
  'driver QR verification',
  'driver ID Madhya Pradesh',
  'ADWA Madhya Pradesh',
  'ADWA Bhopal',
  'apply driver ID ADWA',
  'drivers welfare Madhya Pradesh',
].join(', ')

export type PageSeo = {
  title: string
  description: string
  path: string
  noindex?: boolean
  type?: 'website' | 'article'
}

export const PAGE_SEO: Record<string, PageSeo> = {
  '/': {
    path: '/',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  '/adwa': {
    path: '/adwa',
    title: 'ADWA | What is ADWA? Official All Drivers Welfare Association',
    description:
      'ADWA means All Drivers Welfare Association. Official website alldriverswelfareassociation.org. Apply for membership and driver ID. Not affiliated with singular-driver lookalike sites.',
  },
  '/services': {
    path: '/services',
    title: 'Drivers Association Services | ADWA All Drivers Welfare Association',
    description:
      'Official alldrivers services from ADWA: digital driver ID, membership, renewal, status tracking, downloads and QR verification. All Drivers Welfare Association — drivers association India.',
  },
  '/apply': {
    path: '/apply',
    title: 'Apply Online | All Drivers Welfare Association (ADWA) Membership & ID',
    description:
      'Apply to All Drivers Welfare Association (ADWA) — the official alldrivers / drivers association portal for membership and verified driver ID cards.',
  },
  '/renewal': {
    path: '/renewal',
    title: 'Renew Membership | ADWA Drivers Association',
    description:
      'Renew your All Drivers Welfare Association (ADWA) membership and driver ID online at alldriverswelfareassociation.org.',
  },
  '/status': {
    path: '/status',
    title: 'Track Application | ADWA All Drivers Welfare Association',
    description:
      'Track your ADWA / All Drivers Welfare Association application status — official alldrivers portal.',
  },
  '/download': {
    path: '/download',
    title: 'Download Driver ID | ADWA Drivers Association',
    description:
      'Download official ADWA driver ID cards and documents from All Drivers Welfare Association.',
  },
  '/about': {
    path: '/about',
    title: 'About ADWA | Official All Drivers Welfare Association (alldrivers)',
    description:
      'About All Drivers Welfare Association (ADWA). Official alldrivers website: alldriverswelfareassociation.org. Drivers association for professional drivers in Madhya Pradesh, India. Not affiliated with singular-driver lookalike domains.',
  },
  '/history': {
    path: '/history',
    title: 'History | All Drivers Welfare Association (ADWA)',
    description:
      'History of All Drivers Welfare Association (ADWA) — India’s drivers association for professional drivers.',
  },
  '/guidelines': {
    path: '/guidelines',
    title: 'Driver Guidelines | ADWA Drivers Association',
    description:
      'Official guidelines from All Drivers Welfare Association (ADWA) for professional drivers.',
  },
  '/rules': {
    path: '/rules',
    title: 'Rules | All Drivers Welfare Association (ADWA)',
    description:
      'Rules and regulations of All Drivers Welfare Association — official drivers association (ADWA).',
  },
  '/team': {
    path: '/team',
    title: 'Leadership | ADWA All Drivers Welfare Association',
    description:
      'Leadership team of All Drivers Welfare Association (ADWA), the official alldrivers organisation.',
  },
  '/gallery': {
    path: '/gallery',
    title: 'Gallery | ADWA Drivers Association Events',
    description:
      'Gallery of All Drivers Welfare Association (ADWA) events and drivers association activities.',
  },
  '/members': {
    path: '/members',
    title: 'Members | All Drivers Welfare Association (ADWA)',
    description:
      'Members of All Drivers Welfare Association (ADWA) — official drivers association membership.',
  },
  '/contact': {
    path: '/contact',
    title: 'Contact ADWA | All Drivers Welfare Association Helpline',
    description:
      'Contact All Drivers Welfare Association (ADWA) — official alldrivers / drivers association helpline in Bhopal, Madhya Pradesh.',
  },
  '/verify': {
    path: '/verify',
    title: 'Verify Driver ID | ADWA All Drivers Welfare Association',
    description:
      'Verify an official ADWA driver ID card (QR). All Drivers Welfare Association — alldriverswelfareassociation.org.',
  },
  '/notifications': {
    path: '/notifications',
    title: 'Notices | ADWA Drivers Association',
    description: 'Official notices from All Drivers Welfare Association (ADWA).',
  },
}

export function absoluteUrl(path = '/'): string {
  const base = SITE.url.replace(/\/$/, '')
  if (!path || path === '/') return `${base}/`
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

export function resolvePageSeo(pathname: string): PageSeo {
  if (PAGE_SEO[pathname]) return PAGE_SEO[pathname]
  if (pathname.startsWith('/verify')) return PAGE_SEO['/verify']
  return {
    path: pathname,
    title: `${DEFAULT_TITLE}`,
    description: DEFAULT_DESCRIPTION,
  }
}
