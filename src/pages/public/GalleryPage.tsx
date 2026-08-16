import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { Images, Play, X, ChevronLeft, ChevronRight, Camera, Film } from 'lucide-react'
import { GALLERY_ITEMS, type GalleryItem } from '@/constants/gallery'
import { cn } from '@/utils/cn'

type Filter = 'all' | 'image' | 'video'

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.round(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function GalleryPage() {
  const { i18n } = useTranslation('nav')
  const isHi = i18n.language === 'hi'
  const [filter, setFilter] = useState<Filter>('all')
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const items = useMemo(() => GALLERY_ITEMS, [])
  const filtered = useMemo(
    () => (filter === 'all' ? items : items.filter((i) => i.kind === filter)),
    [items, filter],
  )
  const photoCount = useMemo(() => items.filter((i) => i.kind === 'image').length, [items])
  const videoCount = useMemo(() => items.filter((i) => i.kind === 'video').length, [items])

  const active: GalleryItem | null = activeIndex !== null ? filtered[activeIndex] : null

  const close = useCallback(() => setActiveIndex(null), [])
  const showPrev = useCallback(
    () => setActiveIndex((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length)),
    [filtered.length],
  )
  const showNext = useCallback(
    () => setActiveIndex((i) => (i === null ? null : (i + 1) % filtered.length)),
    [filtered.length],
  )

  useEffect(() => {
    if (activeIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') showPrev()
      if (e.key === 'ArrowRight') showNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeIndex, close, showPrev, showNext])

  const filters: { key: Filter; labelEn: string; labelHi: string; icon: typeof Images }[] = [
    { key: 'all', labelEn: `All (${items.length})`, labelHi: `सभी (${items.length})`, icon: Images },
    { key: 'image', labelEn: `Photos (${photoCount})`, labelHi: `तस्वीरें (${photoCount})`, icon: Camera },
    { key: 'video', labelEn: `Videos (${videoCount})`, labelHi: `वीडियो (${videoCount})`, icon: Film },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white">
      <section className="container-wide section-padding">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            {isHi ? 'गैलरी' : 'Gallery'}
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-neutral-900">
            {isHi ? 'कार्यक्रम और गतिविधियाँ' : 'Events & activities'}
          </h1>
          <p className="mt-3 text-neutral-600">
            {isHi
              ? 'संगठन के कार्यक्रमों की तस्वीरें और वीडियो।'
              : 'Photos and videos from association events.'}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 bg-white/70 px-6 py-16 text-center">
            <Images className="h-12 w-12 text-neutral-400" />
            <p className="mt-4 text-lg font-semibold text-neutral-800">
              {isHi ? 'गैलरी जल्द आ रही है' : 'Gallery coming soon'}
            </p>
            <p className="mt-2 max-w-md text-sm text-neutral-500">
              {isHi
                ? 'तस्वीरें उपलब्ध होने पर वे यहाँ WebP प्रारूप में तेज़ी से लोड होंगी।'
                : 'When images are provided, they will load here in fast WebP format.'}
            </p>
          </div>
        ) : (
          <>
            {/* Filter tabs */}
            <div className="mt-8 flex flex-wrap gap-2">
              {filters.map(({ key, labelEn, labelHi, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setFilter(key)
                    setActiveIndex(null)
                  }}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                    filter === key
                      ? 'border-blue-700 bg-blue-700 text-white shadow-sm'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-blue-200 hover:text-blue-700',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {isHi ? labelHi : labelEn}
                </button>
              ))}
            </div>

            {/* Uniform grid — fixed aspect tiles keep reading order left-to-right, top-to-bottom */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {filtered.map((item, idx) => (
                <motion.button
                  key={item.src}
                  type="button"
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ y: -3 }}
                  className="group relative aspect-[3/4] overflow-hidden rounded-xl sm:rounded-2xl bg-neutral-100 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  onClick={() => setActiveIndex(idx)}
                >
                  <img
                    src={item.kind === 'video' ? item.poster : item.src}
                    alt={isHi ? (item.altHi ?? item.altEn) : item.altEn}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {item.kind === 'video' && (
                    <>
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform duration-300 group-hover:scale-110">
                          <Play className="h-4 w-4 sm:h-5 sm:w-5 translate-x-0.5 text-blue-700" fill="currentColor" />
                        </span>
                      </span>
                      <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        {formatDuration(item.durationSec)}
                      </span>
                    </>
                  )}

                  {(item.captionEn || item.captionHi) && (
                    <p className="absolute inset-x-0 bottom-0 translate-y-full px-2.5 py-2 text-left text-xs text-white transition-transform duration-300 group-hover:translate-y-0">
                      {isHi ? (item.captionHi ?? item.captionEn) : item.captionEn}
                    </p>
                  )}
                </motion.button>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
            onClick={close}
          >
            <button
              type="button"
              onClick={close}
              aria-label={isHi ? 'बंद करें' : 'Close'}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="absolute left-4 top-4 z-10 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white">
              {(activeIndex ?? 0) + 1} / {filtered.length}
            </div>

            {filtered.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    showPrev()
                  }}
                  aria-label={isHi ? 'पिछला' : 'Previous'}
                  className="absolute left-2 sm:left-4 z-10 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    showNext()
                  }}
                  aria-label={isHi ? 'अगला' : 'Next'}
                  className="absolute right-2 sm:right-4 z-10 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <motion.div
              key={active.src}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
            >
              {active.kind === 'video' ? (
                <video
                  src={active.src}
                  poster={active.poster}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[85vh] max-w-[92vw] rounded-lg"
                />
              ) : (
                <img
                  src={active.src}
                  alt={isHi ? (active.altHi ?? active.altEn) : active.altEn}
                  className="max-h-[85vh] max-w-[92vw] rounded-lg object-contain"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
