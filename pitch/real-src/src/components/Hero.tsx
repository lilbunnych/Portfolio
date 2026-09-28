import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowDownRight, Star } from 'lucide-react'
import { BRAND } from '@/data'
import { booking } from '@/store'
import { cn } from '@/lib/utils'

// three.js is the heaviest chunk: load it after the page shell has painted
const RazorScene = lazy(() => import('@/three/RazorScene').then(m => ({ default: m.RazorScene })))

const EASE = [0.16, 1, 0.3, 1] as const

/** Open / closed right now, in Moscow time, refreshed every minute. */
export function useOpenStatus() {
  const calc = () => {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Moscow' }))
    const h = now.getHours() + now.getMinutes() / 60
    const open = h >= BRAND.open && h < BRAND.close
    return { open, label: open ? `Открыто до ${BRAND.close}:00` : `Закрыто, откроемся в ${BRAND.open}:00` }
  }
  const [s, setS] = useState(calc)
  useEffect(() => { const id = setInterval(() => setS(calc()), 60_000); return () => clearInterval(id) }, [])
  return s
}

/** A price tag slapped onto the poster at an angle. */
function Sticker({ className, rotate, delay, children }: { className?: string; rotate: number; delay: number; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 1.4, rotate: rotate - 12 }} animate={{ opacity: 1, scale: 1, rotate }} transition={{ delay, type: 'spring', stiffness: 260, damping: 16 }}
      className={cn('absolute z-20 rounded-2xl px-4 py-3 shadow-[0_18px_40px_-18px_rgb(17_16_16/.55)]', className)}>
      {children}
    </motion.div>
  )
}

const TICKER = ['Модельная от 700 ₽', 'Детская 600 ₽', 'Стрижка + борода 1 200 ₽', 'Королевское бритьё 800 ₽', 'Массаж и фитобочка', 'Рисунок на волосах от 100 ₽']

export function Hero() {
  const host = useRef<HTMLElement>(null)
  const anchor = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const status = useOpenStatus()

  return (
    <section ref={host} className="relative isolate flex min-h-[100svh] w-full flex-col overflow-hidden">
      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pt-24 md:px-6 md:pt-28">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs uppercase tracking-[.18em] text-muted">
          <span>Барбершоп</span><span className="h-1 w-1 rounded-full bg-red" /><span>Новокуркино, Химки</span>
          <span className="h-1 w-1 rounded-full bg-red" />
          <span className="flex items-center gap-2"><span className={status.open ? 'live-dot h-2 w-2 rounded-full bg-red' : 'h-2 w-2 rounded-full bg-foreground/30'} aria-hidden />{status.label}</span>
        </motion.p>

        {/* the poster: giant wordmark, the razor cuts across it */}
        <div ref={stage} className="relative mt-4 flex min-h-[46svh] flex-1 items-center">
          <motion.p aria-hidden initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 1, ease: EASE }}
            className="w-full select-none text-center font-display text-[clamp(6.5rem,27vw,23rem)] leading-[.8] tracking-[-0.04em] text-red">
            REAL
          </motion.p>
          <div ref={anchor} aria-hidden className="absolute left-[8%] right-[8%] top-1/2 h-24 -translate-y-1/2 md:left-[14%] md:right-[14%]" />
          <div className="absolute inset-0 z-10"><Suspense fallback={null}><RazorScene anchor={anchor} host={stage} /></Suspense></div>

          <Sticker rotate={-8} delay={1.4} className="left-0 top-[4%] bg-foreground text-background md:left-[2%]">
            <p className="font-mono text-[.6rem] uppercase tracking-[.2em] opacity-70">Модельная</p>
            <p className="font-display text-2xl leading-none md:text-3xl">от 700 ₽</p>
          </Sticker>
          <Sticker rotate={6} delay={1.6} className="bottom-[6%] right-0 bg-accent text-white md:right-[3%]">
            <p className="font-mono text-[.6rem] uppercase tracking-[.2em] opacity-80">Детская</p>
            <p className="font-display text-2xl leading-none md:text-3xl">600 ₽</p>
          </Sticker>
          <Sticker rotate={-4} delay={1.8} className="bottom-[2%] left-[4%] hidden border border-foreground/10 bg-card md:block">
            <p className="flex items-center gap-1.5 font-display text-2xl leading-none">{BRAND.rating}<Star className="h-5 w-5 fill-red text-red" /></p>
            <p className="mt-1 font-mono text-[.6rem] uppercase tracking-[.2em] text-muted">{BRAND.ratings} оценок</p>
          </Sticker>
        </div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.9, ease: EASE }}
          className="flex flex-col gap-5 border-t-2 border-foreground py-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <h1 className="font-display text-2xl leading-tight md:text-3xl">Барбершоп в Новокуркино</h1>
            <p className="mt-2 text-[.95rem] leading-relaxed text-muted">Стрижки, борода и королевское бритьё по честным ценам. После стрижки массаж, есть фитобочка. Детей стрижём в кресле-машинке.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => booking.open()} className="sheen h-14 rounded-full bg-accent px-8 font-semibold text-white transition-transform active:scale-[.98]">Записаться</button>
            <a href="#services" className="flex h-14 items-center gap-2 rounded-full border-2 border-foreground px-7 font-semibold transition-colors hover:bg-foreground hover:text-background">Собрать чек <ArrowDownRight className="h-4 w-4" /></a>
          </div>
        </motion.div>
      </div>

      <div className="overflow-hidden bg-foreground py-3 text-background" aria-label="Цены">
        <div className="flex w-max [animation:marquee_32s_linear_infinite] motion-reduce:[animation:none]">
          {[0, 1].map(k => (
            <ul key={k} aria-hidden={k === 1} className="flex shrink-0 items-center">
              {TICKER.map(t => (
                <li key={t} className="flex items-center gap-6 px-6 font-display text-base uppercase md:text-lg">
                  {t}<span aria-hidden className="text-red">✦</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  )
}
