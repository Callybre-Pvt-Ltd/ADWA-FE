import { useTeam } from '@/hooks/useTeam'
import { AvatarWithInitials } from '@/components/shared/AvatarWithInitials'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHero } from '@/components/shared/PageHero'
import { Users } from 'lucide-react'

export default function TeamPage() {
  const { data, isLoading, isError, refetch } = useTeam()

  return (
    <div className="bg-white">
      <PageHero title="Our Team" subtitle="National leadership dedicated to driver welfare" />
      <section className="section-padding">
        <div className="container-wide">
          <SectionHeading title="Leadership Team" subtitle="Experienced leaders across India" />
          {isLoading && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map((i) => <SkeletonCard key={i} />)}</div>}
          {isError && <ErrorState onRetry={() => refetch()} />}
          {!isLoading && !isError && !data?.length && <EmptyState icon={Users} title="No team members" />}
          {data && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((m) => (
                <div key={m.id} className="rounded-xl border border-neutral-200 p-6">
                  <AvatarWithInitials name={m.name} imageUrl={m.image} size="lg" />
                  <h3 className="mt-4 font-semibold text-neutral-900">{m.name}</h3>
                  <p className="text-sm text-royal-600">{m.role}</p>
                  {m.bio && <p className="mt-2 text-sm text-neutral-600">{m.bio}</p>}
                  {m.email && <p className="mt-2 text-xs text-neutral-500">{m.email}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
