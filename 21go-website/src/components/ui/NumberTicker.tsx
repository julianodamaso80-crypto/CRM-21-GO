'use client'
import { useEffect, useRef, useState } from 'react'
import { useInView, motion } from 'framer-motion'

interface Props {
  target: number
  suffix?: string
  prefix?: string
  duration?: number
  className?: string
}

export function NumberTicker({ target, suffix = '', prefix = '', duration = 2000, className }: Props) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const start = Date.now()
    const step = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [isInView, target, duration])

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
    >
      {prefix}{count}{suffix}
    </motion.span>
  )
}
