import { useCallback, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import {
  G,
  buildDistrictQrPayload,
  formatCardDate,
  type DistrictInchargeCardForm,
} from './districtInchargeCardGeometry'

// Template is baked at 600dpi (see districtInchargeCardGeometry.ts) — convert
// the canvas's pixel size to its true physical size so the PDF page matches
// print dimensions exactly, instead of an arbitrary page size.
const MM_PER_INCH = 25.4
const CARD_DPI = 600
const PDF_WIDTH_MM = (G.width / CARD_DPI) * MM_PER_INCH
const PDF_HEIGHT_MM = (G.height / CARD_DPI) * MM_PER_INCH

const FONT =
  '"Noto Sans Devanagari", "Noto Sans", "Mangal", "Kohinoor Devanagari", system-ui, sans-serif'
/** Matches sample name on the printed card (bold geometric Devanagari) */
const NAME_FONT =
  '"Poppins", "Mukta", "Noto Sans Devanagari", "Noto Sans", system-ui, sans-serif'

let _tpl: HTMLImageElement | null = null
let _tplSrc = ''
let _tplPromise: Promise<HTMLImageElement> | null = null

let _seal: HTMLImageElement | null = null
let _sealSrc = ''
let _sealPromise: Promise<HTMLImageElement | null> | null = null

function loadTemplate(): Promise<HTMLImageElement> {
  if (_tpl && _tplSrc === G.template) return Promise.resolve(_tpl)
  if (_tplPromise && _tplSrc === G.template) return _tplPromise
  _tplSrc = G.template
  _tpl = null
  _tplPromise = new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      _tpl = img
      resolve(img)
    }
    img.onerror = () => reject(new Error('Template load failed'))
    img.src = G.template
  })
  return _tplPromise
}

function loadSeal(): Promise<HTMLImageElement | null> {
  if (_seal && _sealSrc === G.seal.src) return Promise.resolve(_seal)
  if (_sealPromise && _sealSrc === G.seal.src) return _sealPromise
  _sealSrc = G.seal.src
  _seal = null
  _sealPromise = new Promise((resolve) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      _seal = img
      resolve(img)
    }
    img.onerror = () => resolve(null)
    img.src = G.seal.src
  })
  return _sealPromise
}

/** Decode any photo/QR URL into a bitmap safe for canvas (no CORS taint, no revoke races). */
async function loadCanvasImage(url: string): Promise<ImageBitmap> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load image (${res.status})`)
  const blob = await res.blob()
  return createImageBitmap(blob)
}

function cover(
  ctx: CanvasRenderingContext2D,
  img: ImageBitmap,
  dx: number, dy: number, dw: number, dh: number,
) {
  const iw = img.width
  const ih = img.height
  if (!iw || !ih) return
  const ir = iw / ih
  const tr = dw / dh
  let sx = 0, sy = 0, sw = iw, sh = ih
  if (ir > tr) {
    sw = ih * tr
    sx = (iw - sw) / 2
  } else {
    sh = iw / tr
    sy = (ih - sh) * 0.3
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
}

function roundClip(
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

function erase(ctx: CanvasRenderingContext2D, box: { x: number; y: number; w: number; h: number }) {
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(box.x, box.y, box.w, box.h)
}

// Canvas's native fillText `maxWidth` param only asks the UA to *compress*
// glyphs to fit — support is inconsistent (some engines ignore it outright),
// so long values can still draw past the card's printed vertical border. We
// measure and truncate/shrink ourselves instead, which is reliable everywhere.

/** Center-aligned single line: shrink font toward a floor, then ellipsis-truncate. */
function paintFitCentered(
  ctx: CanvasRenderingContext2D,
  opts: { cx: number; baseline: number; maxW: number; size: number; floor: number; font: string; weight: number },
  text: string,
) {
  const { cx, baseline, maxW, size: startSize, floor, font, weight } = opts
  let size = startSize
  const setFont = (s: number) => { ctx.font = `${weight} ${s}px ${font}` }
  setFont(size)
  while (size > floor && ctx.measureText(text).width > maxW) {
    size -= 2
    setFont(size)
  }
  let display = text
  if (ctx.measureText(display).width > maxW) {
    while (display.length > 1 && ctx.measureText(`${display}…`).width > maxW) {
      display = display.slice(0, -1)
    }
    display = `${display}…`
  }
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(display, cx, baseline)
}

/** Left-aligned, up to 3 lines. Shrinks hard for small printed cards (~6cm face);
 *  Devanagari titles often have no spaces, so we wrap by grapheme when needed. */
function paintFitWrapped(
  ctx: CanvasRenderingContext2D,
  opts: { x: number; baseline: number; maxW: number; size: number; floor: number; font: string; weight: number },
  text: string,
) {
  const { x, baseline, maxW, size: startSize, floor, font, weight } = opts
  const setFont = (s: number) => { ctx.font = `${weight} ${s}px ${font}` }

  const unitsFor = (raw: string): { units: string[]; joiner: string } => {
    const words = raw.split(/\s+/).filter(Boolean)
    if (words.length > 1) return { units: words, joiner: ' ' }
    // No spaces (common for Hindi designations) — split graphemes so we can wrap.
    if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
      const seg = new Intl.Segmenter('hi', { granularity: 'grapheme' })
      return { units: [...seg.segment(raw)].map((s) => s.segment), joiner: '' }
    }
    return { units: Array.from(raw), joiner: '' }
  }

  const fitLines = (raw: string, size: number, maxLines: number, allowEllipsis: boolean): string[] | null => {
    setFont(size)
    if (ctx.measureText(raw).width <= maxW) return [raw]

    const { units, joiner } = unitsFor(raw)
    const lines: string[] = []
    let current = ''
    for (let i = 0; i < units.length; i++) {
      const attempt = current ? `${current}${joiner}${units[i]}` : units[i]
      if (!current || ctx.measureText(attempt).width <= maxW) {
        current = attempt
        continue
      }
      if (lines.length >= maxLines - 1) {
        // Last line: take the rest
        const rest = [current, ...units.slice(i)].join(joiner)
        if (ctx.measureText(rest).width <= maxW) {
          lines.push(rest)
          return lines
        }
        if (!allowEllipsis) return null
        let t = rest
        while (t.length > 1 && ctx.measureText(`${t}…`).width > maxW) t = t.slice(0, -1)
        lines.push(`${t}…`)
        return lines
      }
      lines.push(current)
      current = units[i]
    }
    if (current) {
      if (ctx.measureText(current).width <= maxW) lines.push(current)
      else if (!allowEllipsis) return null
      else {
        let t = current
        while (t.length > 1 && ctx.measureText(`${t}…`).width > maxW) t = t.slice(0, -1)
        lines.push(`${t}…`)
      }
    }
    return lines
  }

  let size = startSize
  let lines: string[] | null = null
  while (size >= floor) {
    lines = fitLines(text, size, 3, false)
    if (lines) break
    size -= 2
  }
  if (!lines) {
    size = floor
    lines = fitLines(text, size, 3, true) ?? [text]
  }

  setFont(size)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  const lineH = size * 1.15
  const startY = baseline - ((lines.length - 1) * lineH) / 2
  lines.forEach((line, i) => ctx.fillText(line, x, startY + i * lineH))
}

async function drawQr(
  ctx: CanvasRenderingContext2D,
  payload: string,
  box: { x: number; y: number; w: number; h: number },
) {
  erase(ctx, box)
  if (!payload.trim()) return
  try {
    const dataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: Math.max(box.w, box.h) * 2,
      color: { dark: '#000000', light: '#ffffff' },
    })
    const qr = await loadCanvasImage(dataUrl)
    const pad = 2
    ctx.drawImage(qr, box.x + pad, box.y + pad, box.w - pad * 2, box.h - pad * 2)
    qr.close()
  } catch {
    /* leave blank slot */
  }
}

export type DistrictInchargeCardActions = {
  print: () => Promise<void>
  downloadPdf: () => Promise<void>
}

type Props = {
  values: DistrictInchargeCardForm
  photoUrl: string | null
  verificationUrl?: string | null
  onActionsReady?: (actions: DistrictInchargeCardActions) => void
}

export function DistrictInchargeCardOverlay({
  values,
  photoUrl,
  verificationUrl = null,
  onActionsReady,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // print/downloadPdf read canvasRef synchronously off of whatever's already
  // painted — this tracks the in-flight render() so they can await the real
  // paint (photo/template/seal/QR all loaded) instead of racing it.
  const renderPromiseRef = useRef<Promise<void> | null>(null)

  const render = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
    if (fonts) {
      try {
        await Promise.all([
          fonts.load(`600 ${G.name.size}px "Poppins"`),
          fonts.load(`600 ${G.name.size}px "Mukta"`),
          fonts.load(`600 ${G.name.size}px "Noto Sans Devanagari"`),
        ])
      } catch { /* ignore */ }
    }

    const [template, seal] = await Promise.all([loadTemplate(), loadSeal()])

    // Template artwork is already baked at 600dpi (print quality), so no extra
    // multiplier is needed here — doubling a canvas this size would blow past
    // Safari's canvas-area ceiling for no visual gain.
    const dpr = 1
    canvas.width = G.width * dpr
    canvas.height = G.height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.clearRect(0, 0, G.width, G.height)
    ctx.drawImage(template, 0, 0, G.width, G.height)

    // QR over the template "बारकोड" box — opens /verify/{code} details page
    await drawQr(ctx, buildDistrictQrPayload(verificationUrl), G.qr)

    // Front: photo + name
    ctx.fillStyle = '#ffffff'
    roundClip(ctx, G.photo.x, G.photo.y, G.photo.w, G.photo.h, G.photo.r)
    ctx.fill()
    if (photoUrl) {
      let photo: ImageBitmap | null = null
      try {
        photo = await loadCanvasImage(photoUrl)
        ctx.save()
        roundClip(ctx, G.photo.x, G.photo.y, G.photo.w, G.photo.h, G.photo.r)
        ctx.clip()
        cover(ctx, photo, G.photo.x, G.photo.y, G.photo.w, G.photo.h)
        ctx.restore()
        ctx.save()
        roundClip(ctx, G.photo.x, G.photo.y, G.photo.w, G.photo.h, G.photo.r)
        ctx.strokeStyle = 'rgba(0,0,0,0.25)'
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.restore()
      } catch { /* leave blank */ }
      finally {
        photo?.close()
      }
    }

    erase(ctx, G.name.erase)
    const name = values.fullName.trim()
    if (name) {
      ctx.fillStyle = G.name.color
      paintFitCentered(
        ctx,
        { cx: G.name.cx, baseline: G.name.baseline, maxW: G.name.erase.w - 20, size: G.name.size, floor: 50, font: NAME_FONT, weight: 600 },
        name,
      )
    }

    // Seal after name wipe — draw from high-res asset with high-quality scaling
    if (seal) {
      ctx.save()
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(
        seal,
        Math.round(G.seal.x),
        Math.round(G.seal.y),
        Math.round(G.seal.w),
        Math.round(G.seal.h),
      )
      ctx.restore()
    }

    // Keep "पदाधिकारी :-" from template; paint admin role on the right.
    // Shrinks + wraps (incl. no-space Hindi) so long titles stay inside the
    // ~6cm printed face instead of running into the card border.
    erase(ctx, G.designation.erase)
    const role = values.designation.trim()
    if (role) {
      ctx.save()
      ctx.beginPath()
      ctx.rect(
        G.designation.erase.x,
        G.designation.erase.y,
        G.designation.erase.w,
        G.designation.erase.h,
      )
      ctx.clip()
      ctx.fillStyle = G.designation.color
      paintFitWrapped(
        ctx,
        {
          x: G.designation.x,
          baseline: G.designation.baseline,
          maxW: G.designation.maxW,
          size: G.designation.size,
          floor: G.designation.floor,
          font: NAME_FONT,
          weight: 500,
        },
        role,
      )
      ctx.restore()
    }

    // Back: card no / dates — shrink font to fit box; `size` is a ceiling, not fixed.
    const paint = (
      field: { erase: { x: number; y: number; w: number; h: number }; x: number; baseline: number; size: number; color: string },
      text: string,
    ) => {
      erase(ctx, field.erase)
      if (!text) return
      ctx.fillStyle = field.color
      const maxW = field.erase.w - 6
      let size = field.size
      ctx.font = `700 ${size}px "Noto Sans", ${FONT}`
      while (size > 10 && ctx.measureText(text).width > maxW) {
        size -= 1
        ctx.font = `700 ${size}px "Noto Sans", ${FONT}`
      }
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, field.x, field.baseline, maxW)
    }

    paint(G.cardNumber, values.cardNumber.trim())
    paint(G.issueDate, formatCardDate(values.issueDate))
    paint(G.expiryDate, formatCardDate(values.expiryDate))
  }, [photoUrl, values, verificationUrl])

  useEffect(() => {
    renderPromiseRef.current = render()
  }, [render])

  useEffect(() => {
    if (!onActionsReady) return
    onActionsReady({
      print: async () => {
        // Wait for the actual paint (photo/template/seal/QR) instead of
        // grabbing whatever half-drawn frame happens to be on the canvas —
        // this is what caused "downloads/prints before the photo loads".
        await renderPromiseRef.current
        const canvas = canvasRef.current
        if (!canvas) throw new Error('Card is not ready yet')
        const dataUrl = canvas.toDataURL('image/png')
        const win = window.open('', '_blank')
        if (!win) throw new Error('Popup blocked — allow popups to print')
        win.document.write(
          `<html><head><title>District ID Card</title>
          <style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#eee}
          img{max-width:100%;height:auto}</style></head>
          <body><img src="${dataUrl}" onload="setTimeout(()=>window.print(),200)"/></body></html>`,
        )
        win.document.close()
      },
      downloadPdf: async () => {
        await renderPromiseRef.current
        const canvas = canvasRef.current
        if (!canvas) throw new Error('Card is not ready yet')
        const slug = (values.fullName || 'district-id').trim().replace(/\s+/g, '-').slice(0, 40)
        const { jsPDF } = await import('jspdf')
        const doc = new jsPDF({
          orientation: PDF_WIDTH_MM >= PDF_HEIGHT_MM ? 'landscape' : 'portrait',
          unit: 'mm',
          format: [PDF_WIDTH_MM, PDF_HEIGHT_MM],
        })
        doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, PDF_WIDTH_MM, PDF_HEIGHT_MM)
        // No server here to set Content-Disposition, so a real "save the
        // file, don't navigate" download only has one route for a
        // client-built blob: an <a download> click. (This is the same thing
        // jsPDF's own doc.save() does internally — doing it ourselves adds
        // no crash-safety over that, it's just explicit about what runs.)
        const url = URL.createObjectURL(doc.output('blob'))
        const link = document.createElement('a')
        link.href = url
        link.download = `${values.cardNumber || 'ADWA-district'}-${slug || 'card'}.pdf`
        // Some in-app/mobile browsers silently ignore click() on an anchor
        // that isn't in the document — attach it first.
        document.body.appendChild(link)
        try {
          link.click()
        } finally {
          link.remove()
        }
        // Delayed revoke — an immediate one can race the browser actually
        // starting to read the blob.
        setTimeout(() => URL.revokeObjectURL(url), 30_000)
      },
    })
  }, [onActionsReady, values.fullName, values.cardNumber])

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <canvas
        ref={canvasRef}
        className="block w-full h-auto"
        style={{ aspectRatio: `${G.width} / ${G.height}` }}
      />
    </div>
  )
}
