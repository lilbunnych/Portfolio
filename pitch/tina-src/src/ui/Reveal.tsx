import { motion } from 'motion/react'
import type { ReactNode } from 'react'

/** Fades content up once it scrolls into view. */
export function Reveal({ children, delay = 0, className, as = 'div' }: { children: ReactNode; delay?: number; className?: string; as?: 'div' | 'li' | 'article' | 'figure' }) {
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: .9, ease: [.16, 1, .3, 1], delay: delay / 1000 }}
    >
      {children}
    </Tag>
  )
}

/** Section heading: mono eyebrow + serif title (+ optional side note). */
export function Heading({ eyebrow, title, note, dark }: { eyebrow: string; title: ReactNode; note?: string; dark?: boolean }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <Reveal><span className="eyebrow">{eyebrow}</span></Reveal>
        <Reveal delay={80}><h2 className={`h2 mt-4 ${dark ? 'text-cream' : ''}`}>{title}</h2></Reveal>
      </div>
      {note && <Reveal delay={160}><p className={`max-w-[26rem] ${dark ? 'text-cream/70' : 'text-muted-foreground'}`}>{note}</p></Reveal>}
    </div>
  )
}
