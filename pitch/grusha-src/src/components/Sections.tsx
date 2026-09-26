import { useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, Check, Flame, MapPin, Minus, Navigation, Phone, Plus, Search, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BRAND, FAQ, FILTERS, GALLERY, INTERIOR, NAV, POPULAR, PRICE_RANGES, REVIEWS, TEAM, THEMES, reviewWord } from '@/data'
import { CATEGORIES, type Service } from '@/prices'
import { booking, useBooking } from '@/store'
import { rub } from '@/hooks'
import { CountUp, Reveal, ScrollHighlight, SplitReveal } from './TextFx'
import { Gallery2D } from './Gallery2D'
import { useOpenStatus } from './Hero'
import { Logo } from './Nav'

const H2 = 'font-display text-[clamp(2.1rem,5.2vw,4.6rem)] font-bold uppercase leading-[1.02] tracking-[-0.02em]'

function Section({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return <section id={id} className={cn('mx-auto max-w-7xl scroll-mt-24 px-4 pt-28 md:px-6 md:pt-40', className)}>{children}</section>
}

/* manifesto + reasons ----------------------------------------------- */

export function Why() {
  return (
    <Section id="why">
      <div className="grid items-end gap-10 lg:grid-cols-[1.6fr_1fr]">
        <figure>
          <ScrollHighlight
            className="text-[clamp(1.6rem,3.6vw,3.1rem)] font-semibold leading-[1.18] tracking-tight"
            text="«Здесь будут ваши слова, которые вы бы хотели сказать клиенту о вашем салоне красоты»"
          />
          <figcaption className="mt-6 tabular-nums text-sm text-muted">Слово владельца салона</figcaption>
        </figure>
        <Reveal className="relative aspect-[4/5] overflow-hidden rounded-[28px]">
          <img src={INTERIOR[0].src} alt="Зона мойки у зелёной стены" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        </Reveal>
      </div>
    </Section>
  )
}

/* services ---------------------------------------------------------- */

type Row = Service & { cat: string; catTitle: string; hit: boolean }
const ALL: Row[] = CATEGORIES.flatMap(c => c.items.map(i => ({ ...i, cat: c.id, catTitle: c.title, hit: (POPULAR[c.id] ?? []).includes(i.name) })))
const PREVIEW = 6

function ServiceRow({ s }: { s: Row }) {
  const b = useBooking()
  const item = { name: s.name, desc: s.desc, price: s.price, cat: s.cat }
  const on = b.cart.some(c => c.name === s.name && c.cat === s.cat && c.price === s.price)
  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
      className="flex items-center gap-4 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-snug">
          {s.name}
          {s.hit && (
            <span className="ml-2 inline-flex translate-y-[-1px] items-center gap-1 rounded-full bg-lime px-2 py-0.5 align-middle font-mono text-[.65rem] font-semibold uppercase">
              <Flame className="h-3 w-3" /> хит
            </span>
          )}
        </p>
        {s.desc && <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{s.desc}</p>}
      </div>
      <p className="shrink-0 text-right text-[.95rem] font-semibold tabular-nums">{s.price === null ? <span className="font-sans font-medium text-muted">по запросу</span> : rub(s.price)}</p>
      <button
        onClick={() => booking.toggle(item)}
        aria-pressed={on}
        aria-label={on ? `Убрать «${s.name}» из записи` : `Добавить «${s.name}» в запись`}
        className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors', on ? 'border-foreground bg-foreground text-lime' : 'border-foreground/20 hover:border-foreground')}
      >
        {on ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>
    </motion.div>
  )
}

function Group({ title, rows }: { title: string; rows: Row[] }) {
  const [all, setAll] = useState(false)
  const shown = all ? rows : rows.slice(0, PREVIEW)
  return (
    <div className="glass rounded-[28px] px-6 pb-3 pt-5 md:px-7">
      <div className="flex items-baseline justify-between border-b border-foreground/10 pb-3">
        <h3 className="font-display text-base font-bold uppercase">{title}</h3>
        <span className="font-mono text-xs text-muted">{rows.length}</span>
      </div>
      <div className="divide-y divide-foreground/[.07]">
        <AnimatePresence initial={false}>{shown.map((s, i) => <ServiceRow key={s.name + s.price + i} s={s} />)}</AnimatePresence>
      </div>
      {rows.length > PREVIEW && (
        <button onClick={() => setAll(v => !v)} className="my-2 text-sm font-semibold text-leaf underline-offset-4 hover:underline">
          {all ? 'Свернуть' : `Ещё ${rows.length - PREVIEW}`}
        </button>
      )}
    </div>
  )
}

export function Services() {
  const [filter, setFilter] = useState('hits')
  const [range, setRange] = useState('all')
  const [q, setQ] = useState('')

  const groups = useMemo(() => {
    const r = PRICE_RANGES.find(x => x.id === range)!
    const s = q.trim().toLowerCase()
    const inRange = (x: Row) => range === 'all' || (x.price !== null && x.price >= r.min && x.price < r.max)
    if (s.length >= 2) {
      const rows = ALL.filter(x => x.name.toLowerCase().includes(s) && inRange(x))
      return rows.length ? [{ title: `Найдено: ${rows.length}`, rows }] : []
    }
    if (filter === 'hits') {
      const rows = ALL.filter(x => x.hit && inRange(x))
      // hits are split by the same families as the filters
      return FILTERS.slice(1).map(f => ({ title: f.label, rows: rows.filter(x => f.cats.includes(x.cat)) })).filter(g => g.rows.length)
    }
    const f = FILTERS.find(x => x.id === filter)!
    return CATEGORIES.filter(c => f.cats.includes(c.id))
      .map(c => ({ title: c.title, rows: ALL.filter(x => x.cat === c.id && inRange(x)).sort((a, b) => Number(b.hit) - Number(a.hit)) }))
      .filter(g => g.rows.length)
  }, [filter, range, q])

  // greedy balance: each group goes to the shorter stack (a group shows at most PREVIEW rows at first)
  const stacks = useMemo(() => {
    const out: (typeof groups)[] = [[], []]
    const h = [0, 0]
    for (const g of groups) {
      const i = h[0] <= h[1] ? 0 : 1
      out[i].push(g)
      h[i] += Math.min(g.rows.length, PREVIEW) + 2
    }
    return out
  }, [groups])

  return (
    <Section id="services">
      <SplitReveal text="Услуги и цены" className={H2} />
      <Reveal className="mt-10 space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0" role="tablist" aria-label="Направления">
            {FILTERS.map(f => {
              const on = filter === f.id && !q
              return (
                <button key={f.id} role="tab" aria-selected={on} onClick={() => { setFilter(f.id); setQ('') }}
                  className={cn('flex h-11 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors',
                    on ? (f.id === 'hits' ? 'bg-lime text-foreground' : 'bg-foreground text-background') : 'glass text-foreground/80 hover:text-foreground')}>
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
              className="glass h-11 w-full rounded-full pl-11 pr-4 text-sm outline-none placeholder:text-muted" />
          </label>
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0" role="radiogroup" aria-label="Цена">
          {PRICE_RANGES.map(p => (
            <button key={p.id} role="radio" aria-checked={range === p.id} onClick={() => setRange(p.id)}
              className={cn('h-9 shrink-0 rounded-full border px-4 tabular-nums text-xs font-medium transition-colors',
                range === p.id ? 'border-foreground bg-foreground/5' : 'border-foreground/15 text-muted hover:text-foreground')}>
              {p.label}
            </button>
          ))}
        </div>
      </Reveal>

      {groups.length === 0 ? (
        <div className="glass mt-8 rounded-[28px] p-8">
          <p className="font-display font-bold uppercase">Ничего не нашлось</p>
          <p className="mt-2 text-muted">Попробуйте другую цену или слово: «окрашивание», «брови», «пилинг». Или позвоните, мы подскажем: <a href={BRAND.phoneHref} className="font-semibold text-foreground">{BRAND.phone}</a></p>
        </div>
      ) : (
        // two stacks balanced by visible rows; CSS columns are avoided because WebKit mis-paints glass cards inside them
        <div className="mt-8 grid items-start gap-3 lg:grid-cols-2">
          {[0, 1].map(col => (
            <div key={col} className={cn('grid gap-3', col === 1 && 'hidden lg:grid')}>
              {stacks[col].map(g => <Group key={filter + range + q + g.title} title={g.title} rows={g.rows} />)}
            </div>
          ))}
          <div className="grid gap-3 lg:hidden">
            {stacks[1].map(g => <Group key={'m' + filter + range + q + g.title} title={g.title} rows={g.rows} />)}
          </div>
        </div>
      )}
    </Section>
  )
}

/* gallery ----------------------------------------------------------- */

export function Gallery() {
  return (
    <section id="gallery" className="scroll-mt-24 pt-28 md:pt-40">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SplitReveal text="Работы мастеров" className={H2} />
      </div>
      <div className="mt-6">
        <Gallery2D items={GALLERY} />
      </div>
    </section>
  )
}

/* team -------------------------------------------------------------- */

export function Team() {
  return (
    <Section id="team">
      <SplitReveal text="Мастера" className={H2} />
      <div className="mt-12 grid gap-3 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-3">
          {TEAM.map((m, i) => (
            <Reveal key={m.id} delay={i * 0.05}>
              <div className="glass flex items-center gap-5 rounded-[28px] p-5 md:p-6">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-lime font-display text-xl font-bold">{m.name[0]}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base font-bold uppercase leading-tight">{m.name}</p>
                  <p className="mt-0.5 tabular-nums text-xs uppercase tracking-wider text-leaf">{m.role}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{m.note}</p>
                </div>
                <button onClick={() => booking.open({ master: m.id, cat: m.cats[0] })} aria-label={`Записаться к мастеру ${m.name}`}
                  className="hidden h-11 shrink-0 items-center gap-1 rounded-full border border-foreground/20 px-4 text-sm font-semibold transition-colors hover:bg-foreground hover:text-background sm:flex">
                  Записаться <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1} className="grid grid-cols-2 gap-3">
          <img src={INTERIOR[1].src} alt="Зал стилистов" loading="lazy" className="col-span-2 h-72 w-full rounded-[28px] object-cover lg:h-[26rem]" />
          <img src={INTERIOR[2].src} alt="Маникюрная зона" loading="lazy" className="h-56 w-full rounded-[28px] object-cover lg:h-72" />
          <img src={INTERIOR[3].src} alt="Кабинет косметолога" loading="lazy" className="h-56 w-full rounded-[28px] object-cover lg:h-72" />
        </Reveal>
      </div>
    </Section>
  )
}

/* reviews ----------------------------------------------------------- */

function ReviewCard({ r }: { r: (typeof REVIEWS)[number] }) {
  const [open, setOpen] = useState(false)
  return (
    <figure className="glass flex w-[min(84vw,24rem)] shrink-0 snap-start flex-col rounded-[28px] p-7">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-foreground/5 px-3 py-1 font-mono text-[.7rem] uppercase tracking-wider">{r.tag}</span>
        <span className="flex gap-0.5" aria-label="5 из 5">{Array.from({ length: 5 }, (_, i) => <Star key={i} className="h-3.5 w-3.5 fill-foreground" />)}</span>
      </div>
      <blockquote className={cn('mt-5 flex-1 leading-relaxed', !open && 'line-clamp-3')}>«{r.text}»</blockquote>
      <button onClick={() => setOpen(v => !v)} className="mt-2 self-start text-xs font-semibold text-leaf underline-offset-4 hover:underline">{open ? 'Свернуть' : 'Читать полностью'}</button>
      <figcaption className="mt-5 text-sm"><b>{r.author}</b><span className="block tabular-nums text-xs text-muted">{r.date}</span></figcaption>
    </figure>
  )
}

function LiveReviews() {
  const [ready, setReady] = useState(false)
  return (
    <div className="glass relative mx-auto h-[760px] w-full max-w-[560px] overflow-hidden rounded-[28px]">
      {!ready && (
        <div className="absolute inset-0 space-y-4 p-7" aria-hidden>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="animate-pulse space-y-2 rounded-[20px] bg-white/50 p-5">
              <div className="h-3 w-1/3 rounded-full bg-foreground/10" /><div className="h-3 w-full rounded-full bg-foreground/10" /><div className="h-3 w-4/5 rounded-full bg-foreground/10" />
            </div>
          ))}
        </div>
      )}
      <iframe title="Свежие отзывы о салоне «Груша»" src={`https://yandex.ru/maps-reviews-widget/${BRAND.yandexId}?comments`} loading="lazy" onLoad={() => setReady(true)}
        className={cn('h-full w-full border-0 transition-opacity duration-500', ready ? 'opacity-100' : 'opacity-0')} />
    </div>
  )
}

export function Reviews() {
  const [tab, setTab] = useState<'best' | 'live'>('best')
  return (
    <section id="reviews" className="scroll-mt-24 pt-28 md:pt-40">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SplitReveal text="Отзывы гостей" className={H2} />
        <Reveal className="mt-10 grid gap-3 lg:grid-cols-[auto_1fr]">
          <div className="glass-dark flex items-center gap-6 rounded-[28px] p-7 text-background">
            <span className="font-display text-7xl font-bold leading-none"><CountUp value={5} decimals={1} /></span>
            <div>
              <span className="flex gap-1">{Array.from({ length: 5 }, (_, i) => <Star key={i} className="h-4 w-4 fill-lime text-lime" />)}</span>
              <p className="mt-2 tabular-nums text-sm text-background/70"><CountUp value={BRAND.ratings} /> оценок<br /><CountUp value={BRAND.reviews} /> {reviewWord(BRAND.reviews)}</p>
            </div>
          </div>
          <div className="glass rounded-[28px] p-6">
            <p className="font-display text-sm font-bold uppercase">О чём пишут чаще всего</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {THEMES.map(t => (
                <li key={t.label} className="flex items-center gap-2 rounded-full border border-foreground/10 bg-white/50 py-2 pl-4 pr-2 text-sm font-medium">
                  {t.label}
                  <span className="rounded-full bg-foreground px-2 py-0.5 tabular-nums text-xs text-background">{t.count} {reviewWord(t.count)}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <div className="glass mt-8 inline-flex rounded-full p-1" role="tablist" aria-label="Отзывы">
          {([['best', 'Избранные'], ['live', 'Все свежие']] as const).map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
              className={cn('h-10 rounded-full px-5 text-sm font-semibold transition-colors', tab === id ? 'bg-foreground text-background' : 'text-muted hover:text-foreground')}>{label}</button>
          ))}
        </div>
      </div>
      {tab === 'best' ? (
        <div className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-6 md:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]" role="tabpanel">
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
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <SplitReveal text="Перед визитом" className={H2} />
          <Reveal className="glass-dark mt-10 rounded-[28px] p-7 text-background">
            <p className="font-display text-lg font-bold uppercase">Не нашли ответ?</p>
            <p className="mt-2 text-sm text-background/70">Администратор ответит на вопросы и подберёт мастера под вашу задачу.</p>
            <a href={BRAND.phoneHref} className="mt-5 flex h-12 items-center justify-center gap-2 rounded-full bg-lime tabular-nums text-sm font-semibold text-foreground"><Phone className="h-4 w-4" /> {BRAND.phone}</a>
          </Reveal>
        </div>
        <div className="space-y-3">
          {FAQ.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.04}>
              <div className="glass rounded-[28px]">
                <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 p-6 text-left">
                  <span className="font-display text-sm font-bold uppercase md:text-base">{f.q}</span>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-foreground/15">{open === i ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}</span>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                      <p className="max-w-[60ch] px-6 pb-6 leading-relaxed text-muted">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* contacts + footer ------------------------------------------------- */

export function Contacts() {
  const status = useOpenStatus()
  return (
    <Section id="contacts">
      <SplitReveal text="Как нас найти" className={H2} />
      <div className="mt-10 grid gap-3 lg:grid-cols-[1fr_1.35fr]">
        <Reveal className="glass flex flex-col rounded-[28px] p-7 md:p-9">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <span className={status.open ? 'live-dot h-2 w-2 rounded-full bg-leaf' : 'h-2 w-2 rounded-full bg-foreground/30'} aria-hidden />{status.label}
          </p>
          <div className="mt-8 space-y-6">
            <div className="flex gap-4"><MapPin className="mt-1 h-5 w-5 shrink-0 text-leaf" /><div><p className="font-display font-bold uppercase leading-snug">{BRAND.address}</p><p className="mt-1 text-sm text-muted">Вход с торца дома. Остановка «Улица Павлова» в 140 м, рядом парковка.</p></div></div>
            <div className="flex gap-4"><Phone className="mt-1 h-5 w-5 shrink-0 text-leaf" /><div><a href={BRAND.phoneHref} className="tabular-nums text-lg font-semibold">{BRAND.phone}</a><p className="mt-1 text-sm text-muted">{BRAND.hours}</p></div></div>
          </div>
          <div className="mt-auto flex flex-wrap gap-3 pt-10">
            <button onClick={() => booking.open()} className="sheen h-12 rounded-full bg-foreground px-7 text-sm font-semibold text-background">Записаться</button>
            <a href={BRAND.routeUrl} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center gap-2 rounded-full border border-foreground/20 px-6 text-sm font-semibold transition-colors hover:border-foreground"><Navigation className="h-4 w-4" /> Маршрут</a>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="relative min-h-[440px] overflow-hidden rounded-[28px] bg-mint">
          <iframe title="Салон «Груша» на карте" src="https://yandex.ru/map-widget/v1/?ll=37.454721%2C55.909821&z=17&pt=37.454721%2C55.909821%2Cpm2grm" loading="lazy" className="absolute inset-0 h-full w-full border-0" />
        </Reveal>
      </div>
    </Section>
  )
}

export function Footer() {
  return (
    <footer className="mx-auto mt-28 max-w-7xl px-4 pb-28 md:px-6 md:pb-10">
      <div className="glass-dark rounded-[28px] p-8 text-background md:p-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <Logo className="text-[clamp(2.5rem,8vw,6rem)] leading-none text-background" />
            <p className="mt-4 text-sm text-background/60">Салон красоты. {BRAND.address}</p>
          </div>
          <nav aria-label="Разделы в подвале" className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm text-background/70">
            {NAV.map(n => <a key={n.href} href={n.href} className="hover:text-lime">{n.label}</a>)}
            <a href={BRAND.phoneHref} className="tabular-nums hover:text-lime">{BRAND.phone}</a>
          </nav>
        </div>
        <p className="mt-10 tabular-nums text-xs text-background/40">© 2026 Груша</p>
      </div>
    </footer>
  )
}
