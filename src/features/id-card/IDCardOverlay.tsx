/**
 * IDCardOverlay — Canvas-based renderer.
 *
 * The template is a 1600×1168px landscape print image (see cardGeometry.ts):
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
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
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

  valueX: 375,  // x where value text starts (right of the dotted colon line)

  rows: [
    { key: 'fullName',      y: 640 },
    { key: 'fatherName',    y: 681 },
    { key: 'designation',   y: 725 },
    { key: 'licenseNumber', y: 770 },
    { key: 'mobileNumber',  y: 815 },
    { key: 'policeStation', y: 860 },
    { key: 'city',          y: 901 },
    { key: 'state',         y: 950 },
    { key: 'bloodGroup',    y: 995 },
    { key: 'dateOfBirth',   y: 1040 },
  ] as { key: keyof IdCardFormValues; y: number }[],

  fontSize: 30,
  fontFamily: 'Roboto, sans-serif',
  valueColor: '#111827',
}

// ─── Back face coordinates (face-local space) ────────────────────────────────
// NOTE: The backend renderer uses a different source template (Simran-front.png),
// so backend layout.py erase coordinates do NOT apply here.  These erase boxes
// are calibrated for id_card.png used by the frontend canvas.
//
// Each erase box intentionally spans from the start of the value area all the
// way to the right edge of the face so it covers every placeholder digit in
// the template regardless of how many there are (card-no has 12, expiry has 13).
const BACK = {
  rows: [
    {
      // erase covers the full value area so no template zeros bleed through
      erase:  { x: 290, y: 513, w: 510, h: 44 },
      textX:  300, textY: 545, color: '#393186',
      key: 'cardNumber' as const,
    },
    {
      erase:  { x: 290, y: 599, w: 510, h: 44 },
      textX:  300, textY: 631, color: '#2C642E',
      key: 'issueDate' as const,
    },
    {
      erase:  { x: 290, y: 683, w: 510, h: 44 },
      textX:  300, textY: 715, color: '#E63C23',
      key: 'expiryDate' as const,
    },
  ],

  fontSize: 30,
  fontFamily: 'Roboto, sans-serif',
}

// ─── Draw front face ──────────────────────────────────────────────────────────

async function drawFront(
  canvas: HTMLCanvasElement,
  form: IdCardFormValues,
  photoUrl: string | null | undefined,
  qrUrl: string | null | undefined,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  canvas.width = FACE_W
  canvas.height = FACE_H

  const [tpl] = await Promise.all([loadTemplate(), ensureCardFonts()])

  // Draw right half of template
  ctx.drawImage(tpl, FACE_W, 0, FACE_W, FACE_H, 0, 0, FACE_W, FACE_H)

  // Driver photo — stretch to the exact box to match the backend Pillow renderer.
  if (photoUrl) {
    try {
      const photo = await loadUrl(photoUrl)
      const { x, y, w, h } = FRONT.photo
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(x, y, w, h)
      ctx.drawImage(photo, x, y, w, h)
    } catch { /* photo load failed — show template placeholder */ }
  }

  // Values only — template already has labels + dotted lines printed
  ctx.font = `700 ${FRONT.fontSize}px ${FRONT.fontFamily}`
  ctx.fillStyle = FRONT.valueColor
  ctx.textAlign = 'left'

  const maxW = FACE_W - FRONT.valueX - 20
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

  // QR code (optional — bottom right corner)
  if (qrUrl) {
    try {
      const qr = await loadUrl(qrUrl)
      ctx.drawImage(qr, 665, 205, 88, 88)
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

async function drawBack(canvas: HTMLCanvasElement, card: DriverCard | null | undefined) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  canvas.width = FACE_W
  canvas.height = FACE_H

  const [tpl] = await Promise.all([loadTemplate(), ensureCardFonts()])

  // Draw left half of template
  ctx.drawImage(tpl, 0, 0, FACE_W, FACE_H, 0, 0, FACE_W, FACE_H)

  ctx.font = `700 ${BACK.fontSize}px ${BACK.fontFamily}`
  ctx.textAlign = 'left'

  const values: Record<string, string> = {
    cardNumber: card?.cardNumber ?? '',
    issueDate:  fmtDate(card?.issuedAt),
    expiryDate: fmtDate(card?.expiresAt),
  }

  for (const row of BACK.rows) {
    const { erase, textX, textY, color, key } = row
    // Fill the full erase area with white so all template placeholder digits are covered
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(erase.x, erase.y, erase.w, erase.h)
    // Draw the value text
    ctx.fillStyle = color
    ctx.fillText(values[key], textX, textY)
  }
}

// ─── React canvas component ───────────────────────────────────────────────────

interface FaceCanvasProps {
  draw: (canvas: HTMLCanvasElement) => Promise<void>
  label: string
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}

function FaceCanvas({ draw, label, canvasRef }: FaceCanvasProps) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    void draw(canvas)
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
    (canvas: HTMLCanvasElement) => drawFront(canvas, values, photoUrl, qrUrl),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values.fullName, values.designation, values.mobileNumber, values.policeStation,
     values.city, values.state, values.bloodGroup, values.dateOfBirth, photoUrl, qrUrl],
  )

  const drawBackCb = useCallback(
    (canvas: HTMLCanvasElement) => drawBack(canvas, card),
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
