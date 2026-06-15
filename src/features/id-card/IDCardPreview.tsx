import { formatDate } from '@/utils/formatters'
import type { Driver } from '@/types/driver.types'
import { cn } from '@/utils/cn'

interface IDCardPreviewProps {
  driver: Driver
  className?: string
}

export default function IDCardPreview({ driver, className }: IDCardPreviewProps) {
  return (
    <div className={cn('mx-auto w-full max-w-sm', className)}>
      <div className="overflow-hidden rounded-xl border-2 border-navy-700 bg-gradient-to-br from-navy-700 to-royal-800 shadow-lg">
        <div className="px-4 py-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/80">ADWA Driver ID</p>
          <p className="text-sm font-bold text-white">All Drivers Welfare Association</p>
        </div>
        <div className="bg-white p-4">
          <div className="flex gap-4">
            <img src={driver.photoUrl} alt={driver.name} className="h-20 w-16 rounded-lg object-cover border border-neutral-200" />
            <div className="flex-1 space-y-1 text-xs">
              <p className="font-bold text-neutral-900">{driver.name}</p>
              <p className="text-neutral-600">ID: {driver.cardId ?? 'Pending'}</p>
              <p className="text-neutral-600">Blood: {driver.bloodGroup}</p>
              <p className="text-neutral-600">{driver.district}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-neutral-200 pt-3 text-xs">
            <div><span className="text-neutral-500">License</span><p className="font-medium">{driver.licenseNumber}</p></div>
            <div><span className="text-neutral-500">Valid Till</span><p className="font-medium">{driver.expiryDate ? formatDate(driver.expiryDate) : '—'}</p></div>
          </div>
        </div>
      </div>
    </div>
  )
}
