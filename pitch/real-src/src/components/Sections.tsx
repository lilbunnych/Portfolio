import { useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, Bike, Car, Cat, Check, Flame, HandHeart, MapPin, Minus, Navigation, Phone, Plus, Search, Sparkles, Star, Waves, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BRAND, FAQ, FILTERS, GALLERY, INTERIOR, NAV, POPULAR, PRICE_RANGES, REVIEWS, TEAM, THEMES, reviewWord } from '@/data'
import { CATEGORIES, type Service } from '@/prices'
import { booking, useBooking } from '@/store'
import { rub } from '@/hooks'
import { CountUp, Reveal, SplitReveal } from './TextFx'
import { Gallery2D } from './Gallery2D'
import { useOpenStatus } from './Hero'

const H2 = 'font-display text-[clamp(2.2rem,5.6vw,5.2rem)] uppercase leading-[.95] tracking-[-0.02em]'

function Section({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return <section id={id} className={cn('mx-auto max-w-7xl scroll-mt-24 px-4 pt-24 md:px-6 md:pt-36', className)}>{children}</section>
}

function Head({ kicker, title, aside }: { kicker: string; title: string; aside?: ReactNode }) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className="inline-block -rotate-2 rounded-lg bg-foreground px-3 py-1 font-mono text-xs uppercase tracking-[.18em] text-background">{kicker}</p>
        <SplitReveal text={title} className={cn(H2, 'mt-4')} />
      </div>
      {aside}
    </div>
  )
}

/* "real" means genuine: numbers from reviews + perks -------------------- */

const FACTS = [
  { value: 700, prefix: 'от ', suffix: ' ₽', label: 'модельная стрижка. Стрижка и борода вместе 1 200 ₽' },
  { value: 4, prefix: '3-', suffix: ' года', label: 'ходят к одному барберу, судя по отзывам постоянных клиентов' },
  { value: 80, prefix: '', suffix: ' км', label: 'проехали гости, которым посоветовали это место знакомые' },
]

const PERKS = [
  { icon: HandHeart, title: 'Массаж после стрижки', text: 'Клиенты пишут, что массаж после стрижки буквально реанимирует.' },
  { icon: Waves, title: 'Фитобочка', text: 'Оздоровительная паровая бочка прямо в барбершопе. Цены у администратора.' },
  { icon: Car, title: 'Кресло-машинка', text: 'Детей стрижём в кресле-автомобиле, и можно сделать рисунок на волосах.' },
  { icon: Bike, title: 'Парковка и велопарковка', text: 'Рядом с домом 5 на Марии Рубцовой, от «Стокманна» пять минут.' },
  { icon: Cat, title: 'Можно с кошкой', text: 'Только с кошкой. Такие правила, мы не спорим.' },
]

export function Why() {
  return (
    <Section id="why">
      <Head kicker="Real = настоящий" title="Всё по-настоящему" aside={<p className="max-w-sm shrink-0 text-muted lg:w-80 lg:text-right">Без пафоса и накруток: нормальные цены, мастера, к которым возвращаются годами, и массаж после стрижки.</p>} />
      <div className="mt-12 grid gap-3 md:grid-cols-3">
        {FACTS.map((f, i) => (
          <Reveal key={f.label} delay={i * 0.06} className={cn('rounded-3xl p-7', i === 0 ? 'bg-accent text-white' : 'glass')}>
            <p className="whitespace-nowrap font-display text-[clamp(2.4rem,4.6vw,4rem)] leading-none">{f.prefix}<CountUp value={f.value} />{f.suffix}</p>
            <p className={cn('mt-4 text-sm leading-relaxed', i === 0 ? 'text-white/85' : 'text-muted')}>{f.label}</p>
          </Reveal>
        ))}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {PERKS.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.05} className="glass rounded-3xl p-6">
            <p.icon className="h-6 w-6 text-red" strokeWidth={1.75} />
            <p className="mt-5 font-display text-lg leading-tight">{p.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{p.text}</p>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

/* services as a receipt builder --------------------------------------- */

type Row = Service & { cat: string; catTitle: string; hit: boolean }
const ALL: Row[] = CATEGORIES.flatMap(c => c.items.map(i => ({ ...i, cat: c.id, catTitle: c.title, hit: (POPULAR[c.id] ?? []).includes(i.name) })))
const same = (a: { name: string; cat: string }, b: { name: string; cat: string }) => a.name === b.name && a.cat === b.cat

function ServiceCard({ s }: { s: Row }) {
  const b = useBooking()
  const on = b.cart.some(c => same(c, s))
  return (
    <motion.button layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
      onClick={() => booking.toggle({ name: s.name, desc: s.desc, price: s.price, from: s.from, cat: s.cat })} aria-pressed={on}
      className={cn('group flex min-h-36 flex-col rounded-3xl border p-5 text-left transition-colors', on ? 'border-foreground bg-foreground text-background' : 'border-foreground/10 bg-card hover:border-foreground/40')}>
      <span className="flex items-start justify-between gap-3">
        <span className="font-semibold leading-snug">{s.name}</span>
        <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors', on ? 'border-red bg-red text-white' : 'border-foreground/20 group-hover:border-foreground')}>
          {on ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </span>
      </span>
      {s.desc && <span className={cn('mt-1 text-sm leading-relaxed', on ? 'text-background/65' : 'text-muted')}>{s.desc}</span>}
      <span className="mt-auto flex items-end justify-between pt-4">
        <span className="font-display text-2xl leading-none">{s.from && <span className="text-base">от </span>}{rub(s.price)}</span>
        {s.hit && <span className="flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 font-mono text-[.6rem] uppercase tracking-wider text-white"><Flame className="h-3 w-3" /> хит</span>}
      </span>
    </motion.button>
  )
}

function Receipt() {
  const b = useBooking()
  const total = b.cart.reduce((s, c) => s + (c.price ?? 0), 0)
  const from = b.cart.some(c => c.from)
  const now = new Date().toLocaleDateString('ru-RU')
  return (
    <div className="sticky top-24">
      <div className="zigzag rotate-1 bg-white px-6 pb-10 pt-7 font-mono text-[.8rem] text-foreground shadow-[0_30px_60px_-30px_rgb(17_16_16/.45)]">
        <p className="text-center font-display text-3xl tracking-wide text-red">REAL</p>
        <p className="mt-1 text-center text-[.7rem] uppercase tracking-[.2em] text-muted">барбершоп · {BRAND.address.replace('Химки, ', '')}</p>
        <p className="mt-4 flex justify-between border-y border-dashed border-foreground/30 py-2 text-[.7rem] uppercase tracking-wider text-muted"><span>Чек визита</span><span>{now}</span></p>
        <ul className="min-h-24 py-3" aria-live="polite">
          <AnimatePresence initial={false}>
            {b.cart.length === 0 && (
              <motion.li key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-6 text-center text-muted">
                Нажмите на услугу,<br />и она появится в чеке
              </motion.li>
            )}
            {b.cart.map(c => (
              <motion.li key={c.cat + c.name} layout initial={{ opacity: 0, y: -12, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, x: 30 }}
                className="group flex items-baseline gap-2 py-1.5">
                <span className="min-w-0 flex-1">{c.name}</span>
                <span className="shrink-0 tabular-nums">{c.from ? 'от ' : ''}{rub(c.price)}</span>
                <button onClick={() => booking.toggle(c)} aria-label={`Убрать «${c.name}»`} className="shrink-0 text-muted opacity-60 hover:text-red hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <p className="flex items-baseline justify-between border-t border-dashed border-foreground/30 pt-3 text-base font-bold uppercase">
          <span>Итого</span><span className="font-display text-2xl tabular-nums">{from ? 'от ' : ''}{rub(total)}</span>
        </p>
        {/* decorative barcode */}
        <div aria-hidden className="mx-auto mt-5 h-10 w-44 bg-[repeating-linear-gradient(90deg,#111_0_2px,transparent_2px_4px,#111_4px_5px,transparent_5px_8px,#111_8px_11px,transparent_11px_12px)]" />
        <p className="mt-2 text-center text-[.65rem] uppercase tracking-[.3em] text-muted">спасибо, что вы настоящие</p>
      </div>
      <button onClick={() => booking.open()} disabled={!b.cart.length}
        className="sheen mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-accent font-semibold text-white transition-opacity disabled:opacity-40">
        Записаться с этим чеком <ArrowUpRight className="h-4 w-4" />
      </button>
    </div>
  )
}

export function Services() {
  const [filter, setFilter] = useState('all')
  const [range, setRange] = useState('all')
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    const r = PRICE_RANGES.find(x => x.id === range)!
    const s = q.trim().toLowerCase()
    const inRange = (x: Row) => range === 'all' || (x.price !== null && x.price >= r.min && x.price < r.max)
    if (s.length >= 2) return ALL.filter(x => x.name.toLowerCase().includes(s) && inRange(x))
    const f = FILTERS.find(x => x.id === filter)!
    return ALL.filter(x => f.cats.includes(x.cat) && inRange(x))
  }, [filter, range, q])

  return (
    <Section id="services">
      <Head kicker="Прайс" title="Соберите свой чек" aside={<p className="max-w-sm shrink-0 text-muted lg:w-80 lg:text-right">Нажимайте на услуги, и они печатаются в чек. Итог сразу видно, записаться можно в один клик.</p>} />
      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div className="min-w-0">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0" role="tablist" aria-label="Направления">
              {FILTERS.map(f => {
                const on = filter === f.id && !q
                return (
                  <button key={f.id} role="tab" aria-selected={on} onClick={() => { setFilter(f.id); setQ('') }}
                    className={cn('h-11 shrink-0 rounded-full border-2 px-5 text-sm font-semibold transition-colors', on ? 'border-foreground bg-foreground text-background' : 'border-foreground/15 hover:border-foreground/50')}>
                    {f.label}
                  </button>
                )
              })}
            </div>
            <label className="relative block md:w-60">
              <span className="sr-only">Поиск по услугам</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Найти услугу"
                className="h-11 w-full rounded-full border-2 border-foreground/15 bg-card pl-11 pr-4 text-sm outline-none placeholder:text-muted focus:border-foreground" />
            </label>
          </div>
          <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0" role="radiogroup" aria-label="Цена">
            {PRICE_RANGES.map(p => (
              <button key={p.id} role="radio" aria-checked={range === p.id} onClick={() => setRange(p.id)}
                className={cn('h-8 shrink-0 rounded-full px-3 font-mono text-xs transition-colors', range === p.id ? 'bg-accent text-white' : 'text-muted hover:text-foreground')}>
                {p.label}
              </button>
            ))}
          </div>
          {rows.length === 0 ? (
            <div className="glass mt-6 rounded-3xl p-8">
              <p className="font-display text-xl">Ничего не нашлось</p>
              <p className="mt-2 text-muted">Попробуйте «стрижка» или «борода». Или позвоните: <a href={BRAND.phoneHref} className="font-semibold text-foreground">{BRAND.phone}</a></p>
            </div>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence initial={false} mode="popLayout">
                {rows.map(s => <ServiceCard key={s.cat + s.name} s={s} />)}
              </AnimatePresence>
            </div>
          )}
        </div>
        <Receipt />
      </div>
    </Section>
  )
}

/* gallery ----------------------------------------------------------- */

export function Gallery() {
  return (
    <section id="gallery" className="scroll-mt-24 pt-24 md:pt-36">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Head kicker="Работы и место" title="Как у нас" />
      </div>
      <div className="mt-8"><Gallery2D items={GALLERY} /></div>
    </section>
  )
}

/* team -------------------------------------------------------------- */

export function Team() {
  return (
    <Section id="team">
      <Head kicker="Барберы" title="К кому записаться" />
      <div className="mt-12 grid gap-3 lg:grid-cols-3">
        {TEAM.map((m, i) => (
          <Reveal key={m.id} delay={i * 0.06} className={cn('flex flex-col rounded-3xl p-7', i === 0 ? 'bg-foreground text-background' : 'glass')}>
            <div className="flex items-center justify-between">
              <span className={cn('grid h-16 w-16 -rotate-3 place-items-center rounded-2xl font-display text-3xl', i === 0 ? 'bg-accent text-white' : 'bg-sand')}>{m.name[0]}</span>
              {i === 0 && <span className="flex items-center gap-1 rounded-full bg-accent px-3 py-1 font-mono text-[.65rem] uppercase tracking-wider text-white"><Sparkles className="h-3 w-3" /> легенда отзывов</span>}
            </div>
            <p className="mt-6 font-display text-3xl leading-none">{m.name}</p>
            <p className={cn('mt-2 font-mono text-xs uppercase tracking-[.15em]', i === 0 ? 'text-background/60' : 'text-red')}>{m.role}</p>
            <p className={cn('mt-4 flex-1 leading-relaxed', i === 0 ? 'text-background/75' : 'text-muted')}>{m.note}</p>
            <button onClick={() => booking.open({ master: m.id, cat: m.cats[0] })}
              className={cn('mt-6 flex h-12 items-center justify-center gap-2 rounded-full border-2 font-semibold transition-colors',
                i === 0 ? 'border-background hover:bg-background hover:text-foreground' : 'border-foreground hover:bg-foreground hover:text-background')}>
              Записаться к мастеру <ArrowUpRight className="h-4 w-4" />
            </button>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        {INTERIOR.map(p => <img key={p.src} src={p.src} alt={p.title} loading="lazy" className="aspect-square w-full rounded-3xl object-cover" />)}
      </Reveal>
    </Section>
  )
}

/* reviews ----------------------------------------------------------- */

function ReviewCard({ r, i }: { r: (typeof REVIEWS)[number]; i: number }) {
  const [open, setOpen] = useState(false)
  return (
    <figure className={cn('flex w-[min(84vw,24rem)] shrink-0 snap-start flex-col rounded-3xl p-7', i % 3 === 1 ? 'bg-foreground text-background' : 'glass')}>
      <span className={cn('self-start rounded-full px-3 py-1 font-mono text-[.65rem] uppercase tracking-wider', i % 3 === 1 ? 'bg-accent text-white' : 'bg-sand')}>{r.tag}</span>
      <blockquote className={cn('mt-5 flex-1 leading-relaxed', !open && 'line-clamp-4')}>«{r.text}»</blockquote>
      <button onClick={() => setOpen(v => !v)} className="mt-3 self-start text-xs font-semibold underline underline-offset-4 opacity-70 hover:opacity-100">{open ? 'Свернуть' : 'Читать полностью'}</button>
      <figcaption className="mt-5 text-sm"><b>{r.author}</b><span className="block font-mono text-xs opacity-60">{r.date}</span></figcaption>
    </figure>
  )
}

function LiveReviews() {
  const [ready, setReady] = useState(false)
  return (
    <div className="glass relative mx-auto h-[760px] w-full max-w-[560px] overflow-hidden rounded-3xl">
      {!ready && <div className="absolute inset-0 animate-pulse bg-sand" aria-hidden />}
      <iframe title="Свежие отзывы о барбершопе РЕАЛ" src={`https://yandex.ru/maps-reviews-widget/${BRAND.yandexId}?comments`} loading="lazy" onLoad={() => setReady(true)}
        className={cn('h-full w-full border-0 transition-opacity duration-500', ready ? 'opacity-100' : 'opacity-0')} />
    </div>
  )
}

export function Reviews() {
  const [tab, setTab] = useState<'best' | 'live'>('best')
  return (
    <section id="reviews" className="scroll-mt-24 pt-24 md:pt-36">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Head kicker="Отзывы" title="Что говорят гости" />
        <Reveal className="mt-10 grid gap-3 lg:grid-cols-[auto_1fr]">
          <div className="flex items-center gap-6 rounded-3xl bg-accent p-7 text-white">
            <span className="font-display text-7xl leading-none"><CountUp value={BRAND.ratingValue} decimals={1} /></span>
            <div>
              <span className="flex gap-1">{Array.from({ length: 5 }, (_, i) => <Star key={i} className="h-4 w-4 fill-white text-white" />)}</span>
              <p className="mt-2 tabular-nums text-sm text-white/85"><CountUp value={BRAND.ratings} /> оценок<br /><CountUp value={BRAND.reviews} /> {reviewWord(BRAND.reviews)}</p>
              <p className="mt-2 font-mono text-[.65rem] uppercase tracking-[.2em]">Хорошее место 2026</p>
            </div>
          </div>
          <div className="glass rounded-3xl p-6">
            <p className="font-mono text-xs uppercase tracking-[.18em] text-muted">О чём пишут чаще всего</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {THEMES.map(t => (
                <li key={t.label} className="flex items-center gap-2 rounded-full border border-foreground/10 py-2 pl-4 pr-2 text-sm font-medium">
                  {t.label}<span className="rounded-full bg-foreground px-2 py-0.5 tabular-nums text-xs text-background">{t.count} {reviewWord(t.count)}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <div className="mt-8 inline-flex rounded-full border-2 border-foreground/15 p-1" role="tablist" aria-label="Отзывы">
          {([['best', 'Избранные'], ['live', 'Все свежие']] as const).map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
              className={cn('h-10 rounded-full px-5 text-sm font-semibold transition-colors', tab === id ? 'bg-foreground text-background' : 'text-muted hover:text-foreground')}>{label}</button>
          ))}
        </div>
      </div>
      {tab === 'best' ? (
        <div className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-6 md:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]" role="tabpanel">
          {REVIEWS.map((r, i) => <ReviewCard key={r.author + r.date} r={r} i={i} />)}
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
      <Head kicker="FAQ" title="Перед визитом" />
      <div className="mt-10 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          {FAQ.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.04}>
              <div className="glass rounded-3xl">
                <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 p-6 text-left">
                  <span className="font-display text-lg md:text-xl">{f.q}</span>
                  <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors', open === i ? 'bg-accent text-white' : 'border-2 border-foreground/15')}>{open === i ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}</span>
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
        <Reveal className="glass-dark self-start rounded-3xl p-8">
          <p className="font-display text-3xl leading-none">Не нашли ответ?</p>
          <p className="mt-3 text-sm opacity-70">Позвоните, подскажем по стрижке, массажу и фитобочке.</p>
          <a href={BRAND.phoneHref} className="mt-6 flex h-14 items-center justify-center gap-2 rounded-full bg-accent tabular-nums font-semibold text-white"><Phone className="h-4 w-4" /> {BRAND.phone}</a>
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
      <Head kicker="Контакты" title="Как добраться" />
      <div className="mt-10 grid gap-3 lg:grid-cols-[1fr_1.35fr]">
        <Reveal className="glass flex flex-col rounded-3xl p-7 md:p-9">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <span className={status.open ? 'live-dot h-2 w-2 rounded-full bg-red' : 'h-2 w-2 rounded-full bg-foreground/30'} aria-hidden />{status.label}
          </p>
          <div className="mt-8 space-y-6">
            <div className="flex gap-4"><MapPin className="mt-1 h-5 w-5 shrink-0 text-red" /><div><p className="font-display text-xl leading-tight">{BRAND.address}</p><p className="mt-1 text-sm text-muted">{BRAND.addressNote}.</p></div></div>
            <div className="flex gap-4"><Phone className="mt-1 h-5 w-5 shrink-0 text-red" /><div><a href={BRAND.phoneHref} className="tabular-nums text-lg font-semibold">{BRAND.phone}</a><p className="mt-1 text-sm text-muted">{BRAND.hours}</p></div></div>
          </div>
          <div className="mt-auto flex flex-wrap gap-3 pt-10">
            <button onClick={() => booking.open()} className="sheen h-12 rounded-full bg-accent px-7 font-semibold text-white">Записаться</button>
            <a href={BRAND.routeUrl} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center gap-2 rounded-full border-2 border-foreground px-6 font-semibold transition-colors hover:bg-foreground hover:text-background"><Navigation className="h-4 w-4" /> Маршрут</a>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="relative min-h-[440px] overflow-hidden rounded-3xl bg-sand">
          <iframe title="Барбершоп РЕАЛ на карте" src={`https://yandex.ru/map-widget/v1/?ll=${BRAND.coords[1]}%2C${BRAND.coords[0]}&z=17&pt=${BRAND.coords[1]}%2C${BRAND.coords[0]}%2Cpm2rdm`} loading="lazy" className="absolute inset-0 h-full w-full border-0" />
        </Reveal>
      </div>
    </Section>
  )
}

export function Footer() {
  return (
    <footer className="mt-28 overflow-hidden bg-foreground pb-20 text-background sm:pb-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 pt-12 md:flex-row md:items-start md:justify-between md:px-6">
        <p className="text-sm text-background/60">Барбершоп РЕАЛ<br />{BRAND.address}<br />{BRAND.hours}</p>
        <nav aria-label="Разделы в подвале" className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm text-background/70">
          {NAV.map(n => <a key={n.href} href={n.href} className="hover:text-white">{n.label}</a>)}
          <a href={BRAND.phoneHref} className="tabular-nums hover:text-white">{BRAND.phone}</a>
        </nav>
      </div>
      <p aria-hidden className="mt-6 select-none text-center font-display text-[30vw] leading-[.8] tracking-[-0.04em] text-red">REAL</p>
    </footer>
  )
}
