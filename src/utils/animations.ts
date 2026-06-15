export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.35, ease: 'easeOut' as const },
}

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
}

export const slideInRight = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 24 },
  transition: { duration: 0.3, ease: 'easeOut' as const },
}

export const popIn = {
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1 },
  transition: { type: 'spring' as const, stiffness: 260, damping: 20 },
}

export const float = {
  animate: {
    y: [0, -8, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const },
  },
}

export const wiggle = {
  animate: {
    rotate: [0, -3, 3, -2, 2, 0],
    transition: { duration: 0.5, ease: 'easeInOut' as const },
  },
}

export const pulseGlow = {
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(29, 78, 216, 0.4)',
      '0 0 0 12px rgba(29, 78, 216, 0)',
    ],
    transition: { duration: 1.8, repeat: Infinity },
  },
}

export const slideInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4, ease: 'easeOut' as const },
}
