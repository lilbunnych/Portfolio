import { useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, Baby, Check, Coffee, Dog, Flame, Hammer, MapPin, Minus, Navigation, Percent, Phone, Plus, Search, Star, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BRAND, FAQ, FILTERS, GALLERY, INTERIOR, NAV, PERKS, POPULAR, PRICE_RANGES, REVIEWS, TEAM, THEMES, reviewWord } from '@/data'
import { CATEGORIES, type Service } from '@/prices'
import { booking, useBooking } from '@/store'
import { rub } from '@/hooks'
import { CountUp, Reveal, ScrollHighlight, SplitReveal } from './TextFx'
import { Gallery2D } from './Gallery2D'
import { useOpenStatus } from './Hero'

const H2 = 'font-display text-[clamp(2.8rem,8vw,7.5rem)] font-bold uppercase leading-[.9] tracking-[-0.01em]'

function Section({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return <section id={id} className={cn('mx-auto max-w-7xl scroll-mt-24 px-4 pt-24 md:px-6 md:pt-36', className)}>{children}</section>
}

/** Numbered section heading: a mono index on a hairline, then the big condensed title. */
function Head({ n, title, aside }: { n: string; title: string; aside?: ReactNode }) {
  return (
    <div>
      <p className="flex items-center gap-4 border-t border-foreground/15 pt-4 font-mono text-xs uppercase tracking-[.2em] text-muted">
        <span className="text-brick">{n}</span> {title}
      </p>
      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SplitReveal text={title} className={H2} />
        {aside}
      </div>
    </div>
  )
}

/* family barbershop: quote from a review + perks ---------------------- */

const PERK_ICONS = [Baby, Users, Percent, Coffee, Dog, Hammer]

export function Why() {
  return (
    <Section id="why">
      <div className="grid items-end gap-10 lg:grid-cols-[1.5fr_1fr]">
        <figure>
          <ScrollHighlight
            className="font-display text-[clamp(1.9rem,4.4vw,3.8rem)] font-medium uppercase leading-[1.05]"
            text="«У заведения нет давящего пафоса, всё сделано для людей»"
          />
          <figcaption className="mt-6 font-mono text-xs uppercase tracking-[.2em] text-muted">Кирилл, из отзыва о M13</figcaption>
        </figure>
        <Reveal className="relative aspect-[4/5] overflow-hidden">
          <img src={INTERIOR[1].src} alt={INTERIOR[1].title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <span className="absolute left-0 top-0 bg-accent px-3 py-1.5 font-mono text-[.65rem] uppercase tracking-[.2em]">{INTERIOR[1].title}</span>
        </Reveal>
      </div>
      <div className="mt-14 grid border-l border-t border-foreground/10 sm:grid-cols-2 lg:grid-cols-3">
        {PERKS.map((p, i) => {
          const Icon = PERK_ICONS[i]
          return (
            <Reveal key={p.title} delay={i * 0.05} className="group border-b border-r border-foreground/10 p-6 transition-colors hover:bg-card md:p-8">
              <div className="flex items-start justify-between">
                <Icon className="h-6 w-6 text-brick" strokeWidth={1.5} />
                <span className="font-mono text-xs text-muted">0{i + 1}</span>
              </div>
              <p className="mt-8 font-display text-2xl font-semibold uppercase">{p.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.text}</p>
            </Reveal>
          )
        })}
      </div>
    </Section>
  )
}

/* services ---------------------------------------------------------- */

type Row = Service & { cat: string; catTitle: string; hit: boolean }
const ALL: Row[] = CATEGORIES.flatMap(c => c.items.map(i => ({ ...i, cat: c.id, catTitle: c.title, hit: (POPULAR[c.id] ?? []).includes(i.name) })))

function ServiceRow({ s, i }: { s: Row; i: number }) {
  const b = useBooking()
  const item = { name: s.name, desc: s.desc, price: s.price, cat: s.cat }
  const on = b.cart.some(c => c.name === s.name && c.cat === s.cat && c.price === s.price)
  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
      className="group grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 border-b border-foreground/10 py-5 md:gap-6">
      <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, '0')}</span>
      <div className="min-w-0">
        <p className="font-display text-xl font-semibold uppercase leading-tight md:text-2xl">
          {s.name}
          {s.hit && (
            <span className="ml-3 inline-flex translate-y-[-3px] items-center gap-1 bg-accent px-2 py-0.5 align-middle font-mono text-[.6rem] font-semibold uppercase tracking-wider">
              <Flame className="h-3 w-3" /> хит
            </span>
          )}
        </p>
        {s.desc && <p className="mt-1 max-w-[60ch] text-sm leading-relaxed text-muted">{s.desc}</p>}
      </div>
      <p className="shrink-0 whitespace-nowrap text-right font-display text-xl font-semibold tabular-nums md:text-2xl">{rub(s.price)}</p>
      <button
        onClick={() => booking.toggle(item)}
        aria-pressed={on}
        aria-label={on ? `Убрать «${s.name}» из записи` : `Добавить «${s.name}» в запись`}
        className={cn('grid h-11 w-11 shrink-0 place-items-center border transition-colors', on ? 'border-accent bg-accent' : 'border-foreground/20 hover:border-foreground')}
      >
        {on ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>
    </motion.div>
  )
}

export function Services() {
  const [filter, setFilter] = useState('hits')
  const [range, setRange] = useState('all')
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    const r = PRICE_RANGES.find(x => x.id === range)!
    const s = q.trim().toLowerCase()
    const inRange = (x: Row) => range === 'all' || (x.price !== null && x.price >= r.min && x.price < r.max)
    if (s.length >= 2) return ALL.filter(x => x.name.toLowerCase().includes(s) && inRange(x))
    if (filter === 'hits') return ALL.filter(x => x.hit && inRange(x))
    const f = FILTERS.find(x => x.id === filter)!
    return ALL.filter(x => f.cats.includes(x.cat) && inRange(x)).sort((a, b) => Number(b.hit) - Number(a.hit))
  }, [filter, range, q])

  return (
    <Section id="services">
      <Head n="01" title="Услуги и цены" />
      <Reveal className="mt-10 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0" role="tablist" aria-label="Направления">
          {FILTERS.map(f => {
            const on = filter === f.id && !q
            return (
              <button key={f.id} role="tab" aria-selected={on} onClick={() => { setFilter(f.id); setQ('') }}
                className={cn('flex h-11 shrink-0 items-center gap-2 border px-5 text-sm font-semibold uppercase tracking-wider transition-colors',
                  on ? 'border-accent bg-accent' : 'border-foreground/15 text-foreground/75 hover:border-foreground/40 hover:text-foreground')}>
                {f.id === 'hits' && <Flame className="h-4 w-4" />}
                {f.label}
              </button>
            )
          })}
        </div>
        <label className="relative block lg:w-72">
          <span className="sr-only">Поиск по услугам</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Найти услугу"
            className="h-11 w-full border border-foreground/15 bg-card pl-11 pr-4 text-sm outline-none placeholder:text-muted focus:border-brick" />
        </label>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:col-span-2 lg:mx-0 lg:px-0" role="radiogroup" aria-label="Цена">
          {PRICE_RANGES.map(p => (
            <button key={p.id} role="radio" aria-checked={range === p.id} onClick={() => setRange(p.id)}
              className={cn('h-9 shrink-0 px-3 font-mono text-xs uppercase tracking-wider transition-colors',
                range === p.id ? 'text-foreground underline decoration-brick decoration-2 underline-offset-8' : 'text-muted hover:text-foreground')}>
              {p.label}
            </button>
          ))}
        </div>
      </Reveal>

      <div className="mt-6 border-t border-foreground/10">
        {rows.length === 0 ? (
          <div className="py-10">
            <p className="font-display text-2xl font-semibold uppercase">Ничего не нашлось</p>
            <p className="mt-2 text-muted">Попробуйте другую цену или слово: «стрижка», «борода». Или позвоните: <a href={BRAND.phoneHref} className="font-semibold text-foreground">{BRAND.phone}</a></p>
          </div>
        ) : (
          <AnimatePresence initial={false} mode="popLayout">
            {rows.map((s, i) => <ServiceRow key={filter + range + q + s.name} s={s} i={i} />)}
          </AnimatePresence>
        )}
      </div>
    </Section>
  )
}

/* gallery ----------------------------------------------------------- */

export function Gallery() {
  return (
    <section id="gallery" className="scroll-mt-24 pt-24 md:pt-36">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Head n="02" title="Работы" aside={<p className="max-w-xs text-sm text-muted lg:text-right">Листайте ленту. Нажмите на фото, чтобы открыть крупно.</p>} />
      </div>
      <div className="mt-8">
        <Gallery2D items={GALLERY} />
      </div>
    </section>
  )
}

/* team -------------------------------------------------------------- */

export function Team() {
  return (
    <Section id="team">
      <Head n="03" title="Барберы" />
      <div className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <ul className="border-t border-foreground/10">
          {TEAM.map((m, i) => (
            <Reveal key={m.id} delay={i * 0.04}>
              <li className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 border-b border-foreground/10 py-6">
                <span className="grid h-14 w-14 place-items-center border border-foreground/15 font-display text-2xl font-bold transition-colors group-hover:border-brick group-hover:text-brick">{m.name[0]}</span>
                <div className="min-w-0">
                  <p className="font-display text-2xl font-semibold uppercase leading-none md:text-3xl">{m.name}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{m.note}</p>
                </div>
                <button onClick={() => booking.open({ master: m.id, cat: m.cats[0] })} aria-label={`Записаться к барберу ${m.name}`}
                  className="grid h-11 w-11 shrink-0 place-items-center border border-foreground/20 transition-colors hover:border-accent hover:bg-accent sm:flex sm:w-auto sm:gap-2 sm:px-4 sm:text-sm sm:font-semibold sm:uppercase sm:tracking-wider">
                  <span className="hidden sm:inline">Записаться</span> <ArrowUpRight className="h-4 w-4" />
                </button>
              </li>
            </Reveal>
          ))}
        </ul>
        <Reveal delay={0.1} className="grid grid-cols-2 gap-2 self-start">
          <img src={INTERIOR[0].src} alt={INTERIOR[0].title} loading="lazy" className="col-span-2 h-72 w-full object-cover lg:h-[24rem]" />
          <img src={INTERIOR[2].src} alt={INTERIOR[2].title} loading="lazy" className="h-48 w-full object-cover lg:h-60" />
          <img src={INTERIOR[3].src} alt={INTERIOR[3].title} loading="lazy" className="h-48 w-full object-cover lg:h-60" />
        </Reveal>
      </div>
    </Section>
  )
}

/* reviews ----------------------------------------------------------- */

function ReviewCard({ r }: { r: (typeof REVIEWS)[number] }) {
  const [open, setOpen] = useState(false)
  return (
    <figure className="flex w-[min(84vw,26rem)] shrink-0 snap-start flex-col border border-foreground/10 bg-card p-7">
      <span className="self-start border border-brick/40 px-2.5 py-1 font-mono text-[.65rem] uppercase tracking-[.2em] text-brick">{r.tag}</span>
      <blockquote className={cn('mt-6 flex-1 text-[1.05rem] leading-relaxed', !open && 'line-clamp-4')}>«{r.text}»</blockquote>
      <button onClick={() => setOpen(v => !v)} className="mt-3 self-start font-mono text-xs uppercase tracking-wider text-brick underline-offset-4 hover:underline">{open ? 'Свернуть' : 'Читать полностью'}</button>
      <figcaption className="mt-6 flex items-baseline justify-between border-t border-foreground/10 pt-4 text-sm"><b>{r.author}</b><span className="font-mono text-xs text-muted">{r.date}</span></figcaption>
    </figure>
  )
}

function LiveReviews() {
  const [ready, setReady] = useState(false)
  return (
    <div className="relative mx-auto h-[760px] w-full max-w-[560px] overflow-hidden border border-foreground/10 bg-foreground">
      {!ready && <div className="absolute inset-0 animate-pulse bg-card" aria-hidden />}
      <iframe title="Свежие отзывы о барбершопе M13" src={`https://yandex.ru/maps-reviews-widget/${BRAND.yandexId}?comments`} loading="lazy" onLoad={() => setReady(true)}
        className={cn('h-full w-full border-0 transition-opacity duration-500', ready ? 'opacity-100' : 'opacity-0')} />
    </div>
  )
}

export function Reviews() {
  const [tab, setTab] = useState<'best' | 'live'>('best')
  return (
    <section id="reviews" className="scroll-mt-24 pt-24 md:pt-36">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Head n="04" title="Отзывы" />
        <Reveal className="mt-10 grid gap-2 lg:grid-cols-[auto_1fr]">
          <div className="glass-dark flex items-center gap-6 p-7">
            <span className="font-display text-8xl font-bold leading-none"><CountUp value={BRAND.ratingValue} decimals={1} /></span>
            <div>
              <span className="flex gap-1">{Array.from({ length: 5 }, (_, i) => <Star key={i} className="h-4 w-4 fill-accent text-accent" />)}</span>
              <p className="mt-2 tabular-nums text-sm opacity-70"><CountUp value={BRAND.ratings} /> оценок<br /><CountUp value={BRAND.reviews} /> {reviewWord(BRAND.reviews)}</p>
              <p className="mt-2 font-mono text-[.65rem] uppercase tracking-[.2em]">Хорошее место 2026</p>
            </div>
          </div>
          <div className="glass p-6">
            <p className="font-mono text-xs uppercase tracking-[.2em] text-muted">О чём пишут чаще всего</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {THEMES.map(t => (
                <li key={t.label} className="flex items-center gap-3 border border-foreground/10 py-2 pl-4 pr-2 text-sm font-medium">
                  {t.label}
                  <span className="bg-foreground/10 px-2 py-0.5 tabular-nums text-xs">{t.count} {reviewWord(t.count)}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <div className="mt-8 inline-flex border border-foreground/15" role="tablist" aria-label="Отзывы">
          {([['best', 'Избранные'], ['live', 'Все свежие']] as const).map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
              className={cn('h-11 px-5 text-sm font-semibold uppercase tracking-wider transition-colors', tab === id ? 'bg-foreground text-background' : 'text-muted hover:text-foreground')}>{label}</button>
          ))}
        </div>
      </div>
      {tab === 'best' ? (
        <div className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-6 md:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]" role="tabpanel">
          {REVIEWS.map(r => <ReviewCard key={r.author + r.date} r={r} />)}
        </div>
      ) : (
        <div className="mt-6 px-4" role="tabpanel"><LiveReviews /></div>
      )}
    </section>
  )
}

/* FAQ --------------------------------------------------------------- */

export function Questions() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <Section id="faq">
      <Head n="05" title="Перед визитом" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="border-t border-foreground/10">
          {FAQ.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.04}>
              <div className="border-b border-foreground/10">
                <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 py-6 text-left">
                  <span className="font-display text-xl font-semibold uppercase md:text-2xl">{f.q}</span>
                  <span className={cn('grid h-10 w-10 shrink-0 place-items-center border transition-colors', open === i ? 'border-accent bg-accent' : 'border-foreground/15')}>{open === i ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}</span>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                      <p className="max-w-[60ch] pb-6 leading-relaxed text-muted">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="glass-dark self-start p-8">
          <p className="font-display text-3xl font-bold uppercase leading-none">Не нашли ответ?</p>
          <p className="mt-3 text-sm opacity-70">Администратор ответит на вопросы и подберёт барбера под вашу задачу.</p>
          <a href={BRAND.phoneHref} className="mt-6 flex h-12 items-center justify-center gap-2 bg-accent tabular-nums text-sm font-semibold text-foreground"><Phone className="h-4 w-4" /> {BRAND.phone}</a>
        </Reveal>
      </div>
    </Section>
  )
}

/* contacts + footer ------------------------------------------------- */

export function Contacts() {
  const status = useOpenStatus()
  return (
    <Section id="contacts">
      <Head n="06" title="Как нас найти" />
      <div className="mt-10 grid gap-2 lg:grid-cols-[1fr_1.35fr]">
        <Reveal className="glass flex flex-col p-7 md:p-9">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <span className={status.open ? 'live-dot h-2 w-2 bg-brick' : 'h-2 w-2 bg-foreground/30'} aria-hidden />{status.label}
          </p>
          <div className="mt-8 space-y-6">
            <div className="flex gap-4"><MapPin className="mt-1 h-5 w-5 shrink-0 text-brick" /><div><p className="font-display text-2xl font-semibold uppercase leading-tight">{BRAND.address}</p><p className="mt-1 text-sm text-muted">{BRAND.addressNote}.</p></div></div>
            <div className="flex gap-4"><Phone className="mt-1 h-5 w-5 shrink-0 text-brick" /><div><a href={BRAND.phoneHref} className="tabular-nums text-lg font-semibold">{BRAND.phone}</a><p className="mt-1 text-sm text-muted">{BRAND.hours}</p></div></div>
          </div>
          <div className="mt-auto flex flex-wrap gap-2 pt-10">
            <button onClick={() => booking.open()} className="sheen h-12 bg-accent px-7 text-sm font-semibold uppercase tracking-wider">Записаться</button>
            <a href={BRAND.routeUrl} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center gap-2 border border-foreground/20 px-6 text-sm font-semibold uppercase tracking-wider transition-colors hover:border-foreground"><Navigation className="h-4 w-4" /> Маршрут</a>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="relative min-h-[440px] overflow-hidden bg-concrete">
          <iframe title="Барбершоп M13 на карте" src={`https://yandex.ru/map-widget/v1/?ll=${BRAND.coords[1]}%2C${BRAND.coords[0]}&z=17&pt=${BRAND.coords[1]}%2C${BRAND.coords[0]}%2Cpm2rdm`} loading="lazy"
            className="absolute inset-0 h-full w-full border-0 [filter:grayscale(1)_invert(.92)_contrast(.9)]" />
        </Reveal>
      </div>
    </Section>
  )
}

export function Footer() {
  return (
    <footer className="mt-28 overflow-hidden border-t border-foreground/10 pb-20 sm:pb-10">
      <div className="mx-auto max-w-7xl px-4 pt-10 md:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <p className="text-sm text-muted">Барбершоп M13<br />{BRAND.address}<br />{BRAND.hours}</p>
          <nav aria-label="Разделы в подвале" className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm text-muted">
            {NAV.map(n => <a key={n.href} href={n.href} className="uppercase tracking-wider hover:text-brick">{n.label}</a>)}
            <a href={BRAND.phoneHref} className="tabular-nums hover:text-brick">{BRAND.phone}</a>
          </nav>
        </div>
      </div>
      <p aria-hidden className="mt-8 select-none text-center font-display text-[34vw] font-bold leading-[.75] tracking-[-0.04em] text-foreground/[.06]">M13</p>
    </footer>
  )
}
