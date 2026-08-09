export const districtMapEnToHi: Record<string, string> = {
  'Agar Malwa': 'आगर मालवा',
  'Alirajpur': 'अलीराजपुर',
  'Anuppur': 'अनूपपुर',
  'Ashoknagar': 'अशोकनगर',
  'Balaghat': 'बालाघाट',
  'Barwani': 'बड़वानी',
  'Betul': 'बैतूल',
  'Bhind': 'भिंड',
  'Bhopal': 'भोपाल',
  'Burhanpur': 'बुरहानपुर',
  'Chhatarpur': 'छतरपुर',
  'Chhindwara': 'छिंदवाड़ा',
  'Damoh': 'दमोह',
  'Datia': 'दतिया',
  'Dewas': 'देवास',
  'Dhar': 'धार',
  'Dindori': 'डिंडोरी',
  'Guna': 'गुना',
  'Gwalior': 'ग्वालियर',
  'Harda': 'हरदा',
  'Hoshangabad': 'होशंगाबाद',
  'Narmadapuram': 'नर्मदापुरम',
  'Indore': 'इंदौर',
  'Jabalpur': 'जबलपुर',
  'Jhabua': 'झाबुआ',
  'Katni': 'कटनी',
  'Khandwa': 'खंडवा',
  'Khargone': 'खरगोन',
  'Maihar': 'मैहर',
  'Mandla': 'मंडला',
  'Mandsaur': 'मंदसौर',
  'Mauganj': 'मौगंज',
  'Morena': 'मुरैना',
  'Narsinghpur': 'नरसिंहपुर',
  'Neemuch': 'नीमच',
  'Niwari': 'निवाड़ी',
  'Panna': 'पन्ना',
  'Pandhurna': 'पांढुर्ना',
  'Raisen': 'रायसेन',
  'Rajgarh': 'राजगढ़',
  'Ratlam': 'रतलाम',
  'Rewa': 'रीवा',
  'Sagar': 'सागर',
  'Satna': 'सतना',
  'Sehore': 'सीहोर',
  'Seoni': 'सिवनी',
  'Shahdol': 'शहडोल',
  'Shajapur': 'शाजापुर',
  'Sheopur': 'श्योपुर',
  'Shivpuri': 'शिवपुरी',
  'Sidhi': 'सीधी',
  'Singrauli': 'सिंगरौली',
  'Tikamgarh': 'टीकमगढ़',
  'Ujjain': 'उज्जैन',
  'Umaria': 'उमरिया',
  'Vidisha': 'विदिशा',
  'Mumbai': 'मुंबई',
  'Delhi': 'दिल्ली',
  'Bengaluru Urban': 'बेंगलुरु शहरी',
  'Hyderabad': 'हैदराबाद',
  'Chennai': 'चेन्नई',
  'Kolkata': 'कोलकाता',
  'Pune': 'पुणे',
}

/** Reverse map for Hindi → English district lookup */
export const districtMapHiToEn: Record<string, string> = Object.fromEntries(
  Object.entries(districtMapEnToHi).map(([en, hi]) => [hi, en]),
)

export const stateMapEnToHi: Record<string, string> = {
  'Maharashtra': 'महाराष्ट्र',
  'Delhi NCR': 'दिल्ली एनसीआर',
  'Karnataka': 'कर्नाटक',
  'Telangana': 'तेलंगाना',
  'Tamil Nadu': 'तमिलनाडु',
  'West Bengal': 'पश्चिम बंगाल',
  'Madhya Pradesh': 'मध्य प्रदेश',
}

/**
 * Expand a search query so Hindi district names also match English DB values
 * (and vice versa). Returns unique terms to try.
 */
export function expandSearchTerms(query: string): string[] {
  const q = query.trim()
  if (!q) return []
  const terms = new Set<string>([q])
  const qLower = q.toLowerCase()

  for (const [en, hi] of Object.entries(districtMapEnToHi)) {
    const enLower = en.toLowerCase()
    if (
      hi === q
      || enLower === qLower
      || (q.length >= 2 && (hi.includes(q) || enLower.includes(qLower)))
      || q.includes(hi)
    ) {
      terms.add(en)
      terms.add(hi)
    }
  }

  for (const [en, hi] of Object.entries(stateMapEnToHi)) {
    if (hi === q || en.toLowerCase() === qLower || (q.length >= 2 && hi.includes(q))) {
      terms.add(en)
      terms.add(hi)
    }
  }

  return [...terms]
}

/**
 * Map Hindi UI search text to the best English term for server-side DB search.
 * Falls back to the original query when no mapping applies.
 */
export function normalizeSearchForApi(query: string): string {
  const q = query.trim()
  if (!q) return q

  if (districtMapHiToEn[q]) return districtMapHiToEn[q]

  let bestEn: string | null = null
  let bestHiLen = 0
  for (const [en, hi] of Object.entries(districtMapEnToHi)) {
    if (q.length >= 2 && hi.includes(q) && hi.length >= bestHiLen) {
      bestEn = en
      bestHiLen = hi.length
    }
  }
  if (bestEn) return bestEn

  for (const [en, hi] of Object.entries(stateMapEnToHi)) {
    if (hi === q || (q.length >= 2 && hi.includes(q))) return en
  }

  return q
}

/** Client-side match that understands Hindi ↔ English district/state labels. */
export function matchesLocalizedSearch(
  fields: Array<string | number | null | undefined>,
  query: string,
): boolean {
  const q = query.trim()
  if (!q) return true

  const bag: string[] = []
  for (const field of fields) {
    if (field === null || field === undefined || field === '') continue
    const text = String(field)
    bag.push(text)
    const hi = districtMapEnToHi[text]
    if (hi) bag.push(hi)
    const en = districtMapHiToEn[text]
    if (en) bag.push(en)
    for (const [enName, hiName] of Object.entries(districtMapEnToHi)) {
      if (text.includes(enName)) bag.push(hiName)
      if (text.includes(hiName)) bag.push(enName)
    }
  }

  const terms = expandSearchTerms(q)
  const hayLower = bag.join(' | ').toLowerCase()
  const hayRaw = bag.join(' | ')
  return terms.some((term) => {
    if (!term) return false
    if (hayRaw.includes(term)) return true
    return hayLower.includes(term.toLowerCase())
  })
}

export const nameTranslations: Record<string, string> = {
  'Arslaan Siddiqui': 'अर्शलान सिद्दीकी',
}

export const translateFullName = (name: string, isHi: boolean) => {
  if (!isHi) return name
  let translated = name.replace('District Incharge', 'जिला प्रभारी')
  for (const [en, hi] of Object.entries(districtMapEnToHi)) {
    translated = translated.replace(en, hi)
  }
  return translated
}
