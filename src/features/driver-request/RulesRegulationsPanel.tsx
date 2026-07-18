import { useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Shield, FileText, RefreshCw, Lock, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'

function RuleList({ items }: { items: string[] }) {
  return (
    <ol className="list-decimal space-y-3.5 pl-5 text-base leading-relaxed text-neutral-800 marker:font-black marker:text-blue-900 text-left">
      {items.map((rule, i) => (
        <li key={i} className="pl-1">{rule}</li>
      ))}
    </ol>
  )
}

interface RuleCardProps {
  icon: typeof Shield
  title: string
  children: ReactNode
  variant?: 'default' | 'warning' | 'info'
}

function RuleCard({
  icon: Icon,
  title,
  children,
  variant = 'default',
}: RuleCardProps) {
  const styles = {
    default: 'border-neutral-200 bg-white shadow-xs',
    warning: 'border-amber-200 bg-amber-50/30 shadow-xs',
    info: 'border-blue-150 bg-blue-50/20 shadow-xs',
  }
  const iconStyles = {
    default: 'bg-blue-900 text-white shadow-sm',
    warning: 'bg-amber-600 text-white shadow-sm',
    info: 'bg-blue-800 text-white shadow-sm',
  }

  return (
    <div className={cn(
      'rounded-2xl border p-6 md:p-8 flex flex-col justify-between transition-all duration-300 min-h-[340px] md:min-h-[290px]',
      styles[variant]
    )}>
      <div>
        <div className="flex items-center gap-3.5 border-b border-neutral-100 pb-4 mb-5">
          <div className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            iconStyles[variant]
          )}>
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-black text-neutral-900 tracking-tight">{title}</h3>
        </div>
        <div className="min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 40 : -40,
    opacity: 0
  })
}

export function RulesRegulationsPanel() {
  const { t } = useTranslation('pages')
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  const safety = t('rules.safety', { returnObjects: true }) as string[]
  const membership = t('rules.membership', { returnObjects: true }) as string[]
  const renewal = t('rules.renewal', { returnObjects: true }) as string[]
  const privacy = t('rules.privacy', { returnObjects: true }) as string[]

  const cards = [
    {
      id: 0,
      icon: Shield,
      title: t('rules.safetyTitle'),
      items: safety,
      variant: 'warning' as const,
    },
    {
      id: 1,
      icon: FileText,
      title: t('rules.membershipTitle'),
      items: membership,
      variant: 'info' as const,
    },
    {
      id: 2,
      icon: RefreshCw,
      title: t('rules.renewalTitle'),
      items: renewal,
      variant: 'default' as const,
    },
    {
      id: 3,
      icon: Lock,
      title: t('rules.privacyTitle'),
      items: privacy,
      variant: 'default' as const,
    },
  ]

  const handlePrev = () => {
    if (activeIndex > 0) {
      setDirection(-1)
      setActiveIndex((prev) => prev - 1)
    }
  }

  const handleNext = () => {
    if (activeIndex < cards.length - 1) {
      setDirection(1)
      setActiveIndex((prev) => prev + 1)
    }
  }

  const handleDotClick = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1)
    setActiveIndex(index)
  }

  const activeCard = cards[activeIndex]

  return (
    <section id="rules-regulations" className="mt-8 scroll-mt-28">
      <div className="surface-card p-6 md:p-8 rounded-3xl border-2 border-neutral-200">
        
        {/* Header */}
        <div className="flex items-start gap-4 border-b border-neutral-100 pb-5 mb-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-md shadow-orange-200">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight">{t('rules.title')}</h2>
            <p className="mt-1 text-sm text-neutral-500">{t('rules.subtitle')}</p>
          </div>
        </div>

        {/* Carousel Area */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: 'easeInOut' }}
            >
              <RuleCard 
                icon={activeCard.icon} 
                title={activeCard.title} 
                variant={activeCard.variant}
              >
                <RuleList items={activeCard.items} />
              </RuleCard>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slider Controls */}
        <div className="flex items-center justify-between border-t border-neutral-100 pt-5 mt-6">
          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition-all hover:bg-neutral-50 active:scale-95 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            )}
            aria-label="Previous Guideline"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Indicator Dots */}
          <div className="flex items-center gap-2.5">
            {cards.map((card, idx) => (
              <button
                key={card.id}
                onClick={() => handleDotClick(idx)}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-300 cursor-pointer",
                  idx === activeIndex 
                    ? "w-7 bg-blue-900 shadow-sm" 
                    : "w-2.5 bg-neutral-200 hover:bg-neutral-350"
                )}
                aria-label={`Go to page ${idx + 1}`}
              />
            ))}
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={handleNext}
            disabled={activeIndex === cards.length - 1}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition-all hover:bg-neutral-50 active:scale-95 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            )}
            aria-label="Next Guideline"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

      </div>
    </section>
  )
}
