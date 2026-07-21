import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { QrCode, Search } from 'lucide-react'
import { useVerifyDriver } from '@/hooks/useDrivers'
import VerificationResult from '@/features/qr-verify/VerificationResult'
import { PageHero } from '@/components/shared/PageHero'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function QRVerifyPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation('pages')
  const [code, setCode] = useState('')
  const { data, isLoading, isFetching, isError, refetch } = useVerifyDriver(id ?? '')

  const submitCode = (event: FormEvent) => {
    event.preventDefault()
    const value = code.trim()
    if (!value) return

    const extractedCode = value.match(/\/verify\/([^/?#]+)/)?.[1] ?? value
    navigate(`/verify/${encodeURIComponent(extractedCode)}`)
  }

  return (
    <div className="bg-neutral-50 min-h-[70vh]">
      <PageHero
        title={t('verify.title')}
        subtitle={id ? t('verify.subtitleResult') : t('verify.subtitle')}
      />

      <section className="section-padding pt-6 md:pt-8">
        <div className="container-wide max-w-lg mx-auto space-y-5">
          {!id && (
            <form onSubmit={submitCode} className="surface-card p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50">
                  <QrCode className="h-5 w-5 text-blue-800" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">{t('verify.formTitle')}</h2>
                  <p className="mt-1 text-sm text-neutral-600 leading-relaxed">
                    {t('verify.formDescription')}
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="verification-code">{t('verify.codeLabel')}</Label>
                <Input
                  id="verification-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder={t('verify.codePlaceholder')}
                  className="mt-1.5"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              <Button type="submit" className="w-full" disabled={!code.trim()}>
                <Search className="h-4 w-4 mr-1.5" />
                {t('verify.submit')}
              </Button>
            </form>
          )}

          {id && isLoading && <SkeletonCard />}
          {id && isError && (
            <ErrorState message={t('verify.error')} onRetry={() => refetch()} loading={isFetching} />
          )}
          {id && data && <VerificationResult result={data} />}
        </div>
      </section>
    </div>
  )
}
