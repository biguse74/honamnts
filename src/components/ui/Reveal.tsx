import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  /** 등장 지연(초) */
  delay?: number
  /** 위로 떠오르는 거리(px) */
  y?: number
  className?: string
}

/**
 * 스크롤하여 뷰포트에 들어올 때 한 번 부드럽게 등장시키는 래퍼.
 * 절제된 모션 — 짧은 거리, 한 번만(once).
 */
export default function Reveal({ children, delay = 0, y = 24, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}
