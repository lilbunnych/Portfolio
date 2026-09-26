import { useMemo, useRef, useState } from 'react'
import { BRAND, DIRECTIONS, PERKS, REVIEWS, TEAM, TRAIL, WORKS, img } from '../data'
import type { Work } from '../data'
import { booking } from '../store'
import { scrollToId } from '../hooks'
import { Heading, Reveal } from '../ui/Reveal'
import HoverExpandGallery from '../ui/HoverExpandGallery'
import { ImageTrail } from '../ui/ImageTrail'

const rub = (n: number) => n.toLocaleString('ru-RU') + ' ₽'
const Wrap = ({ id, children, className = '' }: { id?: string; children: React.ReactNode; className?: string }) => (
  <section id={id} className={`mx-auto max-w-[80rem] px-5 pt-24 md:px-10 lg:pt-36 ${className}`}>{children}</section>
)

const Arrow = () => <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2}><path d="M5 12h14M13 6l6 6-6 6" /></svg>

/** Nine directions; each opens the booking wizard on its category. */
export function Directions() {
  const open = (id: string) => { booking.set({ cat: id, step: 0 }); scrollToId('booking') }
  return (
    <Wrap id="services">
      <Heading eyebrow="Услуги" title={<>Всё для красоты <em className="text-primary">в одной студии</em></>} note="Девять направлений и больше трёхсот услуг. Выберите направление — откроем запись сразу на нужном шаге." />
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {DIRECTIONS.map((d, i) => (
          <Reveal key={d.id} delay={(i % 3) * 70}>
            <button onClick={() => open(d.id)} className="card card-hover group relative flex h-full w-full flex-col overflow-hidden text-left">
              <div className="relative h-44 overflow-hidden border-b-2 border-foreground">
                <img src={img(d.photo)} alt="" loading="lazy" className="size-full object-cover grayscale-[35%] transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0" />
                <span className="absolute top-3 left-3 bg-cream px-2 py-1 font-mono text-[.7rem] tracking-[.12em]">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-[1.65rem]">{d.title}</h3>
                <p className="mt-2 flex-1 text-[.93rem] text-muted-foreground">{d.text}</p>
                <div className="mt-5 flex items-center justify-between border-t-2 border-dashed border-foreground/25 pt-4">
                  <span className="font-mono text-[.85rem]">от <b className="text-[1.05rem]">{rub(d.from)}</b></span>
                  <span className="flex items-center gap-2 text-[.88rem] font-semibold text-primary transition-transform group-hover:translate-x-1">Записаться <Arrow /></span>
                </div>
              </div>
            </button>
          </Reveal>
        ))}
      </div>
    </Wrap>
  )
}

const FILTERS: { id: 'all' | Work['cat']; label: string }[] = [
  { id: 'all', label: 'Все' }, { id: 'hair', label: 'Волосы' }, { id: 'nails', label: 'Ногти' }, { id: 'brows', label: 'Брови и ресницы' }, { id: 'face', label: 'Лицо и макияж' },
]

/** Portfolio: filter chips + the hover-expand gallery from 21st.dev. */
export function Works() {
  const [f, setF] = useState<(typeof FILTERS)[number]['id']>('all')
  const items = useMemo(() => WORKS.filter(w => f === 'all' || w.cat === f).slice(0, 9).map(w => ({ title: w.title, meta: w.meta, src: img(w.photo), alt: w.title })), [f])
  return (
    <Wrap id="works">
      <Heading eyebrow="Портфолио" title={<>Работы <em className="text-primary">наших мастеров</em></>} note="Реальные фото из студии. Наведите на полоску, чтобы раскрыть работу." />
      <Reveal className="mt-10 flex flex-wrap gap-3">
        {FILTERS.map(x => <button key={x.id} className="chip" aria-pressed={f === x.id} onClick={() => setF(x.id)}>{x.label}</button>)}
      </Reveal>
      <Reveal className="mt-8">
        <HoverExpandGallery key={f} items={items} />
      </Reveal>
    </Wrap>
  )
}

/** "Сияй" interlude: move the cursor and the studio's work trails behind it (image trail from 21st.dev). */
export function Shine() {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <section className="mt-24 lg:mt-36">
      <div ref={ref} className="relative flex h-[70svh] min-h-[28rem] touch-pan-y items-center justify-center overflow-hidden border-y-2 border-foreground bg-muted">
        <ImageTrail containerRef={ref} rotationRange={12} interval={70}>
          {TRAIL.map(p => (
            <div key={p} className="h-36 w-28 overflow-hidden border-2 border-foreground bg-cream shadow-hard md:h-48 md:w-36">
              <img src={img(p)} alt="" className="size-full object-cover" draggable={false} />
            </div>
          ))}
        </ImageTrail>
        <div className="pointer-events-none relative z-10 text-center select-none">
          <p className="font-mono text-[.75rem] tracking-[.2em] text-foreground/60 uppercase">Проведите курсором или пальцем</p>
          <p className="mt-2 font-serif text-[clamp(5rem,20vw,16rem)] leading-[.85] italic text-foreground mix-blend-multiply">Сияй</p>
          <p className="mt-3 font-serif text-[clamp(1.3rem,3vw,2rem)]">чёрт возьми — мы поможем</p>
        </div>
      </div>
    </section>
  )
}

export function Team() {
  const pick = (id: string, cats: string[]) => { booking.set({ master: id, cat: cats[0], step: 0 }); scrollToId('booking') }
  return (
    <Wrap id="team">
      <Heading eyebrow="Мастера" title={<>Люди, <em className="text-primary">к которым возвращаются</em></>} note="Имена и отзывы — с карточки студии на Яндекс Картах. Руководит студией основатель Кристина." />
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TEAM.map((m, i) => (
          <Reveal key={m.id} delay={(i % 4) * 60}>
            <article className="card flex h-full flex-col">
              <div className="flex items-center gap-4 border-b-2 border-foreground p-4">
                <span className={`grid size-14 shrink-0 place-items-center border-2 border-foreground font-serif text-[1.8rem] italic ${i % 3 === 0 ? 'bg-primary text-cream' : i % 3 === 1 ? 'bg-muted' : 'bg-secondary text-cream'}`}>{m.name[0]}</span>
                <div><h3 className="text-[1.4rem]">{m.name}</h3><p className="text-[.82rem] text-muted-foreground">{m.role}</p></div>
              </div>
              <blockquote className="flex-1 p-4 font-serif text-[1.05rem] leading-snug italic">«{m.quote}»</blockquote>
              <button onClick={() => pick(m.id, m.cats)} className="flex items-center justify-between border-t-2 border-foreground px-4 py-3 text-[.9rem] font-semibold transition-colors hover:bg-foreground hover:text-cream">
                Записаться к {m.dative} <Arrow />
              </button>
            </article>
          </Reveal>
        ))}
      </div>
    </Wrap>
  )
}

function ReviewCard({ r }: { r: (typeof REVIEWS)[number] }) {
  return (
    <figure className="card mx-3 w-[21rem] shrink-0 p-5 whitespace-normal">
      <div className="text-primary">★★★★★</div>
      <blockquote className="mt-3 text-[.95rem] leading-relaxed">{r.text}</blockquote>
      <figcaption className="mt-4 font-mono text-[.72rem] tracking-[.12em] text-muted-foreground uppercase">{r.name} · Яндекс Карты</figcaption>
    </figure>
  )
}

export function Reviews() {
  const half = Math.ceil(REVIEWS.length / 2)
  const rows = [REVIEWS.slice(0, half), REVIEWS.slice(half)]
  return (
    <section id="reviews" className="pt-24 lg:pt-36">
      <div className="mx-auto grid max-w-[80rem] gap-8 px-5 md:px-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <Heading eyebrow="Отзывы" title={<>{BRAND.reviews} отзывов, <em className="text-primary">и почти все — на пять</em></>} />
        <Reveal className="card flex items-center gap-5 bg-primary px-6 py-5 text-cream">
          <span className="font-serif text-[3.6rem] leading-none">{BRAND.rating}</span>
          <span className="text-[.9rem] leading-snug">★★★★★<br />{BRAND.votes} оценки<br />{BRAND.award}</span>
        </Reveal>
      </div>
      <div className="group mt-14 grid gap-6 overflow-hidden py-2">
        {rows.map((row, k) => (
          <div key={k} className={`inline-flex w-max ${k ? 'animate-marquee-rev' : 'animate-marquee'} [--marquee-duration:70s] group-hover:[animation-play-state:paused]`}>
            {[...row, ...row].map((r, i) => <ReviewCard key={i} r={r} />)}
          </div>
        ))}
      </div>
    </section>
  )
}

export function Salon() {
  const shots = ['int-neon', 'int-hall', 'int-reception', 'int-slogan', 'int-shelves', 'coffee']
  return (
    <Wrap id="salon">
      <Heading eyebrow="Студия" title={<>Мелочи, <em className="text-primary">из которых складывается сервис</em></>} />
      <div className="mt-14 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <Reveal className="grid grid-cols-3 grid-rows-2 gap-3">
          {shots.map((s, i) => (
            <div key={s} className={`overflow-hidden border-2 border-foreground ${i === 0 ? 'col-span-2 row-span-2' : ''}`}>
              <img src={img(s)} alt="Интерьер студии" loading="lazy" className="aspect-square size-full object-cover transition-transform duration-700 hover:scale-105" />
            </div>
          ))}
        </Reveal>
        <div className="grid content-start gap-4">
          <Reveal className="card bg-muted p-6">
            <p className="font-serif text-[1.35rem] leading-snug italic">«Мелочи для удобства клиента: подставка под телефон, тарелка для колечек, подушка под поясницу.»</p>
            <p className="mt-3 font-mono text-[.72rem] tracking-[.12em] text-muted-foreground uppercase">Из отзыва гостя</p>
          </Reveal>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {PERKS.map(([t, d], i) => (
              <Reveal as="li" key={t} delay={i * 50} className="border-2 border-foreground p-4">
                <b className="block">{t}</b><span className="text-[.88rem] text-muted-foreground">{d}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </Wrap>
  )
}

const SOCIAL = [
  ['WhatsApp', BRAND.whatsapp], ['Telegram', BRAND.telegram], ['ВКонтакте', BRAND.vk], ['Яндекс Карты', BRAND.maps],
]

export function Contacts() {
  const { lat, lon } = BRAND.coords
  return (
    <Wrap id="contacts">
      <div className="grid gap-6 lg:grid-cols-[.95fr_1.05fr]">
        <Reveal className="card brick flex flex-col justify-between gap-10 p-7 text-cream md:p-10">
          <div>
            <span className="eyebrow !text-muted">Контакты</span>
            <h2 className="h2 mt-4">Ждём <em className="text-muted">в студии</em></h2>
          </div>
          <dl className="grid gap-5">
            <div><dt className="font-mono text-[.7rem] tracking-[.14em] text-cream/55 uppercase">Адрес</dt><dd className="mt-1 text-[1.15rem]">{BRAND.address}</dd><dd className="text-[.88rem] text-cream/60">Остановка «Первомайская улица», 230 м. На картах студия называется «{BRAND.mapsName}».</dd></div>
            <div><dt className="font-mono text-[.7rem] tracking-[.14em] text-cream/55 uppercase">Администратор</dt><dd className="mt-1"><a className="text-[1.15rem] underline decoration-muted underline-offset-4" href={BRAND.phoneHref}>{BRAND.phone}</a></dd></div>
            <div><dt className="font-mono text-[.7rem] tracking-[.14em] text-cream/55 uppercase">Время</dt><dd className="mt-1 text-[1.15rem]">{BRAND.hours}</dd></div>
          </dl>
          <div className="flex flex-wrap gap-3">
            {SOCIAL.map(([n, href]) => <a key={n} href={href} target="_blank" rel="noopener" className="btn btn-ghost-dark h-11 px-4 text-[.88rem]">{n}</a>)}
          </div>
        </Reveal>
        <Reveal delay={120} className="card min-h-[26rem] overflow-hidden">
          <iframe title="Карта: Химки, ул. Энгельса, 7/15" loading="lazy" className="size-full min-h-[26rem] border-0 sepia-[.35] saturate-[.8]"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${lon - .007}%2C${lat - .003}%2C${lon + .007}%2C${lat + .003}&layer=mapnik&marker=${lat}%2C${lon}`} />
        </Reveal>
      </div>
    </Wrap>
  )
}

export function Footer() {
  return (
    <footer className="mx-auto mt-24 max-w-[80rem] px-5 pb-28 md:px-10 lg:pb-12">
      <div className="flex flex-wrap items-end justify-between gap-6 border-t-2 border-foreground pt-8">
        <div>
          <p className="font-serif text-[clamp(3rem,9vw,6rem)] leading-none italic">Tina <span className="not-italic">Studio</span></p>
          <p className="mt-2 text-[.9rem] text-muted-foreground">Салон красоты и подологии · {BRAND.address}</p>
        </div>
        <p className="text-[.85rem] text-muted-foreground">Демо-версия сайта · сделано <a className="underline underline-offset-3" href="https://t.me/lilbunnych" target="_blank" rel="noopener">@lilbunnych</a></p>
      </div>
    </footer>
  )
}
