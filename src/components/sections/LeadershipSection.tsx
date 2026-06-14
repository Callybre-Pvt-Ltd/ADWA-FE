import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { homeService } from '@/services'
import { Spinner } from '@/components/common/Spinner'

export function LeadershipSection() {
  const { t } = useTranslation('home')
  const { data: members, isLoading } = useQuery({
    queryKey: ['leadership'],
    queryFn: homeService.getLeadership,
    staleTime: 1000 * 60 * 10,
  })

  const ROLE_COLORS: Record<string, string> = {
    'National President': '#0F4C81',
    'Vice President': '#16A34A',
    'General Secretary': '#D97706',
    'Joint Secretary': '#7C3AED',
    'Treasurer': '#DC2626',
    'Welfare Director': '#0891B2',
    'Operations Head': '#059669',
    'State Coordinator': '#9333EA',
    'Digital Director': '#F59E0B',
  }

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      <div className="container-wide">
        <div className="text-center mb-14">
          <p className="text-[#0F4C81] text-sm font-semibold uppercase tracking-widest mb-2">{t('leadership.eyebrow')}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">{t('leadership.title')}</h2>
          <p className="text-neutral-500 max-w-xl mx-auto">{t('leadership.subtitle')}</p>
        </div>

        {isLoading ? <Spinner /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(members ?? []).map((member, i) => {
              const accentColor = ROLE_COLORS[member.designation] ?? '#0F4C81'
              const isFirst = i === 0

              return (
                <div
                  key={member.id}
                  className={`group relative rounded-3xl overflow-hidden border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                    isFirst
                      ? 'bg-[#0F4C81] border-transparent'
                      : 'bg-white border-neutral-100'
                  }`}
                >
                  {/* Top accent bar */}
                  {!isFirst && (
                    <div
                      className="h-1 w-full"
                      style={{ background: accentColor }}
                    />
                  )}

                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-14 h-14 rounded-2xl object-cover"
                          loading="lazy"
                        />
                        {isFirst && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#16A34A] rounded-full border-2 border-[#0F4C81] flex items-center justify-center">
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                              <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className={`font-bold text-base leading-tight ${isFirst ? 'text-white' : 'text-neutral-900'}`}>
                          {member.name}
                        </h3>
                        <div
                          className="text-xs font-semibold mt-1 uppercase tracking-wider"
                          style={{ color: isFirst ? 'rgba(255,255,255,0.7)' : accentColor }}
                        >
                          {member.designation}
                        </div>
                      </div>
                    </div>
                    <p className={`text-[15px] leading-relaxed ${isFirst ? 'text-blue-200' : 'text-neutral-500'}`}>
                      {member.bio}
                    </p>
                  </div>

                  {isFirst && (
                    <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
