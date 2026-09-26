import { lazy, Suspense, useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { BRAND } from '../data'

// three.js + postprocessing are heavy: load the sign after the page has painted.
const NeonSign = lazy(() => import('../stage/NeonSign').then(m => ({ default: m.NeonSign })))
const NEON_SWATCHES = ['#ffe2bd', '#ff7d93', '#ffb07a']
const NEON_NAMES = ['Тёплый белый', 'Пыльная роза', 'Персик']

const NAV = [['services', 'Услуги'], ['works', 'Работы'], ['team', 'Мастера'], ['prices', 'Цены'], ['contacts', 'Контакты']]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(scrollY > innerHeight * .8)
    on(); addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [])
  return (
    <header className={`fixed inset-x-3 top-3 z-40 flex items-center justify-between gap-4 border-2 px-3 py-2 transition-colors duration-300 md:inset-x-6 md:top-5 md:px-4 ${scrolled ? 'border-foreground bg-cream text-foreground shadow-hard' : 'border-cream/30 bg-night/60 text-cream backdrop-blur-md'}`}>
      <a href="#top" className="flex items-baseline gap-2" aria-label="Tina Studio, на главную">
        <span className="font-serif text-[1.35rem] italic leading-none">Tina</span>
        <span className="font-mono text-[.7rem] tracking-[.24em] uppercase">Studio</span>
      </a>
      <nav className="hidden gap-7 text-[.93rem] lg:flex" aria-label="Разделы">
        {NAV.map(([id, label]) => <a key={id} href={`#${id}`} className="opacity-80 transition-opacity hover:opacity-100">{label}</a>)}
      </nav>
      <div className="flex items-center gap-3">
        <a href={BRAND.phoneHref} className="hidden font-mono text-[.85rem] xl:inline">{BRAND.phone}</a>
        <a href="#booking" className="btn btn-primary h-10 px-4 text-[.88rem]">Записаться</a>
      </div>
    </header>
  )
}

export function Hero() {
  const [neon, setNeon] = useState(0)
  const next = () => setNeon(n => (n + 1) % NEON_SWATCHES.length)
  return (
    <section id="top" className="relative isolate min-h-svh overflow-hidden bg-night text-cream">
      {/* full-bleed WebGL wall with the neon sign (right half on desktop, top on phones) */}
      <div className="absolute inset-0 -z-10">
        <Suspense fallback={<div className="brick size-full" />}>
          <NeonSign colorIndex={neon} onToggle={next} />
        </Suspense>
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-[5] bg-[linear-gradient(90deg,rgb(31_26_23/.8),rgb(31_26_23/.35)_45%,transparent_60%)] max-lg:bg-[linear-gradient(0deg,rgb(31_26_23/.92)_35%,transparent_60%)]" />

      <div className="pointer-events-none mx-auto flex min-h-svh max-w-[80rem] flex-col justify-end px-5 pt-[54svh] pb-14 md:px-10 lg:justify-center lg:py-28">
        <div className="pointer-events-auto max-w-[36rem]">
          <motion.span initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1, duration: .8 }} className="eyebrow !text-muted">Салон красоты и подологии · Химки</motion.span>
          <h1 className="mt-6 text-[clamp(3rem,8vw,7.2rem)] leading-[.95]">
            {BRAND.slogan.map((line, i) => (
              <motion.span key={line} className={`block ${i === 1 ? 'pb-2 italic text-muted' : ''}`}
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 + i * .15, duration: 1, ease: [.16, 1, .3, 1] }}>
                {line}
              </motion.span>
            ))}
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .6, duration: 1 }} className="mt-7 max-w-[30rem] text-[1.08rem] text-cream/75">
            Волосы, ногти, подология, брови и косметология в одной студии. Приходите за результатом, возвращайтесь за атмосферой.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .75, duration: .8 }} className="mt-10 flex flex-wrap gap-4">
            <a href="#booking" className="btn btn-primary !border-cream !shadow-[4px_4px_0_0_#F7F5E9] hover:!shadow-[6px_6px_0_0_#F7F5E9]">Записаться онлайн</a>
            <a href="#prices" className="btn btn-ghost-dark">Смотреть цены</a>
          </motion.div>
          <motion.dl initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .9, duration: 1 }} className="mt-12 grid max-w-[32rem] grid-cols-3 border-2 border-cream/25 bg-night/60 backdrop-blur-sm">
            <div className="border-r-2 border-cream/25 p-4"><dt className="font-mono text-[.66rem] tracking-[.14em] text-cream/55 uppercase">Яндекс Карты</dt><dd className="mt-1 font-serif text-[1.7rem] leading-none">{BRAND.rating} <span className="text-[1rem] text-muted">★</span></dd></div>
            <div className="border-r-2 border-cream/25 p-4"><dt className="font-mono text-[.66rem] tracking-[.14em] text-cream/55 uppercase">Оценок</dt><dd className="mt-1 font-serif text-[1.7rem] leading-none">{BRAND.votes}</dd></div>
            <div className="p-4"><dt className="font-mono text-[.66rem] tracking-[.14em] text-cream/55 uppercase">Награда</dt><dd className="mt-1 text-[.92rem] leading-tight">{BRAND.award}</dd></div>
          </motion.dl>
        </div>
      </div>

      <div className="absolute top-[47svh] right-5 left-5 flex items-center justify-between gap-3 font-mono text-[.7rem] tracking-[.12em] text-cream/60 uppercase lg:top-auto lg:right-10 lg:bottom-10 lg:left-1/2 lg:pl-10">
        <span>Нажмите на вывеску</span>
        <div className="flex gap-2" role="group" aria-label="Цвет неона">
          {NEON_SWATCHES.map((c, i) => (
            <button key={c} onClick={() => setNeon(i)} aria-label={NEON_NAMES[i]} aria-pressed={neon === i}
              className="size-6 border-2 border-cream/40 transition-transform hover:scale-110 aria-pressed:border-cream" style={{ background: c, boxShadow: neon === i ? `0 0 14px ${c}` : undefined }} />
          ))}
        </div>
      </div>
    </section>
  )
}

/** Hard-edged running line of directions. */
export function Marquee({ items, dark }: { items: string[]; dark?: boolean }) {
  const row = [...items, ...items]
  return (
    <div aria-hidden className={`overflow-hidden border-y-2 border-foreground py-4 ${dark ? 'bg-foreground text-cream' : 'bg-primary text-cream'}`}>
      <div className="inline-flex animate-marquee whitespace-nowrap [--marquee-duration:38s]">
        {row.map((t, i) => (
          <span key={i} className="flex items-center font-serif text-[1.6rem] italic">
            <span className="px-8">{t}</span><span className="text-[1rem] not-italic">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
