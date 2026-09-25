import type { ReactNode } from 'react'
import { useReadout } from '../store'
import { Reveal } from './Reveal'
import { ArrowDown, Check } from './Icons'

/** A full-height scroll chapter; the copy sits beside the rose on desktop and in a glass card on phones. */
function Chapter({ id, first, children }: { id: string; first?: boolean; children: ReactNode }) {
  return (
    <section id={id} className={`flex items-end px-5 pb-24 dt:items-center dt:px-[max(2rem,calc((100vw-80rem)/2+2rem))] dt:py-28 ${first ? 'min-h-screen pt-[44vh] pb-12' : 'min-h-[112vh] pt-28'}`}>
      <div data-no-drag className="glass w-full max-w-[34rem] rounded-3xl !bg-white/80 p-6 dt:!border-0 dt:!bg-transparent dt:p-0 dt:!backdrop-blur-none">
        {children}
      </div>
    </section>
  )
}

const Label = ({ children, dot }: { children: ReactNode; dot?: boolean }) => (
  <Reveal><span className="label">{dot && <i className="size-[.45rem] animate-pulse-ring rounded-full bg-accent shadow-[0_0_0_4px_var(--color-accent-soft)]" />}{children}</span></Reveal>
)

const Tick = ({ children }: { children: ReactNode }) => (
  <li className="flex items-start gap-2.5"><Check className="mt-0.5 size-5 shrink-0 text-accent" />{children}</li>
)

export function Chapters() {
  const { open, palette } = useReadout()
  return (
    <main id="chapters" className="relative z-10">
      <Chapter id="bud" first>
        <Label dot>Цветочная мастерская · Химки</Label>
        <Reveal delay={120}><h1 className="text-[clamp(1.8rem,8.4vw,2.6rem)] dt:text-[clamp(2.1rem,4.8vw,4.2rem)]">Цветы, которые скажут <em>всё за вас</em></h1></Reveal>
        <Reveal delay={240}><p className="lead">Авторские букеты под ваш повод, бюджет и любимые цвета. Покажем фото до отправки и доставим по Москве и области.</p></Reveal>
        <Reveal delay={360} className="mt-10 flex flex-wrap gap-3.5">
          <a className="btn btn-accent" href="#builder">Собрать букет</a>
          <a className="btn btn-line" href="#story">Как он раскрывается <ArrowDown className="size-4" /></a>
        </Reveal>
        <Reveal delay={480} className="mt-8 flex flex-wrap gap-2.5">
          {['Предзаказ без предоплаты', 'Фото перед отправкой', 'от 1 500 ₽'].map(t => (
            <span key={t} className="glass rounded-full px-3.5 py-1.5 text-[.85rem]">{t}</span>
          ))}
        </Reveal>
      </Chapter>

      <Chapter id="story">
        <Label>01 · Повод</Label>
        <Reveal delay={80}><h2 className="h2">Каждый букет начинается с <em>вашей истории</em></h2></Reveal>
        <Reveal delay={180}><p className="lead">День рождения, свидание, извинение или «просто так». Мы собираем не с витрины, а под человека, которому он предназначен.</p></Reveal>
        <Reveal delay={260} className="mt-10 flex items-baseline gap-2.5 font-mono">
          <b className="text-[2.1rem] font-medium tracking-[-.04em]">{palette}</b><span className="text-[.85rem] text-muted">палитра</span>
        </Reveal>
      </Chapter>

      <Chapter id="bloom">
        <Label>02 · Цветение</Label>
        <Reveal delay={80}><h2 className="h2">Вы увидите букет <em>раньше, чем они</em></h2></Reveal>
        <Reveal delay={180}>
          <ul className="mt-7 grid gap-3.5">
            <Tick>Пришлём фото букета перед отправкой</Tick>
            <Tick>Доставка курьерами Яндекса по Москве и области</Tick>
            <Tick>Анонимно, если сюрприз должен остаться сюрпризом</Tick>
          </ul>
        </Reveal>
        <Reveal delay={260} className="mt-10 flex items-baseline gap-2.5 font-mono">
          <b className="text-[2.1rem] font-medium tracking-[-.04em]">{open}%</b><span className="text-[.85rem] text-muted">раскрытие</span>
        </Reveal>
      </Chapter>

      <Chapter id="forever">
        <Label>03 · Навсегда</Label>
        <Reveal delay={80}><h2 className="h2">А этот <em>не завянет</em> никогда</h2></Reveal>
        <Reveal delay={180}><p className="lead">Сухоцветы и стабилизированные цветы стоят годами без воды. Композиции для дома, офиса и кафе, а мини-букет с магнитом украсит холодильник или приборную панель авто.</p></Reveal>
        <Reveal delay={260} className="mt-10"><a className="btn btn-line" href="#collection">Смотреть коллекцию</a></Reveal>
      </Chapter>
    </main>
  )
}
