import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, CalendarPlus, Check, Phone, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BRAND, TEAM } from '@/data'
import { CATEGORIES } from '@/prices'
import { booking, useBooking } from '@/store'
import { rub, stopScroll } from '@/hooks'

const STEPS = ['Услуги', 'Мастер', 'Время', 'Контакты']
const pad = (n: number) => String(n).padStart(2, '0')
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// Demo schedule: 10:00-21:00 every 30 min, last start 20:00; a stable hash marks some slots as taken.
const TIMES = Array.from({ length: 21 }, (_, i) => `${pad(10 + Math.floor(i / 2))}:${i % 2 ? '30' : '00'}`)
function taken(day: string, time: string, master: string) {
  let h = 0
  for (const ch of day + time + master) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h % 4 === 0
}

function icsUrl(title: string, day: string, time: string, minutes = 90) {
  const [y, m, d] = day.split('-').map(Number), [hh, mm] = time.split(':').map(Number)
  const start = new Date(y, m - 1, d, hh, mm), end = new Date(start.getTime() + minutes * 6e4)
  const f = (x: Date) => `${x.getFullYear()}${pad(x.getMonth() + 1)}${pad(x.getDate())}T${pad(x.getHours())}${pad(x.getMinutes())}00`
  const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Grusha//demo//RU', 'BEGIN:VEVENT', `UID:${crypto.randomUUID()}`, `DTSTART:${f(start)}`, `DTEND:${f(end)}`, `SUMMARY:${title}`, `LOCATION:${BRAND.address}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
  return URL.createObjectURL(new Blob([body], { type: 'text/calendar' }))
}

function formatPhone(v: string) {
  let d = v.replace(/\D/g, '')
  if (d.startsWith('8')) d = '7' + d.slice(1)
  if (!d.startsWith('7')) d = '7' + d
  d = d.slice(0, 11)
  const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)]
  let out = '+7'
  if (p[0]) out += ` (${p[0]}`
  if (p[0].length === 3) out += ')'
  if (p[1]) out += ` ${p[1]}`
  if (p[2]) out += `-${p[2]}`
  if (p[3]) out += `-${p[3]}`
  return out
}

export function BookingDialog() {
  const b = useBooking()
  const panel = useRef<HTMLDivElement>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [agree, setAgree] = useState(true)
  const [errors, setErrors] = useState<{ name?: string; phone?: string; agree?: string }>({})
  const [ics, setIcs] = useState('')

  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + i); return d }), [])
  const cats = [...new Set(b.cart.map(c => c.cat))]
  const masters = TEAM.filter(m => cats.length === 0 || m.cats.some(c => cats.includes(c)))
  const master = TEAM.find(m => m.id === b.master)
  const total = b.cart.reduce((s, i) => s + (i.price ?? 0), 0)
  const hasUnpriced = b.cart.some(i => i.price === null)
  const cat = CATEGORIES.find(c => c.id === b.cat) ?? CATEGORIES[0]
  const now = new Date()

  useEffect(() => {
    if (!b.open) return
    stopScroll(true)
    document.documentElement.style.overflow = 'hidden'
    const prev = document.activeElement as HTMLElement | null
    panel.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && booking.close()
    addEventListener('keydown', onKey)
    return () => { stopScroll(false); document.documentElement.style.overflow = ''; removeEventListener('keydown', onKey); prev?.focus() }
  }, [b.open])

  const canNext = [b.cart.length > 0, true, !!b.day && !!b.time, true][b.step] ?? false
  const go = (step: number) => { booking.set({ step }); panel.current?.scrollTo({ top: 0 }) }

  const submit = () => {
    const e = {
      name: name.trim().length < 2 ? 'Напишите, как к вам обращаться' : undefined,
      phone: phone.replace(/\D/g, '').length < 11 ? 'Нужен номер из 11 цифр' : undefined,
      agree: agree ? undefined : 'Без согласия мы не сможем перезвонить',
    }
    setErrors(e)
    if (e.name || e.phone || e.agree) return
    setIcs(icsUrl(`Груша: ${b.cart.map(c => c.name).join(', ')}`, b.day, b.time))
    go(4)
  }

  const dayLabel = b.day ? new Date(b.day + 'T12:00').toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }) : ''

  return (
    <AnimatePresence>
      {b.open && (
        <motion.div className="fixed inset-0 z-[80] flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button aria-label="Закрыть запись" onClick={() => booking.close()} className="absolute inset-0 cursor-default bg-foreground/40 backdrop-blur-sm" />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
            tabIndex={-1}
            data-lenis-prevent
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 32 }}
            className="relative flex h-full w-full max-w-[34rem] flex-col overflow-y-auto bg-background outline-none sm:rounded-l-3xl"
          >
            <header className="sticky top-0 z-10 bg-background/90 px-6 pb-4 pt-6 backdrop-blur-md md:px-8">
              <div className="flex items-center justify-between">
                <h2 id="booking-title" className="font-display text-2xl font-bold uppercase">Запись</h2>
                <button onClick={() => booking.close()} aria-label="Закрыть" className="grid h-10 w-10 place-items-center rounded-full border border-foreground/15 hover:border-foreground"><X className="h-4 w-4" /></button>
              </div>
              {b.step < 4 && (
                <ol className="mt-5 grid grid-cols-4 gap-2">
                  {STEPS.map((s, i) => (
                    <li key={s}>
                      <button disabled={i > b.step} onClick={() => go(i)} className="w-full text-left disabled:cursor-default">
                        <span className={cn('block h-1 rounded-full transition-colors', i <= b.step ? 'bg-foreground' : 'bg-foreground/10')} />
                        <span className={cn('mt-2 block text-xs font-semibold', i === b.step ? 'text-foreground' : 'text-foreground/50')}>{s}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </header>

            <div className="flex-1 px-6 pb-8 md:px-8">
              {b.step === 0 && (
                <div>
                  <div className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 md:-mx-8 md:px-8">
                    {CATEGORIES.map(c => (
                      <button key={c.id} onClick={() => booking.set({ cat: c.id })} className={cn('shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium', c.id === cat.id ? 'border-foreground bg-foreground text-background' : 'border-foreground/15')}>
                        {c.title}
                      </button>
                    ))}
                  </div>
                  <ul className="mt-4">
                    {cat.items.map((s, i) => {
                      const item = { ...s, cat: cat.id }
                      const on = booking.has(item)
                      return (
                        <li key={s.name + i}>
                          <button onClick={() => booking.toggle(item)} aria-pressed={on} className="flex w-full items-center gap-3 border-b border-foreground/10 py-3.5 text-left">
                            <span className="min-w-0 flex-1 text-[.95rem] font-medium leading-snug">{s.name}</span>
                            <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground/80">{rub(s.price)}</span>
                            <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-full border', on ? 'border-foreground bg-foreground text-lime' : 'border-foreground/20')}>
                              {on ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {b.step === 1 && (
                <div className="space-y-3">
                  {[{ id: 'any', name: 'Любой мастер', role: 'Администратор подберёт свободного', note: '' }, ...masters].map(m => (
                    <button key={m.id} onClick={() => booking.set({ master: m.id })} aria-pressed={b.master === m.id}
                      className={cn('flex w-full items-center gap-4 rounded-3xl border p-5 text-left transition-colors', b.master === m.id ? 'border-foreground bg-lime/40' : 'border-foreground/10 bg-card hover:border-foreground/30')}>
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-lime text-lg font-extrabold">{m.name[0]}</span>
                      <span><b className="block">{m.name}</b><span className="text-sm text-foreground/65">{m.role}</span></span>
                    </button>
                  ))}
                </div>
              )}

              {b.step === 2 && (
                <div>
                  <div className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 md:-mx-8 md:px-8">
                    {days.map(d => {
                      const id = iso(d)
                      return (
                        <button key={id} onClick={() => booking.set({ day: id, time: '' })} aria-pressed={b.day === id}
                          className={cn('flex w-16 shrink-0 flex-col items-center rounded-2xl border py-3', b.day === id ? 'border-foreground bg-foreground text-background' : 'border-foreground/15 bg-card')}>
                          <span className="text-xs uppercase opacity-70">{d.toLocaleDateString('ru-RU', { weekday: 'short' })}</span>
                          <span className="text-xl font-extrabold">{d.getDate()}</span>
                        </button>
                      )
                    })}
                  </div>
                  {b.day ? (
                    <div className="mt-6 grid grid-cols-4 gap-2">
                      {TIMES.map(t => {
                        const past = b.day === iso(now) && Number(t.slice(0, 2)) * 60 + Number(t.slice(3)) <= now.getHours() * 60 + now.getMinutes() + 30
                        const off = past || taken(b.day, t, b.master)
                        return (
                          <button key={t} disabled={off} onClick={() => booking.set({ time: t })} aria-pressed={b.time === t}
                            className={cn('rounded-full border py-2.5 tabular-nums text-sm font-semibold tabular-nums transition-colors disabled:cursor-not-allowed disabled:border-transparent disabled:text-foreground/30 disabled:line-through',
                              b.time === t ? 'border-foreground bg-foreground text-lime' : 'border-foreground/15 bg-card hover:border-foreground/40')}>
                            {t}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="mt-8 text-foreground/65">Выберите день, и появятся свободные окна.</p>
                  )}
                </div>
              )}

              {b.step === 3 && (
                <form className="space-y-5" onSubmit={e => { e.preventDefault(); submit() }} noValidate>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="bk-name" className="text-sm font-semibold">Имя</label>
                    <input id="bk-name" value={name} onChange={e => setName(e.target.value)} autoComplete="given-name" aria-invalid={!!errors.name} aria-describedby="bk-name-err"
                      className="rounded-2xl border border-foreground/20 bg-card px-4 py-3.5 outline-none focus:border-leaf aria-[invalid=true]:border-red-700" />
                    {errors.name && <p id="bk-name-err" className="text-sm text-red-800">{errors.name}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="bk-phone" className="text-sm font-semibold">Телефон</label>
                    <input id="bk-phone" value={phone} onChange={e => setPhone(formatPhone(e.target.value))} inputMode="tel" autoComplete="tel" placeholder="+7 (___) ___-__-__" aria-invalid={!!errors.phone} aria-describedby="bk-phone-err"
                      className="rounded-2xl border border-foreground/20 bg-card px-4 py-3.5 tabular-nums outline-none placeholder:text-foreground/45 focus:border-leaf aria-[invalid=true]:border-red-700" />
                    {errors.phone ? <p id="bk-phone-err" className="text-sm text-red-800">{errors.phone}</p> : <p className="text-sm text-foreground/60">Администратор позвонит, чтобы подтвердить запись.</p>}
                  </div>
                  <label className="flex items-start gap-3 text-sm text-foreground/75">
                    <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--color-leaf)]" />
                    Даю согласие на обработку персональных данных для записи
                  </label>
                  {errors.agree && <p className="text-sm text-red-800">{errors.agree}</p>}
                  <button type="submit" hidden />
                </form>
              )}

              {b.step === 4 && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-lime text-foreground"><Check className="h-8 w-8" /></div>
                  <h3 className="mt-6 font-display text-2xl font-bold uppercase leading-tight">Вы записаны, {name.trim()}.</h3>
                  <p className="mt-3 text-foreground/70">{dayLabel}, {b.time}. {master ? master.name : 'Мастера подберёт администратор'}. Мы перезвоним на {phone}.</p>
                  <ul className="mt-6 space-y-1 text-sm text-foreground/75">{b.cart.map(c => <li key={c.cat + c.name}>{c.name}</li>)}</ul>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <a href={ics} download="grusha.ics" className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background"><CalendarPlus className="h-4 w-4" /> В календарь</a>
                    <a href={BRAND.phoneHref} className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-5 py-3 text-sm font-semibold"><Phone className="h-4 w-4" /> Позвонить</a>
                  </div>
                  <p className="mt-10 rounded-2xl bg-mint p-4 text-sm text-foreground/70">Это демо-версия сайта: заявка никуда не отправляется. В рабочей версии запись уходит администратору или в систему онлайн-записи салона.</p>
                  <button onClick={() => { booking.reset(); setName(''); setPhone('') }} className="mt-6 text-sm font-semibold text-leaf underline-offset-4 hover:underline">Новая запись</button>
                </motion.div>
              )}
            </div>

            {b.step < 4 && (
              <footer className="sticky bottom-0 border-t border-foreground/10 bg-background/95 px-6 py-4 backdrop-blur-md md:px-8">
                <div className="mb-3 flex items-baseline justify-between text-sm">
                  <span className="text-foreground/65">{b.cart.length ? `${b.cart.length} ${b.cart.length === 1 ? 'услуга' : b.cart.length < 5 ? 'услуги' : 'услуг'}` : 'Выберите услуги'}</span>
                  {b.cart.length > 0 && <b className="text-base tabular-nums">{hasUnpriced && total === 0 ? 'цена по запросу' : `${hasUnpriced ? 'от ' : ''}${rub(total)}`}</b>}
                </div>
                <div className="flex gap-2">
                  {b.step > 0 && (
                    <button onClick={() => go(b.step - 1)} aria-label="Назад" className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-foreground/20"><ArrowLeft className="h-4 w-4" /></button>
                  )}
                  <button
                    disabled={!canNext}
                    onClick={() => (b.step === 3 ? submit() : go(b.step + 1))}
                    className="sheen h-12 flex-1 rounded-full bg-foreground text-sm font-semibold text-background transition-opacity disabled:opacity-35"
                  >
                    {b.step === 3 ? 'Записаться' : b.step === 2 && !canNext ? 'Выберите время' : 'Дальше'}
                  </button>
                </div>
              </footer>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
