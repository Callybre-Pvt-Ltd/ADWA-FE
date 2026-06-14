import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Star, Quote } from 'lucide-react'
import { homeService } from '@/services'

export function TestimonialsSection() {
  const { t } = useTranslation('home')
  const { data: testimonials } = useQuery({
    queryKey: ['testimonials'],
    queryFn: homeService.getTestimonials,
    staleTime: 1000 * 60 * 10,
  })

  const list = testimonials ?? []

  // Split: first testimonial is featured, rest in grid
  const [featured, ...rest] = list

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-white via-blue-50/40 to-white">
      <div className="container-wide">
        <div className="text-center mb-14">
          <p className="text-[#0F4C81] text-sm font-semibold uppercase tracking-widest mb-2">{t('testimonials.eyebrow')}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">{t('testimonials.title')}</h2>
          <p className="text-neutral-500 max-w-xl mx-auto">{t('testimonials.subtitle')}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Featured large card */}
          {featured && (
            <div className="lg:col-span-1 bg-[#0F4C81] rounded-3xl p-7 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-4 right-4 opacity-10">
                <Quote size={80} className="text-white" />
              </div>

              <div>
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: featured.rating }).map((_, i) => (
                    <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-blue-100 text-base leading-relaxed font-medium relative z-10">
                  "{featured.content}"
                </p>
              </div>

              <div className="flex items-center gap-3 mt-7 pt-5 border-t border-white/20">
                <img
                  src={featured.avatar}
                  alt={featured.name}
                  className="w-11 h-11 rounded-xl border-2 border-white/30"
                  loading="lazy"
                />
                <div>
                  <div className="text-white font-semibold text-sm">{featured.name}</div>
                  <div className="text-blue-300 text-sm">{featured.role} · {featured.state}</div>
                </div>
              </div>
            </div>
          )}

          {/* Right column: 2-col grid of rest */}
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-5">
            {rest.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="bg-neutral-50 rounded-3xl p-5 border border-neutral-100 hover:border-blue-100 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-[15px] text-neutral-600 leading-relaxed">"{item.content}"</p>
                </div>
                <div className="flex items-center gap-2.5 mt-4 pt-4 border-t border-neutral-100">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-8 h-8 rounded-lg"
                    loading="lazy"
                  />
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">{item.name}</div>
                    <div className="text-[10px] text-neutral-400">{item.role} · {item.state}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom trust bar */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-neutral-100">
          {[
            { label: t('testimonials.avgRating'), value: t('testimonials.avgRatingValue') },
            { label: t('testimonials.reviews'), value: t('testimonials.reviewsValue') },
            { label: t('testimonials.satisfied'), value: t('testimonials.satisfiedValue') },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-extrabold text-neutral-900">{value}</div>
              <div className="text-sm text-neutral-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
