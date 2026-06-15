import { cn } from '@/utils/cn'
import { getInitials } from '@/utils/formatters'

export interface AvatarWithInitialsProps {
  name: string
  imageUrl?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  testId?: string
}

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-base',
}

export function AvatarWithInitials({
  name,
  imageUrl,
  size = 'md',
  className,
  testId,
}: AvatarWithInitialsProps) {
  return (
    <div
      data-testid={testId}
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy-700 font-semibold text-white',
        sizes[size],
        className,
      )}
      aria-label={name}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </div>
  )
}
