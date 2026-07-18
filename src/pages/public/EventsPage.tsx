import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { usePublicEvents } from '@/hooks/useEvents'
import EventCard from '@/features/events/EventCard'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { staggerContainer } from '@/utils/animations'

type Filter = 'all' | 'upcoming' | 'past'

const FILTERS: { value: Filter; label: string; icon: typeof Calendar }[] = [
  { value: 'all',      label: 'All Events',  icon: Calendar },
  { value: 'upcoming', label: 'Upcoming',    icon: Clock    },
  { value: 'past',     label: 'Past',        icon: MapPin   },
]

export default function EventsPage() {
  const { i18n } = useTranslation('home')
  const isHi = i18n.language === 'hi'
  const [filter, setFilter] = useState<Filter>('all')
  const { data, isLoading, isError, refetch } = usePublicEvents({ status: filter })

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* Hero */}
      <section className="hero-bg relative">
        <div className="container-wide relative z-10 py-16 md:py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm font-bold text-white backdrop-blur-sm mb-4">
            <Calendar className="h-4 w-4 text-orange-300" />
            {isHi ? 'एडवा कार्यक्रम' : 'ADWA Events'}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {isHi ? 'कार्यक्रम और आयोजन' : 'Events & Programmes'}
          </h1>
          <p className="mt-4 text-blue-100/90 text-base md:text-lg max-w-xl mx-auto">
            {isHi 
              ? 'भारत भर में एडवा (ADWA) द्वारा आयोजित शिखर सम्मेलन, जागरूकता अभियान, कार्यशालाएं और कल्याणकारी कार्यक्रम।'
              : 'Summits, awareness drives, workshops and welfare programmes organised by ADWA across India.'}
          </p>
        </div>
        <div className="relative z-10 leading-none" aria-hidden="true">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <path d="M0 40L60 33C120 27 240 13 360 10C480 7 600 13 720 17C840 20 960 20 1080 17C1200 13 1320 7 1380 3L1440 0V40H0Z" fill="#F8FAFC" />
          </svg>
        </div>
      </section>

      {/* Filter tabs + grid */}
      <section className="section-padding">
        <div className="container-wide">

          {/* Filter tabs */}
          <div className="flex items-center gap-2 mb-8 flex-wrap">
            {FILTERS.map(({ value, label, icon: Icon }) => {
              const displayLabel = isHi
                ? value === 'all' ? 'सभी कार्यक्रम' : value === 'upcoming' ? 'आगामी' : 'विगत'
                : label
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 text-sm font-semibold transition-all duration-150 ${
                    filter === value
                      ? 'border-orange-600 bg-orange-600 text-white shadow-md shadow-orange-100'
                      : 'border-neutral-300 bg-white text-neutral-700 hover:border-orange-400 hover:text-orange-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {displayLabel}
                </button>
              )
            })}
            {data && (
              <span className="ml-auto text-sm text-neutral-500 font-medium">
                {isHi ? `${data.length} कार्यक्रम` : `${data.length} event${data.length !== 1 ? 's' : ''}`}
              </span>
            )}
          </div>

          {/* States */}
          {isLoading && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {isError && <ErrorState onRetry={() => refetch()} />}

          {!isLoading && !isError && !data?.length && (
            <EmptyState
              icon={Calendar}
              title={isHi ? 'कोई कार्यक्रम नहीं मिला' : 'No events found'}
              description={
                isHi
                  ? filter === 'upcoming'
                    ? 'कोई आगामी कार्यक्रम निर्धारित नहीं है। जल्द ही दोबारा देखें।'
                    : 'इस श्रेणी में कोई कार्यक्रम नहीं है।'
                  : filter === 'upcoming'
                  ? 'No upcoming events scheduled. Check back soon.'
                  : 'No events in this category.'
              }
            />
          )}

          {data && data.length > 0 && (
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {data.map((e) => (
                <motion.div
                  key={e.id}
                  variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                >
                  <EventCard event={e} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}
