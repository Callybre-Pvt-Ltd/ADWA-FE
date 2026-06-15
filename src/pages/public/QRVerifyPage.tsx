import { useParams } from 'react-router-dom'
import { useVerifyDriver } from '@/hooks/useDrivers'
import { PageHero } from '@/components/shared/PageHero'
import VerificationResult from '@/features/qr-verify/VerificationResult'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { ErrorState } from '@/components/shared/ErrorState'

export default function QRVerifyPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError, refetch } = useVerifyDriver(id ?? '')

  return (
    <div className="bg-white min-h-[60vh]">
      <PageHero title="Verify Driver ID" subtitle={`Card ID: ${id ?? '—'}`} />
      <section className="section-padding">
        <div className="container-wide max-w-xl">
          {isLoading && <SkeletonCard />}
          {isError && <ErrorState message="Verification failed" onRetry={() => refetch()} />}
          {data && <VerificationResult result={data} />}
        </div>
      </section>
    </div>
  )
}
