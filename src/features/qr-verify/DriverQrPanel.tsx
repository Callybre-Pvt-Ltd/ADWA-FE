import { useEffect, useState } from 'react'
import { CheckCircle, Copy, Download, ExternalLink, QrCode } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cardsService } from '@/services/api/cards.service'
import { normalizeVerifyUrl } from '@/utils/verifyUrl'
import { cn } from '@/utils/cn'

type DriverQrPanelProps = {
  cardId: string
  verificationUrl?: string
  verificationCode?: string
  driverName?: string
  className?: string
}

export function DriverQrPanel({
  cardId,
  verificationUrl,
  verificationCode,
  driverName,
  className,
}: DriverQrPanelProps) {
  const [qrSrc, setQrSrc] = useState<string | null>(null)
  const [url, setUrl] = useState(
    verificationUrl ? normalizeVerifyUrl(verificationUrl, verificationCode) : '',
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let objectUrl: string | null = null
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        if (!verificationUrl) {
          const info = await cardsService.getVerifyUrl(cardId)
          if (!cancelled) {
            setUrl(normalizeVerifyUrl(info.verificationUrl, info.verificationCode))
          }
        }
        const blob = await cardsService.getQrBlob(cardId)
        objectUrl = URL.createObjectURL(blob)
        if (!cancelled) setQrSrc(objectUrl)
      } catch {
        if (!cancelled) toast.error('Could not load QR code')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [cardId, verificationUrl, verificationCode])

  const copyLink = async () => {
    if (!url) return
    await navigator.clipboard.writeText(url)
    toast.success('Verification link copied')
  }

  const downloadQr = () => {
    if (!qrSrc) return
    const a = document.createElement('a')
    a.href = qrSrc
    a.download = `adwa-qr-${verificationCode ?? cardId}.png`
    a.click()
  }

  return (
    <div className={cn('rounded-xl border border-neutral-200 bg-neutral-50 p-4', className)}>
      <div className="flex items-center gap-2 mb-3">
        <QrCode className="h-5 w-5 text-green-800" />
        <h3 className="font-semibold text-neutral-900">Driver QR code</h3>
      </div>
      {driverName && (
        <p className="text-sm text-neutral-600 mb-3">
          Scan to open the public verification page for <strong>{driverName}</strong>.
        </p>
      )}

      <div className="flex flex-col items-center gap-3">
        <div className="rounded-xl bg-white p-3 border border-neutral-200 shadow-sm">
          {loading ? (
            <div className="h-44 w-44 animate-pulse bg-neutral-100 rounded-lg" />
          ) : qrSrc ? (
            <img src={qrSrc} alt="Driver verification QR code" className="h-44 w-44" />
          ) : (
            <div className="h-44 w-44 flex items-center justify-center text-xs text-neutral-400">
              QR unavailable
            </div>
          )}
        </div>

        {url && (
          <p className="text-xs text-neutral-500 break-all text-center max-w-full px-2">{url}</p>
        )}

        <div className="flex flex-wrap gap-2 justify-center w-full">
          <Button type="button" variant="outline" size="sm" onClick={copyLink} disabled={!url}>
            <Copy className="h-4 w-4" /> Copy link
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={downloadQr} disabled={!qrSrc}>
            <Download className="h-4 w-4" /> Download QR
          </Button>
          {url && (
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" /> Open page
              </a>
            </Button>
          )}
        </div>

        <p className="text-[11px] text-neutral-400 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Anyone scanning this QR sees verified driver details on the public website.
        </p>
      </div>
    </div>
  )
}
