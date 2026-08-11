/** Template: public/id_card/district_incharge_card.png (1024×717) */
export const G = {
  width: 1024,
  height: 717,
  template: '/id_card/district_incharge_card.png?v=10',
  /** Sample portrait slot on the front panel */
  photo: { x: 661, y: 297, w: 196, h: 202, r: 16 },
  /** Official ADWA seal stamped near the photo (bottom-right, on photo) */
  seal: {
    src: '/id_card/adwa_seal.png?v=2',
    x: 808,
    y: 420,
    w: 74,
    h: 74,
  },
  /** "बारकोड" placeholder — replaced with a scannable QR */
  qr: { x: 585, y: 106, w: 70, h: 72 },
  /** Sample name slot — below photo, above orange divider */
  name: {
    erase: { x: 640, y: 500, w: 260, h: 53 },
    cx: 760,
    baseline: 536,
    size: 32,
    color: '#002366',
  },
  /**
   * Keep template label "पदाधिकारी :-" on the left; erase + paint only the role
   * on the right (tight box around the text line).
   */
  designation: {
    erase: { x: 732, y: 578, w: 210, h: 34 },
    x: 738,
    baseline: 602,
    size: 24,
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
    erase: { x: 248, y: 354, w: 200, h: 34 },
    x: 256,
    baseline: 382,
    size: 20,
    color: '#2D5A27',
  },
  expiryDate: {
    erase: { x: 248, y: 404, w: 200, h: 34 },
    x: 256,
    baseline: 434,
    size: 20,
    color: '#E03A1A',
  },
} as const

export type DistrictInchargeCardForm = {
  fullName: string
  designation: string
  districtName: string
  districtCode: string
  cardNumber: string
  issueDate: string
  expiryDate: string
}

export function formatCardDate(iso: string): string {
  if (!iso) return ''
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (m) return `${m[3]}/${m[2]}/${m[1]}`
  return iso
}

/** QR payload: public verify URL when issued; empty until then. */
export function buildDistrictQrPayload(verificationUrl: string | null | undefined): string {
  return (verificationUrl || '').trim()
}
