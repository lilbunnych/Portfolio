import { useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform, useVelocity, type MotionValue } from 'motion/react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { Shot } from '@/data'
import { Lightbox } from './Lightbox'

/*
 * 2D gallery strip on native horizontal scroll (snaps, works with touch, trackpad and keyboard).
 * The effect: cards lean with the scroll speed like a flipped deck, and each photo slides
 * inside its frame in parallax with its position on screen.
 */

function Card({ shot, index, container, skew, onOpen }: { shot: Shot; index: number; container: React.RefObject<HTMLDivElement | null>; skew: MotionValue<number>; onOpen: (i: number) => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  const reduce = useReducedMotion()
  const { scrollXProgress } = useScroll({ container, target: ref, axis: 'x', offset: ['start end', 'end start'] })
  const x = useTransform(scrollXProgress, [0, 1], reduce ? ['0%', '0%'] : ['-14%', '14%'])
  const scale = useTransform(scrollXProgress, [0, 0.5, 1], reduce ? [1, 1, 1] : [0.9, 1, 0.9])
  return (
    <motion.button
      ref={ref}
      onClick={() => onOpen(index)}
      style={{ skewX: skew, scale }}
      className="group relative aspect-[3/4] w-[72vw] shrink-0 snap-start overflow-hidden rounded-[28px] bg-mint text-left sm:w-[42vw] md:w-[30vw] lg:w-[22vw]"
      aria-label={`${shot.title}, ${shot.tag}. Открыть крупно`}
    >
      <motion.img
        src={shot.src} alt="" loading="lazy" draggable={false} style={{ x }}
        className="absolute inset-y-0 -left-[15%] h-full w-[130%] max-w-none object-cover transition-[filter] duration-500 group-hover:saturate-[1.15]"
      />
      <span className="absolute inset-x-3 bottom-3 translate-y-2 rounded-[20px] bg-background/90 px-4 py-3 opacity-90 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
        <span className="block font-mono text-[.65rem] uppercase tracking-widest text-muted">{shot.tag}</span>
        <span className="block font-display text-sm font-bold uppercase">{shot.title}</span>
      </span>
    </motion.button>
  )
}

export function Gallery2D({ items }: { items: Shot[] }) {
  const strip = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [lightbox, setLightbox] = useState<number | null>(null)
  const { scrollX } = useScroll({ container: strip })
  const velocity = useVelocity(scrollX)
  const smooth = useSpring(velocity, { stiffness: 300, damping: 40 })
  const skew = useTransform(smooth, [-2400, 0, 2400], reduce ? [0, 0, 0] : [9, 0, -9], { clamp: true })

  const nudge = (dir: 1 | -1) => {
    const el = strip.current
    if (!el) return
    const card = el.querySelector('button')
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 300) + 12), behavior: 'smooth' })
  }

  return (
    <div>
      <div
        ref={strip}
        role="region"
        aria-label="Работы мастеров"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'ArrowRight') nudge(1); if (e.key === 'ArrowLeft') nudge(-1) }}
        className="no-scrollbar flex snap-x snap-mandatory scroll-px-4 items-center gap-3 overflow-x-auto overscroll-x-contain px-4 py-6 md:scroll-px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] md:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]"
      >
        {items.map((s, i) => <Card key={s.src} shot={s} index={i} container={strip} skew={skew} onOpen={setLightbox} />)}
      </div>
      <div className="mx-auto mt-2 flex max-w-7xl items-center justify-end gap-2 px-4 md:px-6">
        <button onClick={() => nudge(-1)} aria-label="Предыдущая работа" className="glass grid h-12 w-12 place-items-center rounded-full transition-colors hover:bg-foreground hover:text-background"><ArrowLeft className="h-5 w-5" /></button>
        <button onClick={() => nudge(1)} aria-label="Следующая работа" className="glass grid h-12 w-12 place-items-center rounded-full transition-colors hover:bg-foreground hover:text-background"><ArrowRight className="h-5 w-5" /></button>
      </div>
      <AnimatePresence>
        {lightbox !== null && <Lightbox items={items} index={lightbox} onIndex={setLightbox} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
    </div>
  )
}
