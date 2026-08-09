import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Images } from 'lucide-react'
import { GALLERY_IMAGES } from '@/constants/gallery'

export default function GalleryPage() {
  const { i18n } = useTranslation('nav')
  const isHi = i18n.language === 'hi'
  const [active, setActive] = useState<string | null>(null)

  const images = useMemo(() => GALLERY_IMAGES, [])

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
              ? 'जल्द ही यहाँ संगठन की तस्वीरें जोड़ी जाएँगी।'
              : 'Photos from association events will appear here soon.'}
          </p>
        </div>

        {images.length === 0 ? (
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
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((img) => (
              <button
                key={img.src}
                type="button"
                className="group overflow-hidden rounded-2xl bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                onClick={() => setActive(img.src)}
              >
                <img
                  src={img.src}
                  alt={isHi ? (img.altHi ?? img.altEn) : img.altEn}
                  width={img.width ?? 800}
                  height={img.height ?? 600}
                  loading="lazy"
                  decoding="async"
                  className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                {(img.captionEn || img.captionHi) && (
                  <p className="px-3 py-2 text-left text-sm text-neutral-700 bg-white">
                    {isHi ? (img.captionHi ?? img.captionEn) : img.captionEn}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      {active && (
        <button
          type="button"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 cursor-zoom-out"
          onClick={() => setActive(null)}
          aria-label={isHi ? 'बंद करें' : 'Close'}
        >
          <img
            src={active}
            alt=""
            className="max-h-[90vh] max-w-[95vw] rounded-lg object-contain"
          />
        </button>
      )}
    </div>
  )
}
