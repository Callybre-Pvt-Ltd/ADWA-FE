import { cn } from '@/utils/cn'

interface IDCardPreviewProps {
  imageUrl?: string | null
  loading?: boolean
  className?: string
}

/** Shows the real generated card image from the backend template (no layout changes). */
export default function IDCardPreview({ imageUrl, loading, className }: IDCardPreviewProps) {
  return (
    <div className={cn('mx-auto w-full max-w-md', className)}>
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 shadow-sm">
        {loading ? (
          <div className="aspect-[1600/1235] animate-pulse bg-neutral-200" />
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="ADWA driver ID card preview"
            className="w-full h-auto block"
          />
        ) : (
          <div className="aspect-[1600/1235] flex items-center justify-center text-sm text-neutral-400 p-6 text-center">
            Select a driver and update fields to preview the ID card
          </div>
        )}
      </div>
    </div>
  )
}
