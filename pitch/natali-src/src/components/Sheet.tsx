import type { ReactNode, PointerEvent } from 'react'
import { CARE, COLLECTION, FAQ, MAX, STEPS, TG, TICKER } from '../data'
import type { Tile } from '../data'
import { Reveal } from './Reveal'
import { Chat, Pin, Send } from './Icons'

const Sec = ({ id, children }: { id?: string; children: ReactNode }) => (
  <section id={id} className="mx-auto max-w-[80rem] px-5 pt-26 dt:px-8 dt:pt-36">{children}</section>
)

function Head({ label, title, text }: { label: string; title: ReactNode; text?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <Reveal><span className="label">{label}</span></Reveal>
        <Reveal delay={80}><h2 className="h2">{title}</h2></Reveal>
      </div>
      {text && <Reveal delay={160}><p className="max-w-[26rem] text-muted">{text}</p></Reveal>}
    </div>
  )
}

function Ticker() {
  const row = [...TICKER, ...TICKER]
  return (
    <div aria-hidden className="overflow-hidden border-b border-line py-5 font-mono text-[.8rem] tracking-[.1em] whitespace-nowrap text-muted uppercase">
      <div className="inline-flex animate-tick">
        {row.map((t, i) => <span key={i} className="pr-10"><span className="mr-10 text-accent">✦</span>{t}</span>)}
      </div>
    </div>
  )
}

/** Photo card that tilts toward the pointer and catches a glare. */
function TiltTile({ t, delay }: { t: Tile; delay: number }) {
  const move = (e: PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType !== 'mouse') return
    const el = e.currentTarget, r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height
    el.style.setProperty('--ry', ((x - .5) * 8).toFixed(2) + 'deg'); el.style.setProperty('--rx', ((.5 - y) * 8).toFixed(2) + 'deg')
    el.style.setProperty('--gx', x * 100 + '%'); el.style.setProperty('--gy', y * 100 + '%')
  }
  const leave = (e: PointerEvent<HTMLAnchorElement>) => { e.currentTarget.style.setProperty('--rx', '0deg'); e.currentTarget.style.setProperty('--ry', '0deg') }
  const span = t.span === 'big' ? 'md:col-span-2 lg:row-span-2' : t.span === 'wide' ? 'lg:col-span-2' : t.span === 'full' ? 'md:col-span-2 lg:col-span-4' : ''
  return (
    <Reveal delay={delay} className={span}>
      <a href={t.href} onPointerMove={move} onPointerLeave={leave}
        className="tile-glare group relative flex h-full min-h-[17rem] lg:min-h-0 flex-col justify-end overflow-hidden rounded-3xl p-6 text-white shadow-[0_20px_40px_-30px_rgb(40_20_40/.5)] transition-[transform,box-shadow] duration-500 ease-out-expo [transform:perspective(1000px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] hover:shadow-[0_30px_60px_-30px_rgb(40_20_40/.6)]">
        <img loading="lazy" src={`./img/${t.img}`} alt={t.alt} className="absolute inset-0 size-full object-cover transition-transform duration-[1200ms] ease-out-expo group-hover:scale-[1.06]" />
        <div className="absolute inset-0 z-[1] bg-[linear-gradient(to_top,rgb(17_12_20/.88)_8%,rgb(17_12_20/.3)_55%,transparent_80%)]" />
        {t.tag && <span className="absolute top-4 left-4 z-[3] rounded-full border border-white/35 bg-white/20 px-2.5 py-1 font-mono text-[.68rem] tracking-[.08em] uppercase backdrop-blur-md">{t.tag}</span>}
        {t.price && <span className="absolute top-4 right-4 z-[3] rounded-full bg-white px-3 py-1 text-[.82rem] font-bold text-ink">{t.price}</span>}
        <h3 className="relative z-[3] font-display text-[1.15rem] leading-tight font-medium tracking-[-.02em]">{t.title}</h3>
        <p className="relative z-[3] mt-1.5 max-w-[26rem] text-[.9rem] opacity-85">{t.text}</p>
      </a>
    </Reveal>
  )
}

const card = 'rounded-3xl border border-line bg-white'

export function Sheet() {
  return (
    <div id="sheet" data-no-drag className="relative z-10 rounded-t-[2.25rem] bg-bg2 shadow-[0_-30px_60px_-30px_rgb(40_20_40/.2)]">
      <Ticker />

      <Sec id="collection">
        <Head label="Коллекция" title="Не только букеты" text="Всё на фото собрано в мастерской. Любую позицию можно повторить или собрать по мотивам." />
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:auto-rows-[16rem] lg:grid-cols-4">
          {COLLECTION.map((t, i) => <TiltTile key={t.img} t={t} delay={(i % 3) * 80} />)}
        </div>
      </Sec>

      <Sec id="how">
        <Head label="Как это работает" title={<>Три шага до <em>идеального букета</em></>} />
        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 80} className={`${card} p-6`}>
              <span className="font-mono text-[.75rem] tracking-[.08em] text-accent">0{i + 1}</span>
              <b className="mt-6 block font-display text-[1.1rem] leading-snug font-medium tracking-[-.02em]">{s.title}</b>
              <span className="mt-2 block text-[.95rem] text-muted">{s.text}</span>
            </Reveal>
          ))}
        </ol>
        <Reveal className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[.92rem] text-muted">
          <span><b className="text-ink">Оплата:</b> картой, по ссылке онлайн или наличными при получении</span>
          <span><b className="text-ink">Предзаказ:</b> без предоплаты</span>
        </Reveal>
      </Sec>

      <Sec>
        <Reveal className="relative isolate grid gap-8 overflow-hidden rounded-[2rem] bg-[#121017] px-6 py-10 text-[#f4f1f7] dt:grid-cols-[1.1fr_.9fr] dt:p-14">
          <div aria-hidden className="absolute -inset-[40%] -z-10 animate-[spin_14s_linear_infinite] bg-[conic-gradient(from_0deg,transparent,rgb(210_58_111/.6),transparent_30%,rgb(143_111_224/.5),transparent_60%)] blur-[40px]" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(90%_130%_at_100%_0%,rgb(18_16_23/.35),#121017_72%)]" />
          <div>
            <span className="label !text-[#ff8fb3]">Для больших поводов</span>
            <h2 className="text-[clamp(1.7rem,3.2vw,2.7rem)]">Свадьбы, торжества и мастер-классы</h2>
            <p className="mt-4 max-w-[34rem] text-[#f4f1f7]/75">Оформим праздник живыми цветами, сухоцветами и стабилизированными растениями. Достаточно назвать тематику, бюджет и цветовую гамму. А если хочется научиться самим, проведём мастер-класс.</p>
            <a className="btn mt-9 border border-white/30 text-white hover:border-white" href={TG} target="_blank" rel="noopener">Обсудить в Telegram</a>
          </div>
          <ul className="grid content-center gap-4">
            {[['Оформление свадеб', 'живые · сухие'], ['Дни рождения и юбилеи', 'под тематику'], ['Мастер-классы', '1 : 1 · группы']].map(([a, b]) => (
              <li key={a} className="flex justify-between gap-4 rounded-2xl border border-white/12 bg-white/6 px-4.5 py-4 text-[.95rem] backdrop-blur-sm">
                {a}<span className="self-center text-right font-mono text-[.7rem] tracking-[.08em] text-[#f4f1f7]/60 uppercase">{b}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </Sec>

      <Sec id="care">
        <Head label="Советы флориста" title="Пусть букет стоит дольше" />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {CARE.map((c, i) => (
            <Reveal key={c.title} delay={i * 80} className={`${card} p-6 ${i === 0 ? '!border-accent !bg-accent text-white' : ''}`}>
              <b className="block font-bold">{c.title}</b>
              <span className={`mt-1.5 block text-[.93rem] ${i === 0 ? 'text-white/88' : 'text-muted'}`}>{c.text}</span>
            </Reveal>
          ))}
        </div>
      </Sec>

      <Sec id="faq">
        <Head label="Вопросы" title="Частые вопросы" />
        <Reveal delay={120} className="faq mt-8 max-w-[54rem]">
          {FAQ.map(f => (
            <details key={f.q} className="border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[1.05rem] font-semibold">
                {f.q}<i className="grid size-8 shrink-0 place-items-center rounded-full border border-line not-italic transition-all duration-300 ease-out-expo">+</i>
              </summary>
              <p className="max-w-[46rem] pb-5 text-muted">
                {f.builderLink ? <>{f.a.replace(' Быстрее всего через конструктор.', '')} Быстрее всего через <a href="#builder" className="text-accent underline">конструктор</a>.</> : f.a}
              </p>
            </details>
          ))}
        </Reveal>
      </Sec>

      <Sec id="contacts">
        <div className="grid gap-5 dt:grid-cols-[1fr_1.15fr]">
          <Reveal className={`${card} grid content-start gap-6 p-9`}>
            <span className="label !m-0">Контакты</span>
            <h2 className="text-[clamp(1.7rem,3vw,2.5rem)]">Порадуйте кого-то <em>уже завтра</em></h2>
            <Line icon={<Pin className="mt-0.5 size-5 shrink-0 text-accent" />}><b className="block text-ink">Химки, Ленинский проспект, 22</b>Московская область</Line>
            <Line icon={<Send className="mt-0.5 size-5 shrink-0 text-accent" />}><b className="block text-ink">Telegram-канал</b><a className="underline underline-offset-3" href={TG} target="_blank" rel="noopener">@natali_flowers_himki</a></Line>
            <Line icon={<Chat className="mt-0.5 size-5 shrink-0 text-accent" />}><b className="block text-ink">Канал в MAX</b><a className="underline underline-offset-3" href={MAX} target="_blank" rel="noopener">Подписаться</a></Line>
            <div><a className="btn btn-accent" href="#builder">Собрать букет</a></div>
          </Reveal>
          <Reveal delay={120} className="min-h-[22rem] overflow-hidden rounded-3xl border border-line bg-[#e9e6ee]">
            <iframe title="Карта: Химки, Ленинский проспект 22" loading="lazy" className="size-full min-h-[22rem] border-0 grayscale-100"
              src="https://www.openstreetmap.org/export/embed.html?bbox=37.4611%2C55.9025%2C37.4751%2C55.9086&layer=mapnik&marker=55.9055734%2C37.4681059" />
          </Reveal>
        </div>
      </Sec>

      <footer className="mx-auto max-w-[80rem] px-5 pt-16 pb-24 dt:px-8 dt:pb-12">
        <div className="flex flex-wrap justify-between gap-4 border-t border-line pt-7 text-[.85rem] text-muted">
          <span>© Цветочная мастерская «Натали», Химки</span>
          <span>Демо-версия сайта · сделано <a className="underline underline-offset-3" href="https://t.me/lilbunnych" target="_blank" rel="noopener">@lilbunnych</a></span>
        </div>
      </footer>
    </div>
  )
}

const Line = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => (
  <div className="flex items-start gap-3 text-muted">{icon}<div>{children}</div></div>
)
