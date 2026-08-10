import { useCallback, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import {
  G,
  buildDistrictQrPayload,
  formatCardDate,
  type DistrictInchargeCardForm,
} from './districtInchargeCardGeometry'

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

function loadBlobUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

function cover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number, dy: number, dw: number, dh: number,
) {
  const ir = img.naturalWidth / img.naturalHeight
  const tr = dw / dh
  let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight
  if (ir > tr) {
    sw = img.naturalHeight * tr
    sx = (img.naturalWidth - sw) / 2
  } else {
    sh = img.naturalWidth / tr
    sy = (img.naturalHeight - sh) * 0.3
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
    const qr = await loadBlobUrl(dataUrl)
    const pad = 2
    ctx.drawImage(qr, box.x + pad, box.y + pad, box.w - pad * 2, box.h - pad * 2)
  } catch {
    /* leave blank slot */
  }
}

export type DistrictInchargeCardActions = {
  print: () => void
  downloadPng: () => void
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

    // Render at 2× so the seal/text stay sharp on retina screens and when printed
    const dpr = 2
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
      try {
        const photo = await loadBlobUrl(photoUrl)
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
    }

    erase(ctx, G.name.erase)
    const name = values.fullName.trim()
    if (name) {
      ctx.fillStyle = G.name.color
      ctx.font = `600 ${G.name.size}px ${NAME_FONT}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'alphabetic'
      ctx.fillText(name, G.name.cx, G.name.baseline, 280)
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

    // Keep "पदाधिकारी :-" from template; paint admin role on the right
    erase(ctx, G.designation.erase)
    const role = values.designation.trim()
    if (role) {
      ctx.fillStyle = G.designation.color
      ctx.font = `500 ${G.designation.size}px ${NAME_FONT}`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
      ctx.fillText(role, G.designation.x, G.designation.baseline, G.designation.erase.w - 4)
    }

    // Back: card no / dates
    const paint = (
      field: { erase: { x: number; y: number; w: number; h: number }; x: number; baseline: number; size: number; color: string },
      text: string,
    ) => {
      erase(ctx, field.erase)
      if (!text) return
      ctx.fillStyle = field.color
      ctx.font = `700 ${field.size}px "Noto Sans", ${FONT}`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
      ctx.fillText(text, field.x, field.baseline, field.erase.w - 6)
    }

    paint(G.cardNumber, values.cardNumber.trim())
    paint(G.issueDate, formatCardDate(values.issueDate))
    paint(G.expiryDate, formatCardDate(values.expiryDate))
  }, [photoUrl, values, verificationUrl])

  useEffect(() => {
    void render()
  }, [render])

  useEffect(() => {
    if (!onActionsReady) return
    onActionsReady({
      print: () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const dataUrl = canvas.toDataURL('image/png')
        const win = window.open('', '_blank')
        if (!win) return
        win.document.write(
          `<html><head><title>District ID Card</title>
          <style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#eee}
          img{max-width:100%;height:auto}</style></head>
          <body><img src="${dataUrl}" onload="setTimeout(()=>window.print(),200)"/></body></html>`,
        )
        win.document.close()
      },
      downloadPng: () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const a = document.createElement('a')
        const slug = (values.fullName || 'district-id').trim().replace(/\s+/g, '-').slice(0, 40)
        a.href = canvas.toDataURL('image/png')
        a.download = `${values.cardNumber || 'ADWA-district'}-${slug || 'card'}.png`
        a.click()
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
