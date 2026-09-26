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
    <a href="#" className={cn('font-display text-lg font-bold uppercase tracking-[.08em]', className)} aria-label="Груша, на главную">
      груша
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
          className={cn('mx-auto flex h-14 max-w-7xl items-center justify-between gap-6 rounded-full pl-6 pr-2 transition-shadow md:h-16', solid ? 'border border-white/80 bg-[#f3f8f0]/95 shadow-[0_20px_50px_-30px_rgba(15,36,23,.55)] backdrop-blur-xl' : 'glass')}
        >
          <Logo />
          <nav aria-label="Разделы" className="hidden items-center gap-1 lg:flex">
            {NAV.map(n => (
              <a key={n.href} href={n.href} aria-current={active === n.href ? 'true' : undefined}
                className="relative rounded-full px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground aria-[current=true]:text-foreground">
                {active === n.href && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-white/70" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href={BRAND.phoneHref} className="hidden items-center gap-2 px-3 tabular-nums text-sm font-medium xl:flex">
              <Phone className="h-4 w-4" /> {BRAND.phone}
            </a>
            <button onClick={() => booking.open()} className="sheen hidden h-10 items-center rounded-full bg-foreground px-5 text-sm font-semibold text-background sm:flex md:h-12 md:px-6">
              Записаться{b.cart.length > 0 && <span className="ml-2 grid h-5 min-w-5 place-items-center rounded-full bg-lime px-1 font-mono text-xs text-foreground">{b.cart.length}</span>}
            </button>
            <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-full lg:hidden" aria-label="Открыть меню" aria-expanded={open}>
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
              <button onClick={() => setOpen(false)} className="grid h-11 w-11 place-items-center rounded-full border border-foreground/15" aria-label="Закрыть меню"><X className="h-5 w-5" /></button>
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
              <a href={BRAND.phoneHref} className="flex h-14 items-center justify-center gap-2 rounded-full border border-foreground/20 tabular-nums font-medium"><Phone className="h-4 w-4" /> {BRAND.phone}</a>
              <button onClick={() => { setOpen(false); booking.open() }} className="h-14 w-full rounded-full bg-foreground font-semibold text-background">Записаться</button>
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
          className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-2 gap-2 rounded-full border border-white/80 bg-[#f3f8f0]/95 p-1.5 shadow-[0_20px_50px_-30px_rgba(15,36,23,.55)] backdrop-blur-xl sm:hidden">
          <a href={BRAND.phoneHref} className="flex h-12 items-center justify-center gap-2 rounded-full text-sm font-semibold"><Phone className="h-4 w-4" /> Позвонить</a>
          <button onClick={() => booking.open()} className="h-12 rounded-full bg-foreground text-sm font-semibold text-background">Записаться</button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
