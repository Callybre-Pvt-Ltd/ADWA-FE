/**
 * IDCardOverlay — Canvas-based renderer.
 *
 * The template is a 1600×1255px landscape print image (see cardGeometry.ts):
 *   Left  half (x 0–800)   = Back face
 *   Right half (x 800–1600) = Front face
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

const TEMPLATE_PATH = '/id_card/id_card.png'

// ─── Template image singleton (load once) ────────────────────────────────────

let _templateImg: HTMLImageElement | null = null
let _templatePromise: Promise<HTMLImageElement> | null = null

function loadTemplate(): Promise<HTMLImageElement> {
  if (_templateImg) return Promise.resolve(_templateImg)
  if (_templatePromise) return _templatePromise
  _templatePromise = new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => { _templateImg = img; resolve(img) }
    img.onerror = reject
    img.src = TEMPLATE_PATH
  })
  return _templatePromise
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

  // After the dotted colon on each label row (calibrated on id_card.png)
  valueX: 335,

  rows: [
    { key: 'fullName',      y: 684 },
    { key: 'fatherName',    y: 732 },
    { key: 'designation',   y: 779 },
    { key: 'licenseNumber', y: 827 },
    { key: 'mobileNumber',  y: 874 },
    { key: 'policeStation', y: 922 },
    { key: 'city',          y: 969 },
    { key: 'state',         y: 1017 },
    { key: 'bloodGroup',    y: 1064 },
    { key: 'dateOfBirth',   y: 1112 },
  ] as { key: keyof IdCardFormValues; y: number }[],

  // Optional QR / barcode slot (header "बारकोड" box)
  qr: { x: 652, y: 220, w: 99, h: 102 },

  fontSize: 22,
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
      erase: { x: 322, y: 548, w: 370, h: 52 },
      textX: 330, textY: 574, color: '#113478',
      key: 'cardNumber' as const,
    },
    {
      erase: { x: 322, y: 635, w: 370, h: 58 },
      textX: 330, textY: 664, color: '#005C33',
      key: 'issueDate' as const,
    },
    {
      erase: { x: 322, y: 728, w: 370, h: 58 },
      textX: 330, textY: 757, color: '#B41E1E',
      key: 'expiryDate' as const,
    },
  ],

  fontSize: 26,
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
  const [tpl] = await Promise.all([loadTemplate(), ensureCardFonts()])
  if (isCancelled()) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  // Reset size (clears canvas) only once assets are ready — avoids wiping a newer draw.
  canvas.width = FACE_W
  canvas.height = FACE_H

  // Draw right half of template
  ctx.drawImage(tpl, FACE_W, 0, FACE_W, FACE_H, 0, 0, FACE_W, FACE_H)

  // Always erase the sample portrait baked into the artwork.
  const { x, y, w, h } = FRONT.photo
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(x, y, w, h)

  // Driver passport photo — cover-crop into the slot (matches BE Pillow renderer).
  if (photoUrl) {
    try {
      const photo = await loadUrl(photoUrl)
      if (isCancelled()) return
      drawImageCover(ctx, photo, x, y, w, h)
    } catch (err) {
      console.warn('Failed to draw driver photo on ID card', err)
    }
  }

  if (isCancelled()) return

  // Values only — no white backing on the front; text sits on the dotted lines
  ctx.font = `700 ${FRONT.fontSize}px ${FRONT.fontFamily}`
  ctx.fillStyle = FRONT.valueColor
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'

  const maxW = FACE_W - FRONT.valueX - 40
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
