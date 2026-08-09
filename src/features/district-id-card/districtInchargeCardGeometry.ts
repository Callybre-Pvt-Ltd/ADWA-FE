/** Template: public/id_card/district_incharge_card.png (1024×717) */
export const G = {
  width: 1024,
  height: 717,
  template: '/id_card/district_incharge_card.png?v=9',
  /** Sample portrait slot on the front panel */
  photo: { x: 661, y: 297, w: 196, h: 202, r: 16 },
  /** Sample name slot — below photo, above orange divider */
  name: {
    erase: { x: 640, y: 500, w: 260, h: 53 },
    cx: 760,
    baseline: 536,
    size: 32,
    color: '#002366',
  },
  cardNumber: {
    erase: { x: 248, y: 308, w: 200, h: 30 },
    x: 256,
    baseline: 329,
    size: 16,
    color: '#0B2F8A',
  },
  issueDate: {
    erase: { x: 248, y: 358, w: 200, h: 30 },
    x: 256,
    baseline: 381,
    size: 16,
    color: '#2D5A27',
  },
  expiryDate: {
    erase: { x: 248, y: 408, w: 200, h: 30 },
    x: 256,
    baseline: 433,
    size: 16,
    color: '#E03A1A',
  },
} as const

export type DistrictInchargeCardForm = {
  fullName: string
  districtName: string
  districtCode: string
  cardNumber: string
  issueDate: string
  expiryDate: string
}

export function buildDistrictCardNumber(code: string, year = new Date().getFullYear()): string {
  const c = (code || 'MP').trim().toUpperCase() || 'MP'
  // Client-side unique seq (time-based) — avoids duplicate conflicts from manual entry
  const seq = String(Date.now() % 10000).padStart(4, '0')
  return `ADWA-${c}-${year}-${seq}`
}

export function formatCardDate(iso: string): string {
  if (!iso) return ''
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (m) return `${m[3]}/${m[2]}/${m[1]}`
  return iso
}
