import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { ArrowUpRight, Menu, Phone, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BRAND, NAV } from '@/data'
import { booking, useBooking } from '@/store'

/** Tracks which section is on screen, for aria-current and the active underline. */
function useActiveSection() {
  const [active, setActive] = useState('')
  useEffect(() => {
    const els = NAV.map(n => document.querySelector(n.href)).filter(Boolean) as Element[]
    const io = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) setActive('#' + e.target.id)
    }, { rootMargin: '-45% 0px -50% 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
  return active
}

export function Logo({ className }: { className?: string }) {
  return (
    <a href="#" className={cn('flex items-center gap-2', className)} aria-label="Барбершоп M13, на главную">
      <span className="bg-foreground px-2 py-0.5 font-display text-lg font-bold leading-tight text-background">M13</span>
      <span className="hidden font-mono text-[.6rem] uppercase leading-tight tracking-[.2em] text-muted sm:block">барбер<br />шоп</span>
    </a>
  )
}

export function Nav() {
  const b = useBooking()
  const active = useActiveSection()
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', v => setSolid(v > 40))

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    addEventListener('keydown', onKey)
    document.documentElement.style.overflow = 'hidden'
    return () => { removeEventListener('keydown', onKey); document.documentElement.style.overflow = '' }
  }, [open])

  return (
    <>
      <header className="fixed inset-x-0 top-3 z-50 px-3 md:top-4 md:px-6">
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={cn('mx-auto flex h-14 max-w-7xl items-center justify-between gap-6 border pl-4 pr-2 transition-colors md:h-16', solid ? 'border-foreground/10 bg-background/90 backdrop-blur-md' : 'border-transparent bg-transparent')}
        >
          <Logo />
          <nav aria-label="Разделы" className="hidden items-center gap-1 lg:flex">
            {NAV.map(n => (
              <a key={n.href} href={n.href} aria-current={active === n.href ? 'true' : undefined}
                className="relative rounded-none px-4 py-2 text-sm font-medium uppercase tracking-wider text-muted transition-colors hover:text-foreground aria-[current=true]:text-foreground">
                {active === n.href && <motion.span layoutId="nav-pill" className="absolute inset-x-3 bottom-0 -z-10 h-0.5 bg-brick" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href={BRAND.phoneHref} className="hidden items-center gap-2 px-3 tabular-nums text-sm font-medium xl:flex">
              <Phone className="h-4 w-4" /> {BRAND.phone}
            </a>
            <button onClick={() => booking.open()} className="sheen hidden h-10 items-center bg-accent px-5 text-sm font-semibold uppercase tracking-wider text-foreground sm:flex md:h-12 md:px-6">
              Записаться{b.cart.length > 0 && <span className="ml-2 grid h-5 min-w-5 place-items-center bg-foreground px-1 font-mono text-xs text-background">{b.cart.length}</span>}
            </button>
            <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-none lg:hidden" aria-label="Открыть меню" aria-expanded={open}>
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog" aria-modal="true" aria-label="Меню"
            className="fixed inset-0 z-[60] flex flex-col bg-background px-6 pb-8 pt-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between">
              <Logo />
              <button onClick={() => setOpen(false)} className="grid h-11 w-11 place-items-center rounded-none border border-foreground/15" aria-label="Закрыть меню"><X className="h-5 w-5" /></button>
            </div>
            <nav className="mt-12 flex flex-col gap-2" aria-label="Разделы">
              {NAV.map((n, i) => (
                <motion.a key={n.href} href={n.href} onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.05, ease: [0.16, 1, 0.3, 1], duration: 0.6 }}
                  className="flex items-baseline justify-between border-b border-foreground/10 py-4 font-display text-3xl font-bold uppercase">
                  {n.label}
                  <ArrowUpRight className="h-5 w-5 text-muted" />
                </motion.a>
              ))}
            </nav>
            <div className="mt-auto space-y-3">
              <a href={BRAND.phoneHref} className="flex h-14 items-center justify-center gap-2 rounded-none border border-foreground/20 tabular-nums font-medium"><Phone className="h-4 w-4" /> {BRAND.phone}</a>
              <button onClick={() => { setOpen(false); booking.open() }} className="h-14 w-full bg-accent font-semibold uppercase tracking-wider text-foreground">Записаться</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/** Phone-only bottom bar: the two things a guest usually wants, always within thumb reach. */
export function MobileBar() {
  const { scrollY } = useScroll()
  const [show, setShow] = useState(false)
  useMotionValueEvent(scrollY, 'change', v => setShow(v > 500))
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ y: 90 }} animate={{ y: 0 }} exit={{ y: 90 }} transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-foreground/10 bg-background/95 backdrop-blur-md sm:hidden">
          <a href={BRAND.phoneHref} className="flex h-14 items-center justify-center gap-2 text-sm font-semibold uppercase tracking-wider"><Phone className="h-4 w-4" /> Позвонить</a>
          <button onClick={() => booking.open()} className="h-14 bg-accent text-sm font-semibold uppercase tracking-wider text-foreground">Записаться</button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
