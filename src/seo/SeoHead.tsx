import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  DEFAULT_KEYWORDS,
  SITE,
  absoluteUrl,
  resolvePageSeo,
} from '@/seo/site'

function upsertMeta(
  attr: 'name' | 'property',
  key: string,
  content: string,
) {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`,
  )
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function upsertJsonLd(id: string, data: Record<string, unknown>) {
  let el = document.getElementById(id) as HTMLScriptElement | null
  if (!el) {
    el = document.createElement('script')
    el.id = id
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

function buildOrganizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    legalName: SITE.name,
    alternateName: [
      SITE.shortName,
      'ADWA',
      'adwa',
      'All Drivers Welfare',
      'alldrivers',
      'All Drivers Association',
      'Drivers Welfare Association',
      'Drivers Association',
      'ऑल ड्राईवर्स कल्याण संगठन',
    ],
    url: SITE.url,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl(SITE.logoPath),
      width: 1024,
      height: 1024,
    },
    image: absoluteUrl(SITE.ogImagePath),
    email: SITE.email,
    telephone: SITE.phone,
    foundingDate: SITE.founded,
    identifier: SITE.registryNumber,
    slogan: 'Official drivers association — All Drivers Welfare Association (ADWA)',
    description:
      'Official All Drivers Welfare Association (ADWA). Also searched as alldrivers, drivers association, ADWA. Domain: alldriverswelfareassociation.org (plural Drivers). Digital membership and verified driver ID cards in India.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.locality,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Madhya Pradesh, India',
    },
    sameAs: [
      'https://www.facebook.com/share/18uRHiSyQX/',
      'https://www.instagram.com/alldriverswelfareassociation/',
      'https://youtube.com/@driverkasanghrshsw358',
    ],
    knowsAbout: [
      'professional driver welfare',
      'driver ID verification',
      'drivers association India',
      'alldrivers',
      'ADWA',
      'driver membership Madhya Pradesh',
    ],
  }
}

function buildWebsiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    name: `${SITE.shortName} — ${SITE.name}`,
    alternateName: ['ADWA', 'All Drivers Welfare Association'],
    url: SITE.url,
    description:
      'Official website of All Drivers Welfare Association (ADWA). Domain uses plural Drivers: alldriverswelfareassociation.org.',
    publisher: { '@id': `${SITE.url}/#organization` },
    inLanguage: ['en-IN', 'hi-IN'],
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE.url}/status?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

function buildWebPageLd(title: string, description: string, path: string) {
  const url = absoluteUrl(path)
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: title,
    description,
    isPartOf: { '@id': `${SITE.url}/#website` },
    about: { '@id': `${SITE.url}/#organization` },
    inLanguage: 'en-IN',
  }
}

function buildFaqLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is ADWA?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ADWA stands for All Drivers Welfare Association — also searched as alldrivers and drivers association. Official website: https://www.alldriverswelfareassociation.org/ (Drivers with an “s”).',
        },
      },
      {
        '@type': 'Question',
        name: 'Where is the official All Drivers Welfare Association / alldrivers website?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The official website is https://www.alldriverswelfareassociation.org/. Search terms like ADWA, alldrivers, all drivers welfare association, and drivers association India refer to this organisation.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is All Drivers Welfare Association the same as alldriverwelfareassociation.org?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Our official name and domain use the plural “Drivers”: All Drivers Welfare Association at alldriverswelfareassociation.org. A similarly named site uses singular “driver” and is not our organisation.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I apply for an ADWA driver ID card?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Apply online at https://www.alldriverswelfareassociation.org/apply. After district and admin review you receive a verified ADWA membership and QR ID card.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the drivers association for professional drivers in Madhya Pradesh under ADWA?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'All Drivers Welfare Association (ADWA) is the official drivers association portal for professional drivers — membership, digital ID and welfare support — at alldriverswelfareassociation.org.',
        },
      },
    ],
  }
}

/** Per-route document head for classic SEO + crawlable entity signals. */
export function SeoHead() {
  const { pathname } = useLocation()

  useEffect(() => {
    const page = resolvePageSeo(pathname)
    const title = page.title
    const description = page.description
    const canonical = absoluteUrl(page.path === '/verify' ? '/verify' : page.path)
    const ogImage = absoluteUrl(SITE.ogImagePath)

    document.title = title
    document.documentElement.lang = 'en'

    upsertMeta('name', 'description', description)
    upsertMeta('name', 'keywords', DEFAULT_KEYWORDS)
    upsertMeta('name', 'author', SITE.name)
    upsertMeta('name', 'application-name', SITE.shortName)
    upsertMeta(
      'name',
      'robots',
      page.noindex
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    )
    upsertMeta('name', 'googlebot', page.noindex ? 'noindex' : 'index, follow')
    upsertMeta('name', 'theme-color', '#1D4ED8')

    // Clarify brand for assistants / AI overviews
    upsertMeta(
      'name',
      'summary',
      'ADWA is All Drivers Welfare Association (plural Drivers). Official site https://www.alldriverswelfareassociation.org/ — not the similarly named singular-driver domain.',
    )

    upsertLink('canonical', canonical)

    const llmLink = document.head.querySelector<HTMLLinkElement>(
      'link[rel="alternate"][type="text/plain"]',
    )
    if (llmLink) {
      llmLink.href = absoluteUrl('/llms.txt')
    } else {
      const link = document.createElement('link')
      link.rel = 'alternate'
      link.type = 'text/plain'
      link.title = 'LLM context'
      link.href = absoluteUrl('/llms.txt')
      document.head.appendChild(link)
    }

    upsertMeta('property', 'og:type', page.type ?? 'website')
    upsertMeta('property', 'og:site_name', SITE.name)
    upsertMeta('property', 'og:locale', SITE.locale)
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:url', canonical)
    upsertMeta('property', 'og:image', ogImage)
    upsertMeta('property', 'og:image:alt', `${SITE.shortName} — ${SITE.name}`)

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', ogImage)

    upsertJsonLd('adwa-ld-org', buildOrganizationLd())
    upsertJsonLd('adwa-ld-website', buildWebsiteLd())
    upsertJsonLd(
      'adwa-ld-webpage',
      buildWebPageLd(title, description, page.path === '/verify' ? '/verify' : page.path),
    )

    const faqEl = document.getElementById('adwa-ld-faq')
    if (pathname === '/about' || pathname === '/') {
      upsertJsonLd('adwa-ld-faq', buildFaqLd())
    } else if (faqEl) {
      faqEl.remove()
    }
  }, [pathname])

  return null
}
