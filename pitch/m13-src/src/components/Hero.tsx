import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowDownRight, Star } from 'lucide-react'
import { BRAND } from '@/data'
import { booking } from '@/store'

// three.js is the heaviest chunk: load it after the page shell has painted
const PoleScene = lazy(() => import('@/three/PoleScene').then(m => ({ default: m.PoleScene })))

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

const TICKER = ['Мужская стрижка 1 500 ₽', 'Борода опасной бритвой 1 400 ₽', 'Отец + сын 2 750 ₽', 'Первый визит 1 200 ₽', 'Детская комната', 'Кофе за наш счёт']

export function Hero() {
  const host = useRef<HTMLElement>(null)
  const anchor = useRef<HTMLDivElement>(null)
  const status = useOpenStatus()

  return (
    <section ref={host} className="relative isolate flex min-h-[100svh] w-full flex-col overflow-hidden">
      {/* the shop itself as a dim backdrop: brick, wood slats, black chairs */}
      <img src="img/hall-mirror.jpg" alt="" aria-hidden className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30 [filter:grayscale(.35)_contrast(1.1)]" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#0f0e0d_18%,rgb(15_14_13/.75)_55%,rgb(15_14_13/.35)),linear-gradient(0deg,#0f0e0d,transparent_40%)]" />
      <div className="absolute inset-0 z-0">
        <Suspense fallback={null}><PoleScene anchor={anchor} host={host} /></Suspense>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 grid-cols-[1fr_32vw] items-center gap-4 px-4 pb-8 pt-28 md:grid-cols-[1.3fr_1fr] md:px-6 md:pt-32">
        <div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}
            className="flex items-center gap-3 font-mono text-xs uppercase tracking-[.2em] text-muted">
            <span className="h-px w-8 bg-brick" /> Барбершоп · Химки
          </motion.p>
          <motion.p aria-hidden initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 1, ease: EASE }}
            className="mt-2 font-display text-[clamp(7.5rem,27vw,22rem)] font-bold leading-[.82] tracking-[-0.03em]">
            M<span className="text-brick">13</span>
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.9, ease: EASE }} className="mt-6 max-w-lg">
            <h1 className="font-display text-2xl font-semibold uppercase leading-tight tracking-wide md:text-3xl">Мужские и детские стрижки, борода, опасная бритва</h1>
            <p className="mt-3 text-[.95rem] leading-relaxed text-muted">Лофт на 9 Мая. Барберы, к которым ходят всей семьёй, детская комната и кофе, пока ждёте.</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button onClick={() => booking.open()} className="sheen h-12 bg-accent px-7 text-sm font-semibold uppercase tracking-wider text-foreground transition-transform active:scale-[.98]">Записаться</button>
              <a href="#services" className="flex h-12 items-center gap-2 border border-foreground/25 px-6 text-sm font-semibold uppercase tracking-wider transition-colors hover:border-foreground">Цены <ArrowDownRight className="h-4 w-4" /></a>
            </div>
          </motion.div>
        </div>
        {/* the pole is drawn in WebGL over this empty box */}
        <div ref={anchor} aria-hidden className="h-[46svh] w-full md:h-[64svh]" />
      </div>

      {/* facts strip */}
      <motion.dl initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.8 }}
        className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-2 border-t border-foreground/10 px-4 md:grid-cols-4 md:px-6">
        <div className="py-4 pr-4"><dt className="font-mono text-[.65rem] uppercase tracking-[.2em] text-muted">Рейтинг</dt><dd className="mt-1 flex items-center gap-2 font-display text-2xl font-semibold">{BRAND.rating}<Star className="h-4 w-4 fill-brick text-brick" /><span className="font-sans text-xs font-normal text-muted">{BRAND.ratings} оценок</span></dd></div>
        <div className="border-l border-foreground/10 py-4 pl-4"><dt className="font-mono text-[.65rem] uppercase tracking-[.2em] text-muted">Сейчас</dt><dd className="mt-1 flex items-center gap-2 text-sm font-semibold"><span className={status.open ? 'live-dot h-2 w-2 bg-brick' : 'h-2 w-2 bg-foreground/30'} aria-hidden />{status.label}</dd></div>
        <div className="hidden border-l border-foreground/10 py-4 pl-4 md:block"><dt className="font-mono text-[.65rem] uppercase tracking-[.2em] text-muted">Адрес</dt><dd className="mt-1 text-sm font-semibold">{BRAND.address}</dd></div>
        <div className="hidden border-l border-foreground/10 py-4 pl-4 md:block"><dt className="font-mono text-[.65rem] uppercase tracking-[.2em] text-muted">Часы</dt><dd className="mt-1 text-sm font-semibold">{BRAND.hours}</dd></div>
      </motion.dl>

      {/* running ticker with prices */}
      <div className="relative z-10 overflow-hidden border-y border-foreground/10 bg-accent py-3" aria-label="Цены и акции">
        <div className="flex w-max [animation:marquee_30s_linear_infinite] motion-reduce:[animation:none]">
          {[0, 1].map(k => (
            <ul key={k} aria-hidden={k === 1} className="flex shrink-0 items-center">
              {TICKER.map(t => (
                <li key={t} className="flex items-center gap-6 px-6 font-display text-lg font-semibold uppercase tracking-wide">
                  {t}<span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-foreground" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  )
}
