/**
 * IDCardOverlay — Canvas-based renderer.
 *
 * The template is a 2852×2108px print image (600dpi, see cardGeometry.ts):
 *   Left  half (x 0–1426)    = Back face
 *   Right half (x 1426–2852) = Front face
 *
 * We draw each face onto its own <canvas> by:
 *   1. drawImage the full template shifted so the correct half fills the canvas
 *   2. drawImage the driver photo into the photo box
 *   3. fillText each info row at exact pixel coordinates
 *
 * Coordinates below are in face-local space (faceWidth × canvas.height).
 * Canvas is rendered at native resolution then CSS-scaled to fit the container.
 */

import { useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import type { IdCardFormValues } from './idCardForm'
import type { DriverCard } from '@/services/api/cards.service'
import { CARD_GEOMETRY } from './cardGeometry'

// Cache-busted so browsers/CDN always pick up the latest print artwork after deploy.
const TEMPLATE_PATH = '/id_card/id_card.png?v=20260811-seal'


// ─── Template image singleton (load once) ────────────────────────────────────

let _templateImg: HTMLImageElement | null = null
let _templatePromise: Promise<HTMLImageElement> | null = null
let _templateSrc = ''

function loadTemplate(): Promise<HTMLImageElement> {
  if (_templateImg && _templateSrc === TEMPLATE_PATH) return Promise.resolve(_templateImg)
  _templateSrc = TEMPLATE_PATH
  _templateImg = null
  _templatePromise = new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => { _templateImg = img; resolve(img) }
    img.onerror = reject
    img.src = TEMPLATE_PATH
  })
  return _templatePromise
}

// ADWA seal stamped near the photo — same asset/pattern as the district card.
const SEAL_PATH = '/id_card/adwa_seal.png?v=20260811'
let _sealImg: HTMLImageElement | null = null
let _sealPromise: Promise<HTMLImageElement | null> | null = null
let _sealSrc = ''

function loadSeal(): Promise<HTMLImageElement | null> {
  if (_sealImg && _sealSrc === SEAL_PATH) return Promise.resolve(_sealImg)
  _sealSrc = SEAL_PATH
  _sealImg = null
  _sealPromise = new Promise((resolve) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => { _sealImg = img; resolve(img) }
    img.onerror = () => resolve(null)
    img.src = SEAL_PATH
  })
  return _sealPromise
}

function loadUrl(url: string): Promise<HTMLImageElement> {
  // Fetch as blob so the canvas is never CORS-tainted and signed/local URLs
  // load reliably (same pattern as the QR blob).
  return (async () => {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to load image (${res.status})`)
    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)
    try {
      return await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image()
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error('Image decode failed'))
        img.src = objectUrl
      })
    } finally {
      URL.revokeObjectURL(objectUrl)
    }
  })()
}

/** Draw image with object-fit: cover into the destination rect (passport-style). */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
) {
  const ir = img.naturalWidth / img.naturalHeight
  const tr = dw / dh
  let sx = 0
  let sy = 0
  let sw = img.naturalWidth
  let sh = img.naturalHeight
  if (ir > tr) {
    // Source wider than slot — crop sides
    sw = img.naturalHeight * tr
    sx = (img.naturalWidth - sw) / 2
  } else {
    // Source taller — crop top/bottom, bias upward for faces
    sh = img.naturalWidth / tr
    sy = (img.naturalHeight - sh) * 0.35
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  const rad = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rad, y)
  ctx.arcTo(x + w, y, x + w, y + h, rad)
  ctx.arcTo(x + w, y + h, x, y + h, rad)
  ctx.arcTo(x, y + h, x, y, rad)
  ctx.arcTo(x, y, x + w, y, rad)
  ctx.closePath()
}

// The backend renders card text with Roboto (assets/fonts/Roboto-Regular.ttf).
// The canvas uses the same family so previews match the generated PDF; we must
// wait for the webfont before drawing or the canvas silently falls back.
async function ensureCardFonts(): Promise<void> {
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
  if (!fonts) return
  try {
    await Promise.all([
      fonts.load(`700 ${FRONT.fontSize}px Roboto`),
      fonts.load(`700 ${BACK.fontSize}px Roboto`),
    ])
  } catch { /* font load failed — canvas falls back to sans-serif */ }
}

// ─── Canvas dimensions ────────────────────────────────────────────────────────
// Driven by the shared geometry so the canvas matches the real template
// (each face is faceWidth × canvas.height of the full print image).

const FACE_W = CARD_GEOMETRY.faceWidth
const FACE_H = CARD_GEOMETRY.canvas.height

// ─── Front face coordinates (in face-local space) ────────────────────────────
// Template already prints labels + colon dots — we only draw the VALUES.
// valueX: start of value text (just after the colon area)
// Each row y: text baseline, measured from top of the front face crop.
//
// The photo box is derived from the shared geometry (full-image space) so it
// stays pixel-aligned with the backend Pillow renderer. The front face is the
// right half of the template, so face-local x = full-image x − faceWidth.
const FRONT = {
  photo: {
    x: CARD_GEOMETRY.photo.x - CARD_GEOMETRY.faceWidth,
    y: CARD_GEOMETRY.photo.y,
    w: CARD_GEOMETRY.photo.width,
    h: CARD_GEOMETRY.photo.height,
  },

  // ADWA seal stamped on the photo's bottom-right corner (half on/off —
  // mirrors the district-incharge card's seal treatment). Must stay in sync
  // with the backend's "seal" entry in card_generation/layout.py.
  seal: { x: 775, y: 950, w: 160, h: 160 },

  // After the dotted colon on each label row (calibrated on id_card.png)
  valueX: 610,
  // Right margin before the card's outer border — kept tight so long values
  // truncate before ever touching the border line.
  maxValueWidth: 714,

  rows: [
    { key: 'fullName',      y: 1148 },
    { key: 'fatherName',    y: 1224 },
    { key: 'designation',   y: 1301 },
    { key: 'licenseNumber', y: 1378 },
    { key: 'mobileNumber',  y: 1454 },
    { key: 'policeStation', y: 1531 },
    { key: 'city',          y: 1607 },
    { key: 'state',         y: 1684 },
    { key: 'bloodGroup',    y: 1761 },
    { key: 'dateOfBirth',   y: 1837 },
  ] as { key: keyof IdCardFormValues; y: number }[],

  // Barcode / QR slot (header "बारकोड" box)
  qr: { x: 1140, y: 400, w: 159, h: 162 },

  fontSize: 55,
  fontFamily: 'Roboto, sans-serif',
  valueColor: '#141414',
}

// ─── Back face coordinates (face-local space) ────────────────────────────────
// Value boxes only — do not cover the colored CARD NO / ISSUE / EXPIRY labels.
const BACK = {
  // Wipe the value-box interior only (after the colored pill tip → before the
  // right border) so every template zero disappears without clipping the label.
  rows: [
    {
      erase: { x: 612, y: 921, w: 592, h: 96 },
      textX: 645, textY: 969, color: '#2E3092',
      key: 'cardNumber' as const,
    },
    {
      erase: { x: 612, y: 1067, w: 592, h: 94 },
      textX: 645, textY: 1114, color: '#135F24',
      key: 'issueDate' as const,
    },
    {
      erase: { x: 612, y: 1216, w: 592, h: 95 },
      textX: 645, textY: 1264, color: '#EF4224',
      key: 'expiryDate' as const,
    },
  ],

  fontSize: 58,
  fontFamily: 'Roboto, sans-serif',
}

type CancelCheck = () => boolean

// ─── Draw front face ──────────────────────────────────────────────────────────

async function drawFront(
  canvas: HTMLCanvasElement,
  form: IdCardFormValues,
  photoUrl: string | null | undefined,
  qrUrl: string | null | undefined,
  isCancelled: CancelCheck = () => false,
) {
  const [tpl, , seal] = await Promise.all([loadTemplate(), ensureCardFonts(), loadSeal()])
  if (isCancelled()) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  // Reset size (clears canvas) only once assets are ready — avoids wiping a newer draw.
  canvas.width = FACE_W
  canvas.height = FACE_H

  // Draw right half of template
  ctx.drawImage(tpl, FACE_W, 0, FACE_W, FACE_H, 0, 0, FACE_W, FACE_H)

  // Photo slot sits in a blank gap on the artwork (no printed box there), so we
  // frame it ourselves — rounded corners + a thin border, matching the BE Pillow renderer.
  const { x, y, w, h } = FRONT.photo
  ctx.fillStyle = '#ffffff'
  roundRect(ctx, x, y, w, h, 12)
  ctx.fill()
  if (photoUrl) {
    try {
      const photo = await loadUrl(photoUrl)
      if (isCancelled()) return
      ctx.save()
      roundRect(ctx, x, y, w, h, 12)
      ctx.clip()
      drawImageCover(ctx, photo, x, y, w, h)
      ctx.restore()
    } catch (err) {
      console.warn('Failed to draw driver photo on ID card', err)
    }
  }
  roundRect(ctx, x, y, w, h, 12)
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'
  ctx.lineWidth = 4
  ctx.stroke()

  // ADWA seal stamped on the photo's corner (half on/off)
  if (seal) {
    const s = FRONT.seal
    ctx.drawImage(seal, s.x, s.y, s.w, s.h)
  }

  if (isCancelled()) return

  // Values only — no white backing on the front; text sits on the dotted lines
  ctx.font = `700 ${FRONT.fontSize}px ${FRONT.fontFamily}`
  ctx.fillStyle = FRONT.valueColor
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'

  const maxW = FRONT.maxValueWidth
  for (const row of FRONT.rows) {
    const raw = String(form[row.key] || '')
    if (!raw) continue
    // Normalize ISO dates (YYYY-MM-DD) to DD/MM/YYYY
    let display = raw.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$3/$2/$1')
    const original = display
    while (ctx.measureText(display).width > maxW && display.length > 1) {
      display = display.slice(0, -1)
    }
    if (display !== original) display = display.slice(0, -1) + '…'
    ctx.fillText(display, FRONT.valueX, row.y)
  }

  // QR code in the header barcode slot
  if (qrUrl) {
    try {
      const qr = await loadUrl(qrUrl)
      if (isCancelled()) return
      const { x, y, w, h } = FRONT.qr
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(x, y, w, h)
      ctx.drawImage(qr, x, y, w, h)
    } catch { /* ignore */ }
  }
}

// ─── Draw back face ───────────────────────────────────────────────────────────

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function drawBack(
  canvas: HTMLCanvasElement,
  card: DriverCard | null | undefined,
  isCancelled: CancelCheck = () => false,
) {
  const [tpl] = await Promise.all([loadTemplate(), ensureCardFonts()])
  if (isCancelled()) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  canvas.width = FACE_W
  canvas.height = FACE_H

  // Draw left half of template
  ctx.drawImage(tpl, 0, 0, FACE_W, FACE_H, 0, 0, FACE_W, FACE_H)

  ctx.font = `700 ${BACK.fontSize}px ${BACK.fontFamily}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'

  const values: Record<string, string> = {
    cardNumber: card?.cardNumber ?? '',
    issueDate:  fmtDate(card?.issuedAt),
    expiryDate: fmtDate(card?.expiresAt),
  }

  for (const row of BACK.rows) {
    const { erase, textX, textY, color, key } = row
    const text = values[key]
    if (!text) continue
    // Wipe the whole value box so no template zeros bleed through
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(erase.x, erase.y, erase.w, erase.h)
    ctx.fillStyle = color
    ctx.fillText(text, textX, textY)
  }
}

// ─── React canvas component ───────────────────────────────────────────────────

interface FaceCanvasProps {
  draw: (canvas: HTMLCanvasElement, isCancelled: CancelCheck) => Promise<void>
  label: string
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}

function FaceCanvas({ draw, label, canvasRef }: FaceCanvasProps) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let cancelled = false
    void draw(canvas, () => cancelled)
    return () => { cancelled = true }
  }, [draw, canvasRef])

  return (
    <div className="min-w-0">
      <p className="mb-1 text-center text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
        {label}
      </p>
      <div className="overflow-hidden rounded-lg border border-neutral-200 shadow-sm">
        <canvas
          ref={canvasRef}
          width={FACE_W}
          height={FACE_H}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>
    </div>
  )
}

// ─── Print helpers ────────────────────────────────────────────────────────────

function printCanvases(front: HTMLCanvasElement, back: HTMLCanvasElement, driverName: string) {
  const frontDataUrl = front.toDataURL('image/png')
  const backDataUrl  = back.toDataURL('image/png')

  const win = window.open('', '_blank')
  if (!win) return

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>ADWA ID Card — ${driverName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #fff; }
    .page { width: 100vw; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; padding: 24px; }
    img { width: 45vw; max-width: 500px; height: auto; display: block; }
    @media print {
      @page { margin: 0; size: A4 landscape; }
      body { margin: 0; }
      .page { flex-direction: row; gap: 12px; padding: 12px; }
      img { width: 48%; max-width: none; }
    }
  </style>
</head>
<body>
  <div class="page">
    <img src="${frontDataUrl}" alt="Front" />
    <img src="${backDataUrl}"  alt="Back" />
  </div>
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close() }</script>
</body>
</html>`)
  win.document.close()
}

function downloadBothCanvases(front: HTMLCanvasElement, back: HTMLCanvasElement, driverName: string) {
  // Merge front + back side-by-side into one PNG
  const merged = document.createElement('canvas')
  merged.width  = front.width + back.width
  merged.height = Math.max(front.height, back.height)
  const ctx = merged.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, merged.width, merged.height)
  ctx.drawImage(front, 0, 0)
  ctx.drawImage(back, front.width, 0)

  const a = document.createElement('a')
  a.href = merged.toDataURL('image/png')
  a.download = `${driverName}-id-card.png`
  a.click()
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface IDCardOverlayProps {
  values: IdCardFormValues
  card?: DriverCard | null
  photoUrl?: string | null
  qrUrl?: string | null
  loading?: boolean
  className?: string
  /** Called with print/download handlers once canvases are ready */
  onActionsReady?: (actions: { print: () => void; downloadFront: () => void; downloadBack: () => void }) => void
}

export function IDCardOverlay({ values, card, photoUrl, qrUrl, loading = false, className, onActionsReady }: IDCardOverlayProps) {
  const { t } = useTranslation('dashboard')
  const frontRef = useRef<HTMLCanvasElement>(null)
  const backRef  = useRef<HTMLCanvasElement>(null)

  const drawFrontCb = useCallback(
    (canvas: HTMLCanvasElement, isCancelled: () => boolean) =>
      drawFront(canvas, values, photoUrl, qrUrl, isCancelled),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values.fullName, values.fatherName, values.designation, values.licenseNumber,
     values.mobileNumber, values.policeStation, values.city, values.state,
     values.bloodGroup, values.dateOfBirth, photoUrl, qrUrl],
  )

  const drawBackCb = useCallback(
    (canvas: HTMLCanvasElement, isCancelled: () => boolean) =>
      drawBack(canvas, card, isCancelled),
    [card],
  )

  // Expose actions to parent after first render
  useEffect(() => {
    if (!onActionsReady) return
    const name = values.fullName?.replace(/\s+/g, '-') || 'driver'
    onActionsReady({
      print: () => {
        const f = frontRef.current; const b = backRef.current
        if (f && b) printCanvases(f, b, name)
      },
      downloadFront: () => {
        const f = frontRef.current; const b = backRef.current
        if (f && b) downloadBothCanvases(f, b, name)
      },
      downloadBack: () => {},
    })
  }, [onActionsReady, values.fullName])

  if (loading) {
    return (
      <div className={cn('grid gap-4 sm:grid-cols-2', className)}>
        {[0, 1].map((i) => (
          <div key={i}>
            <div className="mb-1 h-3 w-12 mx-auto animate-pulse rounded bg-neutral-200" />
            <div className="animate-pulse rounded-lg bg-neutral-200" style={{ aspectRatio: `${FACE_W} / ${FACE_H}` }} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 w-full min-w-0', className)}>
      <FaceCanvas label={t('dashboard.idCard.front')} draw={drawFrontCb} canvasRef={frontRef} />
      <FaceCanvas label={t('dashboard.idCard.back')}  draw={drawBackCb}  canvasRef={backRef} />
    </div>
  )
}
