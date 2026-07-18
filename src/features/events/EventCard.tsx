import { Calendar, MapPin, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDate } from '@/utils/formatters'
import { StatusBadge, statusToVariant } from '@/components/shared/StatusBadge'
import type { Event } from '@/types/event.types'
import { cn } from '@/utils/cn'

interface EventCardProps {
  event: Event
  onClick?: () => void
  className?: string
}

export default function EventCard({ event, onClick, className }: EventCardProps) {
  const isUpcoming = event.status === 'upcoming'

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border-2 border-neutral-200 bg-white shadow-sm',
        'transition-shadow duration-200 hover:shadow-lg hover:border-orange-200',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {/* Image or placeholder */}
      {event.imageUrl ? (
        <div className="relative h-44 overflow-hidden">
          <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-3 left-3">
            <StatusBadge variant={statusToVariant(event.status)} label={event.status} />
          </div>
        </div>
      ) : (
        <div className={cn(
          'h-44 flex items-center justify-center',
          isUpcoming ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 'bg-gradient-to-br from-neutral-400 to-neutral-600',
        )}>
          <Calendar className="h-12 w-12 text-white/40" />
          <div className="absolute top-3 right-3">
            <StatusBadge variant={statusToVariant(event.status)} label={event.status} />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {!event.imageUrl && (
          <div className="mb-2">
            <StatusBadge variant={statusToVariant(event.status)} label={event.status} />
          </div>
        )}

        <h3 className="text-base font-bold text-neutral-900 leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors">
          {event.title}
        </h3>
        <p className="mt-2 text-sm text-neutral-500 leading-relaxed line-clamp-3 flex-1">
          {event.description}
        </p>

        <div className="mt-4 flex flex-col gap-1.5 text-sm text-neutral-500 border-t border-neutral-100 pt-4">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-orange-500" />
            {formatDate(event.date)}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-orange-500" />
            {event.location}
          </span>
        </div>

        {onClick && (
          <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-orange-600 group-hover:gap-2 transition-all">
            View details <ArrowRight className="h-4 w-4" />
          </div>
        )}
      </div>
    </motion.article>
  )
}
