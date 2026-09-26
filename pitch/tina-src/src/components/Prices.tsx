import { useMemo, useState } from 'react'
import { CATEGORIES } from '../prices'
import { booking, useBooking } from '../store'
import { scrollToId } from '../hooks'
import { Heading, Reveal } from '../ui/Reveal'

const rub = (n: number) => n.toLocaleString('ru-RU') + ' ₽'
const PAGE = 14

/** Full price list from the salon's card: categories, search, and "add to booking" on every line. */
export function Prices() {
  const b = useBooking()
  const [cat, setCat] = useState('hair')
  const [q, setQ] = useState('')
  const [all, setAll] = useState(false)

  const query = q.trim().toLowerCase()
  const rows = useMemo(() => {
    if (query) return CATEGORIES.flatMap(c => c.items.filter(i => i.name.toLowerCase().includes(query)).map(i => ({ ...i, cat: c.id, catTitle: c.title })))
    const c = CATEGORIES.find(x => x.id === cat)!
    return c.items.map(i => ({ ...i, cat: c.id, catTitle: c.title }))
  }, [cat, query])
  const shown = all || query ? rows : rows.slice(0, PAGE)
  const total = b.cart.reduce((s, i) => s + i.price, 0)

  return (
    <section id="prices" className="mx-auto max-w-[80rem] px-5 pt-24 md:px-10 lg:pt-36">
      <Heading eyebrow="Прайс" title={<>Цены <em className="text-primary">без сюрпризов</em></>} note="Полный прайс студии. Отмечайте услуги — они сразу попадут в онлайн-запись." />

      <Reveal className="mt-12 grid gap-6 lg:grid-cols-[16rem_1fr]">
        <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 scrollbar-none lg:flex-col lg:overflow-visible" role="tablist" aria-label="Направления">
          {CATEGORIES.map(c => (
            <button key={c.id} role="tab" aria-selected={!query && cat === c.id} onClick={() => { setCat(c.id); setQ(''); setAll(false) }}
              className="chip flex shrink-0 items-center justify-between gap-3 text-left lg:w-full">
              {c.title}<span className="font-mono text-[.72rem] opacity-60">{c.items.length}</span>
            </button>
          ))}
        </div>

        <div className="card min-w-0">
          <div className="flex flex-wrap items-center gap-3 border-b-2 border-foreground p-4">
            <label className="relative min-w-[14rem] flex-1">
              <span className="sr-only">Поиск по прайсу</span>
              <svg viewBox="0 0 24 24" className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              <input className="field pl-10" placeholder="Найти услугу: маникюр, балаяж, подолог…" value={q} onChange={e => setQ(e.target.value)} />
            </label>
            {b.cart.length > 0 && (
              <button onClick={() => scrollToId('booking')} className="btn btn-primary h-12 text-[.9rem]">
                В записи: {b.cart.length} · {rub(total)}
              </button>
            )}
          </div>
          <ul>
            {shown.map(r => {
              const on = b.cart.some(c => c.name === r.name && c.cat === r.cat)
              return (
                <li key={r.cat + r.name + r.price} className="flex items-center gap-4 border-b border-foreground/15 px-4 py-3 last:border-b-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-[.95rem]">{r.name}</p>
                    {query && <p className="font-mono text-[.7rem] tracking-[.1em] text-muted-foreground uppercase">{r.catTitle}</p>}
                  </div>
                  <span className="shrink-0 font-mono text-[.9rem] whitespace-nowrap">от {rub(r.price)}</span>
                  <button onClick={() => booking.toggle({ name: r.name, price: r.price, cat: r.cat })} aria-pressed={on} aria-label={on ? 'Убрать из записи' : 'Добавить в запись'}
                    className={`grid size-9 shrink-0 place-items-center border-2 border-foreground text-[1.2rem] leading-none transition-colors ${on ? 'bg-primary text-cream' : 'hover:bg-muted'}`}>
                    {on ? '✓' : '+'}
                  </button>
                </li>
              )
            })}
            {!shown.length && <li className="px-4 py-10 text-center text-muted-foreground">Ничего не нашли. Попробуйте другое слово или позвоните администратору.</li>}
          </ul>
          {!query && rows.length > PAGE && (
            <button onClick={() => setAll(v => !v)} className="w-full border-t-2 border-foreground py-3 font-semibold transition-colors hover:bg-muted">
              {all ? 'Свернуть' : `Показать все ${rows.length}`}
            </button>
          )}
        </div>
      </Reveal>
      <p className="mt-4 text-[.82rem] text-muted-foreground">Цены «от» с карточки студии на Яндекс Картах. Точную стоимость назовёт мастер.</p>
    </section>
  )
}
