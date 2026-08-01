import { useEffect, useState } from 'react'
import { CheckCircle, Copy, Download, ExternalLink, Loader2, QrCode } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cardsService } from '@/services/api/cards.service'
import { useCardQrBlob } from '@/hooks/useCards'
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
  const { data: qrSrc, isLoading: isLoadingQr } = useCardQrBlob(cardId)
  const [url, setUrl] = useState(
    verificationUrl ? normalizeVerifyUrl(verificationUrl, verificationCode) : '',
  )
  const [isLoadingUrl, setIsLoadingUrl] = useState(!verificationUrl && !verificationCode)

  useEffect(() => {
    let cancelled = false

    async function loadUrl() {
      if (verificationUrl) {
        setUrl(normalizeVerifyUrl(verificationUrl, verificationCode))
        setIsLoadingUrl(false)
      } else if (verificationCode) {
        setUrl(normalizeVerifyUrl('', verificationCode))
        setIsLoadingUrl(false)
      } else {
        try {
          setIsLoadingUrl(true)
          const info = await cardsService.getVerifyUrl(cardId)
          if (!cancelled) {
            setUrl(normalizeVerifyUrl(info.verificationUrl, info.verificationCode))
          }
        } catch {
          if (!cancelled) toast.error('Could not load verify URL')
        } finally {
          if (!cancelled) setIsLoadingUrl(false)
        }
      }
    }

    void loadUrl()
    return () => {
      cancelled = true
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

  const loading = isLoadingQr || isLoadingUrl

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
            <div className="h-44 w-44 bg-neutral-50 rounded-lg flex flex-col items-center justify-center gap-2 text-neutral-500 border border-neutral-100">
              <Loader2 className="h-7 w-7 animate-spin text-green-700" />
              <span className="text-xs font-medium text-neutral-600">Loading QR...</span>
            </div>
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
