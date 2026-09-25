import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { BUDGET, OCCASIONS, PALETTES, TG, petalsFor } from '../data'
import { order, useOrder } from '../store'
import { Reveal } from './Reveal'
import { Send } from './Icons'

const rub = (n: number) => n.toLocaleString('ru-RU') + ' ₽'
const isoDay = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10)

function Step({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-3.5 flex items-center gap-2.5 text-[.95rem] font-bold">
        <i className="rounded-full bg-accent-soft px-2 py-0.5 font-mono text-[.7rem] font-normal text-accent not-italic">{n}</i>{title}
      </div>
      {children}
    </div>
  )
}

/** Bouquet builder: the order store drives both the Telegram message and the 3D rose. */
export function Builder() {
  const o = useOrder()
  const [date, setDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 1); return isoDay(d) })
  const [how, setHow] = useState('Заберу сам(а)')
  const [wish, setWish] = useState('')
  const [copied, setCopied] = useState(false)

  const message = useMemo(() => {
    const when = date ? new Date(date + 'T12:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) : 'уточню'
    return `Здравствуйте! Хочу заказать букет.\nПовод: ${o.occasion}\nБюджет: ${rub(o.budget)}\nПалитра: ${PALETTES[o.palette].name}\nДата: ${when}\nПолучение: ${how}` + (wish.trim() ? `\nПожелания: ${wish.trim()}` : '')
  }, [o, date, how, wish])

  const send = async () => {
    try { await navigator.clipboard.writeText(message); setCopied(true) } catch { /* clipboard blocked: the chat still opens */ }
    window.open(TG, '_blank', 'noopener')
  }
  const pct = ((o.budget - BUDGET.min) / (BUDGET.max - BUDGET.min)) * 100

  return (
    <section id="builder" className="relative z-10 px-5 py-28">
      <div className="mx-auto max-w-[80rem]">
        <div className="max-w-[36rem]">
          <Reveal><span className="label">04 · Ваш букет</span></Reveal>
          <Reveal delay={80}><h2 className="h2">Соберите букет <em>прямо здесь</em></h2></Reveal>
          <Reveal delay={160}><p className="lead">Меняйте повод, бюджет и палитру: цветок рядом меняется вместе с вами. Готовая заявка уйдёт Натали в Telegram одним нажатием.</p></Reveal>
        </div>

        <Reveal delay={200} noDrag className="glass mt-8 grid max-w-[36rem] gap-8 rounded-3xl !bg-white/70 p-7 shadow-[0_30px_60px_-40px_rgb(40_20_40/.45)] dt:p-8">
          <div className="contents">
            <Step n="01" title="Повод">
              <div className="flex flex-wrap gap-2.5" role="group" aria-label="Повод">
                {OCCASIONS.map(x => (
                  <button key={x} className="pill" aria-pressed={o.occasion === x} onClick={() => order.set({ occasion: x })}>{x}</button>
                ))}
              </div>
            </Step>

            <Step n="02" title="Бюджет">
              <div className="flex items-center gap-4">
                <output className="min-w-[7.5rem] font-display text-[1.4rem] tracking-[-.03em]">{rub(o.budget)}</output>
                <input className="range" type="range" min={BUDGET.min} max={BUDGET.max} step={BUDGET.step} value={o.budget} aria-label="Бюджет в рублях"
                  style={{ '--p': pct + '%' } as React.CSSProperties} onChange={e => order.set({ budget: +e.target.value })} />
              </div>
            </Step>

            <Step n="03" title="Палитра">
              <div className="flex flex-wrap gap-2.5" role="group" aria-label="Палитра">
                {PALETTES.map((p, i) => (
                  <button key={p.name} aria-pressed={o.palette === i} onClick={() => order.set({ palette: i })}
                    className="flex h-[2.4rem] items-center gap-2 rounded-full border border-line bg-white/60 pr-3.5 pl-1.5 text-[.85rem] text-muted transition-all aria-pressed:border-ink aria-pressed:text-ink aria-pressed:shadow-[inset_0_0_0_1px_var(--color-ink)]">
                    <span className="size-7 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/.08)]" style={{ background: `linear-gradient(135deg, ${p.outer}, ${p.heart})` }} />{p.name}
                  </button>
                ))}
              </div>
            </Step>

            <Step n="04" title="Когда и как">
              <div className="grid grid-cols-2 gap-4">
                <label className="flex min-w-0 flex-col gap-1.5 text-[.82rem] text-muted">Дата
                  <input className="input" type="date" min={isoDay(new Date())} value={date} onChange={e => setDate(e.target.value)} />
                </label>
                <label className="flex min-w-0 flex-col gap-1.5 text-[.82rem] text-muted">Получение
                  <select className="input" value={how} onChange={e => setHow(e.target.value)}>
                    <option>Заберу сам(а)</option><option>Доставка</option><option>Анонимная доставка</option>
                  </select>
                </label>
              </div>
              <label className="mt-3 flex flex-col gap-1.5 text-[.82rem] text-muted">Пожелания (необязательно)
                <textarea className="input" value={wish} onChange={e => setWish(e.target.value)} placeholder="Например: любит пионы, без лилий, добавить открытку" />
              </label>
            </Step>

            <div className="grid gap-5 border-t border-dashed border-ink/20 pt-6" aria-live="polite">
              <div className="flex items-baseline justify-between gap-4 font-mono text-[.72rem] tracking-[.08em] text-faint uppercase">
                <span>Ваша заявка</span><b className="text-[.8rem] tracking-[.04em] text-accent">{petalsFor(o.budget)} лепестков в 3D</b>
              </div>
              <div className="whitespace-pre-line rounded-[.875rem] border border-line bg-white/80 px-4 py-3.5 text-[.9rem]">{message}</div>
              <button className="btn btn-accent w-full" onClick={send}><Send className="size-4" />Отправить Натали в Telegram</button>
              <p className="text-center text-[.8rem] text-muted">
                {copied ? <><b className="text-accent">Текст скопирован.</b> Вставьте его в чат с Натали.</> : 'Текст скопируется, останется вставить его в чат. Предоплата не нужна.'}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
