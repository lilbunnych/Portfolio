import { useEffect, useRef, useState, type ReactNode } from 'react'
import { animate, motion, useInView, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { cn } from '@/lib/utils'
import { typo } from '@/lib/typo'

const EASE = [0.16, 1, 0.3, 1] as const

const TAGS = { h1: motion.h1, h2: motion.h2, h3: motion.h3, p: motion.p }

/** Heading whose words rise out of a mask one after another when it scrolls into view. */
export function SplitReveal({ text, as = 'h2', className, delay = 0 }: { text: string; as?: keyof typeof TAGS; className?: string; delay?: number }) {
  const reduce = useReducedMotion()
  const Tag = TAGS[as]
  const words = typo(text).split(' ')
  // the heading itself is observed: the masked words are clipped, so IntersectionObserver never sees them
  return (
    <Tag className={className} aria-label={text} initial={reduce ? false : 'hidden'} whileInView="show" viewport={{ once: true, amount: 0.5 }}
      transition={{ staggerChildren: 0.07, delayChildren: delay }}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className="inline-block will-change-transform"
            variants={{ hidden: { y: '110%', rotate: 6, opacity: 0 }, show: { y: '0%', rotate: 0, opacity: 1, transition: { duration: 0.9, ease: EASE } } }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 && '\u00a0'}
        </span>
      ))}
    </Tag>
  )
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1])
  const y = useTransform(progress, range, [6, 0])
  return <motion.span style={{ opacity, y }} className="inline-block">{children}&nbsp;</motion.span>
}

/** Paragraph that lights up word by word as it is scrolled through. */
export function ScrollHighlight({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] })
  const words = typo(text).split(' ')
  if (reduce) return <p className={className}>{text}</p>
  return (
    <p ref={ref} className={cn('flex flex-wrap', className)} aria-label={text}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>{w}</Word>
      ))}
    </p>
  )
}

/** Number that counts up once it is on screen. Keeps the final value in the DOM for crawlers and screen readers. */
export function CountUp({ value, decimals = 0, className }: { value: number; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  const fmt = (n: number) => n.toLocaleString('ru-RU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  useEffect(() => {
    if (!inView || reduce || !ref.current) return
    const el = ref.current
    const c = animate(0, value, { duration: 1.6, ease: EASE, onUpdate: v => { el.textContent = fmt(v) } })
    return () => c.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, value])
  return <span ref={ref} className={className}>{fmt(value)}</span>
}

const GLYPHS = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ0123456789/+-'

/** Mono label that decodes from random glyphs when it appears. */
export function Scramble({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.8 })
  const reduce = useReducedMotion()
  const [out, setOut] = useState(text)
  useEffect(() => {
    if (!inView || reduce) return
    let frame = 0
    const total = 22
    const id = setInterval(() => {
      frame++
      const done = Math.floor((frame / total) * text.length)
      setOut(text.split('').map((ch, i) => (i < done || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join(''))
      if (frame >= total) { clearInterval(id); setOut(text) }
    }, 32)
    return () => clearInterval(id)
  }, [inView, reduce, text])
  return <span ref={ref} className={cn('font-mono', className)} aria-label={text}><span aria-hidden>{out}</span></span>
}

/** Block that fades and rises into place. */
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 32, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}
