import { useParams } from 'react-router-dom'
import { useVerifyDriver } from '@/hooks/useDrivers'
import VerificationResult from '@/features/qr-verify/VerificationResult'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { ErrorState } from '@/components/shared/ErrorState'
import { QrCode } from 'lucide-react'

export default function QRVerifyPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError, refetch } = useVerifyDriver(id ?? '')

  return (
    <div className="min-h-[70vh] bg-neutral-50">
      <div className="bg-white border-b border-neutral-200">
        <div className="container-wide py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <QrCode className="h-5 w-5 text-green-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">Driver verification</h1>
              <p className="text-sm text-neutral-500">
                Official ADWA membership record — scan result
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="section-padding pt-6">
        <div className="container-wide max-w-lg mx-auto">
          {isLoading && <SkeletonCard />}
          {isError && <ErrorState message="Could not verify this QR code" onRetry={() => refetch()} />}
          {data && <VerificationResult result={data} />}
        </div>
      </section>
    </div>
  )
}
