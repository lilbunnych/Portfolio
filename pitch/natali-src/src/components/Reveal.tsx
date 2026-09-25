import { motion } from 'motion/react'
import type { ReactNode } from 'react'

/** Fades content up once it scrolls into view. */
export function Reveal({ children, delay = 0, className, as = 'div', noDrag }: { children: ReactNode; delay?: number; className?: string; as?: 'div' | 'li' | 'figure' | 'article'; noDrag?: boolean }) {
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      data-no-drag={noDrag || undefined}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 1, ease: [.16, 1, .3, 1], delay: delay / 1000 }}
    >
      {children}
    </Tag>
  )
}
