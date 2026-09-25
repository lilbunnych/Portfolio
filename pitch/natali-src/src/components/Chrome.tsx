import { useReadout } from '../store'

const NAV = [['builder', 'Собрать букет'], ['collection', 'Коллекция'], ['how', 'Доставка'], ['faq', 'Вопросы'], ['contacts', 'Контакты']]
const CHAPTERS = [['bud', 'Бутон'], ['story', 'Повод'], ['bloom', 'Цветение'], ['forever', 'Навсегда'], ['builder', 'Ваш букет']]

export function Header() {
  return (
    <header data-no-drag className="glass fixed inset-x-4 top-4 z-30 flex items-center justify-between gap-4 rounded-full py-[.45rem] pr-[.45rem] pl-[.6rem] shadow-[0_10px_30px_-18px_rgb(40_20_40/.35),inset_0_1px_0_rgb(255_255_255/.85)] dt:inset-x-8 dt:top-5">
      <a href="#bud" className="flex items-center gap-2.5" aria-label="Натали, цветочная мастерская">
        <img src="./img/lily.png" alt="" className="size-9 rounded-full bg-white object-contain p-0.5" />
        <b className="font-display text-[.95rem] font-medium tracking-[.14em]">НАТАЛИ</b>
      </a>
      <nav className="hidden gap-7 text-[.92rem] text-muted dt:flex" aria-label="Разделы">
        {NAV.map(([id, label]) => <a key={id} href={`#${id}`} className="hover:text-ink">{label}</a>)}
      </nav>
      <a className="btn btn-ink" href="#builder">Заказать</a>
    </header>
  )
}

export function Rail({ active, hidden }: { active: number; hidden: boolean }) {
  return (
    <nav aria-label="Главы" className={`fixed top-1/2 right-10 z-20 hidden -translate-y-1/2 flex-col gap-4 transition-opacity duration-400 dt:flex ${hidden ? 'pointer-events-none opacity-0' : ''}`}>
      {CHAPTERS.map(([id, label], i) => (
        <button key={id} data-go={id} className={`group flex items-center justify-end gap-3 font-mono text-[.72rem] tracking-[.08em] uppercase transition-colors ${i === active ? 'text-ink' : 'text-faint'}`}>
          {label}
          <span className={`h-px transition-all duration-500 ease-out-expo ${i === active ? 'w-11 bg-accent' : 'w-5 bg-current'}`} />
        </button>
      ))}
    </nav>
  )
}

export function Hud({ hidden }: { hidden: boolean }) {
  const { open, count } = useReadout()
  const item = 'block mt-1 text-[.95rem] font-medium tracking-[.02em] text-ink'
  return (
    <div aria-hidden className={`fixed bottom-7 left-8 z-20 hidden gap-11 font-mono text-[.7rem] tracking-[.08em] text-faint uppercase transition-opacity duration-400 dt:flex [@media(max-height:820px)]:!hidden ${hidden ? 'opacity-0' : ''}`}>
      <div>Химки<b className={item}>55.9056° N · 37.4681° E</b></div>
      <div>Раскрытие<b className={item}>{String(open).padStart(3, '0')}%</b></div>
      <div>Лепестков<b className={item}>{String(count).padStart(3, '0')}</b></div>
    </div>
  )
}

export function Fab({ hidden }: { hidden: boolean }) {
  return (
    <div className={`fixed inset-x-4 bottom-4 z-25 flex transition-all duration-300 dt:hidden ${hidden ? 'pointer-events-none translate-y-5 opacity-0' : ''}`}>
      <a className="btn btn-accent h-[3.1rem] w-full" href="#builder">Собрать букет</a>
    </div>
  )
}
