import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CATEGORIES } from '../prices'
import { TEAM, BRAND } from '../data'
import { booking, useBooking } from '../store'
import { Heading } from '../ui/Reveal'

const rub = (n: number) => n.toLocaleString('ru-RU') + ' ₽'
const STEPS = ['Услуги', 'Мастер', 'Дата и время', 'Контакты']
const pad = (n: number) => String(n).padStart(2, '0')
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/** Next 14 days. */
function useDays() {
  return useMemo(() => Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + i); return d }), [])
}

// Demo schedule: 10:00–21:00 every 30 min; a deterministic hash marks some slots as taken.
const TIMES = Array.from({ length: 23 }, (_, i) => `${pad(10 + Math.floor(i / 2))}:${i % 2 ? '30' : '00'}`)
function taken(day: string, time: string, master: string) {
  let h = 0
  for (const ch of day + time + master) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h % 4 === 0
}

function icsFile(title: string, day: string, time: string, minutes = 90) {
  const [y, m, d] = day.split('-').map(Number), [hh, mm] = time.split(':').map(Number)
  const start = new Date(y, m - 1, d, hh, mm), end = new Date(start.getTime() + minutes * 6e4)
  const f = (x: Date) => `${x.getFullYear()}${pad(x.getMonth() + 1)}${pad(x.getDate())}T${pad(x.getHours())}${pad(x.getMinutes())}00`
  const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Tina Studio//demo//RU', 'BEGIN:VEVENT', `UID:${crypto.randomUUID()}`, `DTSTART:${f(start)}`, `DTEND:${f(end)}`, `SUMMARY:${title}`, `LOCATION:${BRAND.address}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
  return URL.createObjectURL(new Blob([body], { type: 'text/calendar' }))
}

export function Booking() {
  const b = useBooking()
  const days = useDays()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<{ name?: boolean; phone?: boolean }>({})
  const [ics, setIcs] = useState('')

  const cats = [...new Set(b.cart.map(c => c.cat))]
  const masters = TEAM.filter(m => cats.length === 0 || m.cats.some(c => cats.includes(c)))
  const master = TEAM.find(m => m.id === b.master)
  const total = b.cart.reduce((s, i) => s + i.price, 0)
  const cat = CATEGORIES.find(c => c.id === b.cat) ?? CATEGORIES[0]
  const now = new Date()

  const canNext = [b.cart.length > 0, true, !!b.day && !!b.time, true][b.step] ?? false
  const go = (step: number) => booking.set({ step })

  const submit = () => {
    const e = { name: name.trim().length < 2, phone: phone.replace(/\D/g, '').length < 10 }
    setErrors(e)
    if (e.name || e.phone) return
    setIcs(icsFile(`Tina Studio: ${b.cart.map(c => c.name).join(', ')}`, b.day, b.time))
    go(4)
  }

  const dayLabel = b.day ? new Date(b.day + 'T12:00').toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' }) : '—'

  return (
    <section id="booking" className="mx-auto max-w-[80rem] px-5 pt-24 md:px-10 lg:pt-36">
      <Heading eyebrow="Онлайн-запись" title={<>Запишитесь <em className="text-primary">за минуту</em></>} note="Выберите услуги, мастера и удобное время. Администратор подтвердит запись в WhatsApp или по телефону." />

      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="card min-w-0">
          {/* stepper */}
          <ol className="grid grid-cols-4 border-b-2 border-foreground">
            {STEPS.map((s, i) => {
              const state = b.step > i ? 'done' : b.step === i ? 'now' : 'next'
              return (
                <li key={s} className={`border-r-2 border-foreground last:border-r-0 ${state === 'now' ? 'bg-foreground text-cream' : state === 'done' ? 'bg-muted' : ''}`}>
                  <button disabled={state === 'next' || b.step === 4} onClick={() => go(i)} className="flex w-full flex-col items-start gap-0.5 px-3 py-3 text-left disabled:cursor-default">
                    <span className="font-mono text-[.68rem] tracking-[.12em] opacity-70">{state === 'done' ? '✓' : pad(i + 1)}</span>
                    <span className="hidden text-[.88rem] font-semibold sm:block">{s}</span>
                  </button>
                </li>
              )
            })}
          </ol>

          <div className="min-h-[26rem] p-5 md:p-7">
            <AnimatePresence mode="wait">
              <motion.div key={b.step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: .3, ease: [.16, 1, .3, 1] }}>
                {b.step === 0 && (
                  <div>
                    <h3 className="text-[1.6rem]">Что делаем?</h3>
                    <div className="mt-5 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                      {CATEGORIES.map(c => <button key={c.id} className="chip shrink-0" aria-pressed={b.cat === c.id} onClick={() => booking.set({ cat: c.id })}>{c.title}</button>)}
                    </div>
                    <ul className="mt-4 max-h-[22rem] overflow-y-auto border-2 border-foreground" data-lenis-prevent>
                      {cat.items.map(s => {
                        const item = { ...s, cat: cat.id }, on = booking.has(item)
                        return (
                          <li key={s.name + s.price}>
                            <label className={`flex cursor-pointer items-center gap-3 border-b border-foreground/15 px-4 py-3 transition-colors hover:bg-muted/60 ${on ? 'bg-muted' : ''}`}>
                              <input type="checkbox" checked={on} onChange={() => booking.toggle(item)} className="size-4 accent-[#A95C64]" />
                              <span className="flex-1 text-[.93rem]">{s.name}</span>
                              <span className="font-mono text-[.85rem] whitespace-nowrap">от {rub(s.price)}</span>
                            </label>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}

                {b.step === 1 && (
                  <div>
                    <h3 className="text-[1.6rem]">К кому записать?</h3>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <MasterOption id="any" title="Любой свободный мастер" sub="Подберём по времени" on={b.master === 'any'} />
                      {masters.map(m => <MasterOption key={m.id} id={m.id} title={m.name} sub={m.role} on={b.master === m.id} />)}
                    </div>
                    {b.master !== 'any' && master && !masters.includes(master) && <p className="mt-4 text-[.88rem] text-primary">Выбранный мастер не делает эти услуги — выберите другого или «любой».</p>}
                  </div>
                )}

                {b.step === 2 && (
                  <div>
                    <h3 className="text-[1.6rem]">Когда удобно?</h3>
                    <div className="mt-5 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                      {days.map(d => {
                        const v = iso(d), on = b.day === v
                        return (
                          <button key={v} onClick={() => booking.set({ day: v, time: '' })} aria-pressed={on}
                            className={`flex w-16 shrink-0 flex-col items-center border-2 border-foreground py-2 transition-colors ${on ? 'bg-foreground text-cream' : 'hover:bg-muted'}`}>
                            <span className="font-mono text-[.68rem] uppercase opacity-70">{d.toLocaleDateString('ru-RU', { weekday: 'short' })}</span>
                            <span className="font-serif text-[1.5rem] leading-tight">{d.getDate()}</span>
                            <span className="text-[.68rem] opacity-70">{d.toLocaleDateString('ru-RU', { month: 'short' })}</span>
                          </button>
                        )
                      })}
                    </div>
                    {b.day ? (
                      <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6">
                        {TIMES.map(t => {
                          const past = b.day === iso(now) && (Number(t.slice(0, 2)) * 60 + Number(t.slice(3))) <= now.getHours() * 60 + now.getMinutes() + 30
                          const busy = past || taken(b.day, t, b.master)
                          return (
                            <button key={t} disabled={busy} onClick={() => booking.set({ time: t })} aria-pressed={b.time === t}
                              className={`h-11 border-2 border-foreground font-mono text-[.88rem] transition-colors disabled:border-foreground/20 disabled:text-foreground/30 disabled:line-through ${b.time === t ? 'bg-primary text-cream' : 'hover:bg-muted'}`}>
                              {t}
                            </button>
                          )
                        })}
                      </div>
                    ) : <p className="mt-6 text-muted-foreground">Выберите день — покажем свободное время.</p>}
                    <p className="mt-4 text-[.8rem] text-muted-foreground">В макете расписание условное. В рабочей версии подтянем реальную загрузку мастеров.</p>
                  </div>
                )}

                {b.step === 3 && (
                  <div className="grid gap-4">
                    <h3 className="text-[1.6rem]">Как с вами связаться?</h3>
                    <label className="grid gap-1.5 text-[.88rem]">Имя
                      <input className="field" value={name} onChange={e => { setName(e.target.value); setErrors(x => ({ ...x, name: false })) }} autoComplete="name" placeholder="Как к вам обращаться" />
                      {errors.name && <span className="text-[.8rem] text-primary">Напишите имя</span>}
                    </label>
                    <label className="grid gap-1.5 text-[.88rem]">Телефон
                      <input className="field" value={phone} onChange={e => { setPhone(e.target.value); setErrors(x => ({ ...x, phone: false })) }} type="tel" inputMode="tel" autoComplete="tel" placeholder="+7 (___) ___-__-__" />
                      {errors.phone && <span className="text-[.8rem] text-primary">Проверьте номер телефона</span>}
                    </label>
                    <label className="grid gap-1.5 text-[.88rem]">Комментарий (необязательно)
                      <textarea className="field" value={note} onChange={e => setNote(e.target.value)} placeholder="Например: длинные густые волосы, хочу обсудить цвет" />
                    </label>
                    <p className="text-[.8rem] text-muted-foreground">Это макет: данные никуда не отправляются.</p>
                  </div>
                )}

                {b.step === 4 && (
                  <div className="grid justify-items-start gap-4">
                    <span className="grid size-16 place-items-center border-2 border-foreground bg-primary text-[1.8rem] text-cream shadow-hard">✓</span>
                    <h3 className="text-[2rem]">Готово, {name.trim()}!</h3>
                    <p className="max-w-[34rem] text-muted-foreground">Заявка на {dayLabel}, {b.time}. Администратор подтвердит запись в WhatsApp или перезвонит на {phone}.</p>
                    <div className="flex flex-wrap gap-3">
                      {ics && <a className="btn btn-cream" href={ics} download="tina-studio.ics">Добавить в календарь</a>}
                      <button className="btn btn-primary" onClick={() => { booking.reset(); setName(''); setPhone(''); setNote('') }}>Новая запись</button>
                    </div>
                    <p className="text-[.8rem] text-muted-foreground">В рабочей версии запись уйдёт в систему салона и администратору.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {b.step < 4 && (
            <div className="flex items-center justify-between gap-3 border-t-2 border-foreground p-4">
              <button className="btn btn-cream h-11" disabled={b.step === 0} style={{ visibility: b.step === 0 ? 'hidden' : undefined }} onClick={() => go(b.step - 1)}>Назад</button>
              {b.step < 3
                ? <button className="btn btn-primary h-11 disabled:pointer-events-none disabled:opacity-40" disabled={!canNext} onClick={() => go(b.step + 1)}>Дальше</button>
                : <button className="btn btn-primary h-11" onClick={submit}>Записаться</button>}
            </div>
          )}
        </div>

        {/* summary "receipt" */}
        <aside className="card h-fit min-w-0 bg-night p-6 text-cream lg:sticky lg:top-28">
          <p className="font-mono text-[.72rem] tracking-[.16em] text-cream/60 uppercase">Ваша запись</p>
          <ul className="mt-4 grid gap-2 border-b-2 border-dashed border-cream/25 pb-4">
            {b.cart.length ? b.cart.map(c => (
              <li key={c.cat + c.name} className="flex items-start justify-between gap-3 text-[.9rem]">
                <span>{c.name}</span>
                <button onClick={() => booking.toggle(c)} className="shrink-0 text-cream/50 hover:text-cream" aria-label={`Убрать ${c.name}`}>✕</button>
              </li>
            )) : <li className="text-[.9rem] text-cream/55">Пока пусто — выберите услуги.</li>}
          </ul>
          <dl className="mt-4 grid gap-2 text-[.9rem]">
            <div className="flex justify-between"><dt className="text-cream/60">Мастер</dt><dd>{master ? master.name : 'любой'}</dd></div>
            <div className="flex justify-between"><dt className="text-cream/60">Когда</dt><dd>{b.day ? `${dayLabel}${b.time ? ', ' + b.time : ''}` : '—'}</dd></div>
          </dl>
          <div className="mt-5 flex items-baseline justify-between border-t-2 border-cream/25 pt-4">
            <span className="text-cream/60">Итого от</span>
            <span className="font-serif text-[2.2rem] text-muted">{rub(total)}</span>
          </div>
          <a href={BRAND.whatsapp} target="_blank" rel="noopener" className="mt-5 block text-center text-[.85rem] text-cream/60 underline underline-offset-4 hover:text-cream">Удобнее написать в WhatsApp</a>
        </aside>
      </div>
    </section>
  )
}

function MasterOption({ id, title, sub, on }: { id: string; title: string; sub: string; on: boolean }) {
  return (
    <button onClick={() => booking.set({ master: id })} aria-pressed={on}
      className={`flex items-center gap-3 border-2 border-foreground p-3 text-left transition-all ${on ? 'bg-foreground text-cream shadow-hard-rose' : 'hover:bg-muted'}`}>
      <span className={`grid size-11 shrink-0 place-items-center border-2 font-serif text-[1.3rem] italic ${on ? 'border-cream' : 'border-foreground bg-muted'}`}>{id === 'any' ? '✦' : title[0]}</span>
      <span><b className="block">{title}</b><span className="text-[.82rem] opacity-70">{sub}</span></span>
    </button>
  )
}
