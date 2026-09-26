import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Clock, Star } from 'lucide-react'
import { BRAND } from '@/data'
import { booking } from '@/store'

// three.js is the heaviest chunk: load it after the page shell has painted
const PearScene = lazy(() => import('@/three/PearScene').then(m => ({ default: m.PearScene })))

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

export function Hero() {
  const host = useRef<HTMLElement>(null)
  const anchor = useRef<HTMLDivElement>(null)
  const status = useOpenStatus()

  return (
    <section ref={host} className="relative isolate flex min-h-[100svh] w-full flex-col overflow-hidden">
      {/* CSS stand-in while WebGL boots, or if it is unavailable */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_70%_60%,#b8dba2_0%,transparent_70%),radial-gradient(50%_60%_at_20%_20%,#f1f7ec_0%,transparent_70%),linear-gradient(160deg,#eaf3e6,#d3e9c6)]" />
      <div className="absolute inset-0 -z-10">
        <Suspense fallback={null}><PearScene anchor={anchor} host={host} /></Suspense>
      </div>

      {/* the pear is drawn in WebGL over this empty box */}
      <div className="relative flex flex-1 items-center justify-center pb-4 pt-24 md:pt-28">
        <div ref={anchor} aria-hidden className="h-[40svh] w-[64vw] max-w-[520px] md:h-[54svh] md:w-[36vw]" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-5 px-4 pb-6 md:grid-cols-[1fr_auto] md:items-end md:px-6 md:pb-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.9, ease: EASE }}
          className="glass rounded-[28px] p-5 sm:p-6 md:max-w-xl md:p-7"
        >
          <h1 className="font-display text-xl font-bold uppercase leading-tight tracking-tight md:text-2xl">Салон красоты в Химках</h1>
          <p className="mt-3 text-[.95rem] leading-relaxed text-muted">
            Окрашивание, стрижки, маникюр, брови и уход за кожей. Мастера, к которым возвращаются годами.
          </p>
          <p className="mt-3 flex items-center gap-2 text-sm font-medium sm:hidden">
            <Star className="h-4 w-4 fill-foreground" /> {BRAND.rating}
            <span className="text-muted">·</span>
            <span className={status.open ? 'live-dot h-2 w-2 rounded-full bg-leaf' : 'h-2 w-2 rounded-full bg-foreground/30'} aria-hidden />
            {status.label}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button onClick={() => booking.open()} className="sheen h-12 rounded-full bg-foreground px-7 text-sm font-semibold text-background transition-transform active:scale-[.98]">Записаться</button>
            <a href="#services" className="flex h-12 items-center rounded-full border border-foreground/20 px-6 text-sm font-semibold transition-colors hover:border-foreground">Цены</a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 1.05, ease: EASE }}
          className="glass-dark hidden items-center gap-6 rounded-[28px] p-5 text-background sm:flex md:p-6"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-4xl font-bold">{BRAND.rating}</span>
              <Star className="h-5 w-5 fill-lime text-lime" />
            </div>
            <p className="mt-1 tabular-nums text-xs text-background/60">{BRAND.ratings} оценок</p>
          </div>
          <div className="h-12 w-px bg-background/15" />
          <div className="text-sm">
            <p className="flex items-center gap-2 font-semibold">
              <span className={status.open ? 'live-dot h-2 w-2 rounded-full bg-lime' : 'h-2 w-2 rounded-full bg-background/40'} aria-hidden />
              {status.label}
            </p>
            <p className="mt-1 flex items-center gap-2 text-background/60"><Clock className="h-3.5 w-3.5" /> {BRAND.hours}</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
