import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Clock, Star } from 'lucide-react'
import { BRAND, SHADES } from '@/data'
import { booking } from '@/store'
import { cn } from '@/lib/utils'

// three.js is the heaviest chunk: load it after the page shell has painted
const BottleScene = lazy(() => import('@/three/BottleScene').then(m => ({ default: m.BottleScene })))

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
  const [shade, setShade] = useState(SHADES[0])

  return (
    <section ref={host} className="relative isolate flex min-h-[100svh] w-full flex-col overflow-hidden">
      {/* CSS stand-in while WebGL boots, or if it is unavailable */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_70%_60%,#ecbfd1_0%,transparent_70%),radial-gradient(50%_60%_at_20%_20%,#fbf5f7_0%,transparent_70%),linear-gradient(160deg,#f7eef1,#efd3de)]" />
      <div className="absolute inset-0 -z-10">
        <Suspense fallback={null}><BottleScene anchor={anchor} host={host} shade={shade.hex} /></Suspense>
      </div>

      {/* the bottle is drawn in WebGL over this empty box; the swatches recolour the lacquer inside */}
      <div className="relative flex flex-1 flex-col items-center justify-center gap-3 pb-4 pt-24 md:pt-28">
        <div ref={anchor} aria-hidden className="h-[36svh] w-[60vw] max-w-[480px] md:h-[48svh] md:w-[32vw]" />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.3, ease: EASE }}
          className="glass flex items-center gap-1.5 rounded-full p-1.5 pl-4" role="radiogroup" aria-label="Оттенок лака">
          <span className="mr-1 hidden text-xs font-semibold text-muted sm:block">Примерьте оттенок</span>
          {SHADES.map(s => (
            <button key={s.id} role="radio" aria-checked={shade.id === s.id} aria-label={s.label} title={s.label} onClick={() => setShade(s)}
              className={cn('grid h-9 w-9 place-items-center rounded-full border transition-colors', shade.id === s.id ? 'border-foreground' : 'border-transparent hover:border-foreground/30')}>
              <span className="h-6 w-6 rounded-full shadow-[inset_0_-3px_6px_rgb(0_0_0/.25),inset_0_2px_3px_rgb(255_255_255/.6)]" style={{ background: s.hex }} />
            </button>
          ))}
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-5 px-4 pb-6 md:grid-cols-[1fr_auto] md:items-end md:px-6 md:pb-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.9, ease: EASE }}
          className="glass rounded-[28px] p-5 sm:p-6 md:max-w-xl md:p-7"
        >
          <h1 className="font-display text-xl font-bold uppercase leading-tight tracking-tight md:text-2xl">Салон красоты в Химках</h1>
          <p className="mt-3 text-[.95rem] leading-relaxed text-muted">
            Маникюр и педикюр, ресницы и брови, волосы, лазерная эпиляция и уход за кожей. Новым гостям скидка 10% на первый визит.
          </p>
          <p className="mt-3 flex items-center gap-2 text-sm font-medium sm:hidden">
            <Star className="h-4 w-4 fill-foreground" /> {BRAND.rating}
            <span className="text-muted">·</span>
            <span className={status.open ? 'live-dot h-2 w-2 rounded-full bg-berry' : 'h-2 w-2 rounded-full bg-foreground/30'} aria-hidden />
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
              <Star className="h-5 w-5 fill-petal text-petal" />
            </div>
            <p className="mt-1 tabular-nums text-xs text-background/60">{BRAND.ratings} оценок</p>
          </div>
          <div className="h-12 w-px bg-background/15" />
          <div className="text-sm">
            <p className="flex items-center gap-2 font-semibold">
              <span className={status.open ? 'live-dot h-2 w-2 rounded-full bg-petal' : 'h-2 w-2 rounded-full bg-background/40'} aria-hidden />
              {status.label}
            </p>
            <p className="mt-1 flex items-center gap-2 text-background/60"><Clock className="h-3.5 w-3.5" /> {BRAND.hours}</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
