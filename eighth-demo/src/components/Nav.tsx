import { ChartLineUp, ListBullets, Wallet, Target, GearSix } from '@phosphor-icons/react'

const ITEMS = [
  { icon: ChartLineUp, label: 'Overview', active: true },
  { icon: ListBullets, label: 'Activity' },
  { icon: Target, label: 'Budgets' },
  { icon: Wallet, label: 'Accounts' },
  { icon: GearSix, label: 'Settings' },
]

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-stone-200 bg-white px-4 pb-6 pt-6 lg:flex dark:border-stone-800 dark:bg-stone-900">
      <div className="flex items-center gap-2.5 px-2 text-lg font-semibold">
        <img src="./favicon.svg" alt="" className="size-7" /> Ledgerly
      </div>
      <nav className="mt-8 grid gap-1" aria-label="Main">
        {ITEMS.map(({ icon: Icon, label, active }) => (
          <a key={label} href="#" aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? 'bg-brand-soft text-brand dark:bg-teal-950 dark:text-teal-300' : 'text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800'}`}>
            <Icon size={20} weight={active ? 'fill' : 'regular'} /> {label}
          </a>
        ))}
      </nav>
      <div className="mt-auto rounded-xl bg-stone-100 p-4 text-xs text-stone-500 dark:bg-stone-800 dark:text-stone-400">
        Sample data only. No bank is connected to this demo.
      </div>
    </aside>
  )
}

export function TabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-stone-200 bg-white/95 backdrop-blur lg:hidden dark:border-stone-800 dark:bg-stone-900/95" aria-label="Main">
      {ITEMS.map(({ icon: Icon, label, active }) => (
        <a key={label} href="#" className={`flex flex-col items-center gap-0.5 py-2 text-[11px] ${active ? 'text-brand dark:text-teal-300' : 'text-stone-500'}`}>
          <Icon size={22} weight={active ? 'fill' : 'regular'} /> {label}
        </a>
      ))}
    </nav>
  )
}
