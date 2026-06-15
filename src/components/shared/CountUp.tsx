import { useEffect, useState } from 'react'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

interface CountUpProps {
  end: number
  suffix?: string
  duration?: number
  className?: string
  format?: 'indian' | 'plain'
}

function formatIndian(n: number): string {
  return n.toLocaleString('en-IN')
}

export function CountUp({ end, suffix = '', duration = 1.5, className, format = 'indian' }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = end / (duration * 60)
    const timer = setInterval(() => {
      start += step
      if (start >= end) {
        setValue(end)
        clearInterval(timer)
      } else {
        setValue(Math.floor(start))
      }
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [inView, end, duration])

  const display = format === 'indian' ? formatIndian(value) : String(value)

  return (
    <span ref={ref} className={className}>
      {display}{suffix}
    </span>
  )
}
