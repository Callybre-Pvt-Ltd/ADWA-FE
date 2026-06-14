import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-16', className)}>
      <div className="w-8 h-8 border-2 border-neutral-200 border-t-[#0F4C81] rounded-full animate-spin" />
    </div>
  )
}
