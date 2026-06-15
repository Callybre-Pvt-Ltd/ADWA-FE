import { motion } from 'framer-motion'
import { fadeInUp } from '@/utils/animations'

export interface PageHeroProps {
  title: string
  subtitle?: string
  className?: string
}

export function PageHero({ title, subtitle, className }: PageHeroProps) {
  return (
    <div className={`relative overflow-hidden border-b border-neutral-300 bg-white py-10 md:py-12 ${className ?? ''}`}>
      <div className="accent-bar absolute inset-x-0 top-0" aria-hidden="true" />
      <motion.div {...fadeInUp} className="container-wide relative text-center">
        <h1 className="text-2xl md:text-4xl font-bold text-blue-900">{title}</h1>
        {subtitle && <p className="mt-3 text-base text-neutral-700 max-w-2xl mx-auto">{subtitle}</p>}
      </motion.div>
    </div>
  )
}
