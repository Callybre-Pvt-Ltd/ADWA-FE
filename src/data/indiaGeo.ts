import indiaRaw from './indiaStatesDistricts.json'

export type IndiaRegion = {
  state: string
  districts: string[]
}

type IndiaGeoFile = {
  states: IndiaRegion[]
  union_territories: IndiaRegion[]
}

const geo = indiaRaw as IndiaGeoFile

/** Official-ish state / UT abbreviations for ID cards and district codes. */
export const STATE_CODES: Record<string, string> = {
  'Andhra Pradesh': 'AP',
  'Arunachal Pradesh': 'AR',
  Assam: 'AS',
  Bihar: 'BR',
  Chhattisgarh: 'CG',
  Goa: 'GA',
  Gujarat: 'GJ',
  Haryana: 'HR',
  'Himachal Pradesh': 'HP',
  Jharkhand: 'JH',
  Karnataka: 'KA',
  Kerala: 'KL',
  'Madhya Pradesh': 'MP',
  Maharashtra: 'MH',
  Manipur: 'MN',
  Meghalaya: 'ML',
  Mizoram: 'MZ',
  Nagaland: 'NL',
  Odisha: 'OD',
  Punjab: 'PB',
  Rajasthan: 'RJ',
  Sikkim: 'SK',
  'Tamil Nadu': 'TN',
  Telangana: 'TS',
  Tripura: 'TR',
  'Uttar Pradesh': 'UP',
  Uttarakhand: 'UK',
  'West Bengal': 'WB',
  'Andaman and Nicobar Islands': 'AN',
  Chandigarh: 'CH',
  'Dadra and Nagar Haveli and Daman and Diu': 'DH',
  Delhi: 'DL',
  'Jammu and Kashmir': 'JK',
  Ladakh: 'LA',
  Lakshadweep: 'LD',
  Puducherry: 'PY',
}

/** All states + UTs (states first, then UTs), sorted alphabetically within each group. */
export const INDIA_REGIONS: IndiaRegion[] = [
  ...geo.states,
  ...geo.union_territories,
]

export const INDIA_STATE_NAMES: string[] = INDIA_REGIONS.map((r) => r.state)

const districtsByState = new Map<string, string[]>(
  INDIA_REGIONS.map((r) => [r.state, [...r.districts].sort((a, b) => a.localeCompare(b))]),
)

export function getDistrictsForState(state: string): string[] {
  return districtsByState.get(state) ?? []
}

export function getStateCode(state: string): string {
  return STATE_CODES[state] ?? state.slice(0, 2).toUpperCase()
}

/** e.g. Madhya Pradesh + RJG → "MP-RJG" */
export function formatRegionInitials(state: string, districtCode: string): string {
  const sc = getStateCode(state)
  const dc = (districtCode || '').toUpperCase().trim()
  if (!dc) return sc
  if (dc.startsWith(`${sc}-`)) return dc
  // Strip a leading state prefix if already present without hyphen
  if (dc.startsWith(sc) && dc.length > sc.length + 1) {
    return `${sc}-${dc.slice(sc.length).replace(/^-+/, '')}`
  }
  return `${sc}-${dc}`
}
