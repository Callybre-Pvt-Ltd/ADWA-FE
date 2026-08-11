/** Template: public/id_card/district_incharge_card.png (2875×2213, 600dpi) */
export const G = {
  width: 2875,
  height: 2213,
  template: '/id_card/district_incharge_card.png?v=20260811',
  /** Sample portrait slot on the front panel */
  photo: { x: 1860, y: 931, w: 538, h: 556, r: 58 },
  /** Official ADWA seal stamped near the photo (bottom-right corner, half on/off) */
  seal: {
    src: '/id_card/adwa_seal.png?v=20260811',
    x: 2350,
    y: 1260,
    w: 200,
    h: 200,
  },
  /** "बारकोड" placeholder — replaced with a scannable QR */
  qr: { x: 2511, y: 391, w: 214, h: 219 },
  /** Sample name slot — below photo, above orange divider. `baseline` is a vertical CENTER (textBaseline is 'middle'). */
  name: {
    erase: { x: 1601, y: 1498, w: 1058, h: 167 },
    cx: 2130,
    baseline: 1581,
    size: 108,
    color: '#2E3092',
  },
  /**
   * Keep template label "पदाधिकारी :-" on the left; erase + paint only the role
   * on the right (tight box around the text line).
   */
  designation: {
    erase: { x: 2101, y: 1700, w: 650, h: 184 },
    x: 2134,
    baseline: 1793,
    size: 83,
    color: '#2E3092',
  },
  cardNumber: {
    erase: { x: 593, y: 948, w: 641, h: 104 },
    x: 626,
    baseline: 1000,
    size: 53,
    color: '#2E3092',
  },
  issueDate: {
    erase: { x: 593, y: 1098, w: 641, h: 98 },
    x: 626,
    baseline: 1147,
    size: 53,
    color: '#135F24',
  },
  expiryDate: {
    erase: { x: 593, y: 1248, w: 641, h: 98 },
    x: 626,
    baseline: 1297,
    size: 53,
    color: '#EF4224',
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
