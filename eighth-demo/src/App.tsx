import { useEffect, useMemo, useState } from 'react'
import { Moon, Sun } from '@phosphor-icons/react'
import { Card } from './components/Card'
import { Sidebar, TabBar } from './components/Nav'
import { Kpis, type Kpi } from './components/Kpis'
import { CashflowChart } from './components/CashflowChart'
import { CategoryChart } from './components/CategoryChart'
import { Budgets } from './components/Budgets'
import { Transactions } from './components/Transactions'
import { DemoBanner } from './components/DemoBanner'
import { STARTING_BALANCE, TODAY, months, transactions, type Category } from './data'

const RANGES = [3, 6, 12] as const
type Range = typeof RANGES[number]

function readTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem('ledgerly-theme')
    if (saved === 'light' || saved === 'dark') return saved
  } catch { /* storage unavailable */ }
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function App() {
  const [range, setRange] = useState<Range>(6)
  const [theme, setTheme] = useState(readTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('ledgerly-theme', theme) } catch { /* ignore */ }
  }, [theme])

  const view = useMemo(() => {
    const cur = months.slice(-range)
    const prev = months.slice(-range * 2, -range)
    const sum = (list: typeof months, k: 'income' | 'spending') => list.reduce((s, m) => s + m[k], 0)
    const inc = sum(cur, 'income'), spd = sum(cur, 'spending')
    const pInc = sum(prev, 'income'), pSpd = sum(prev, 'spending')
    const rate = inc ? ((inc - spd) / inc) * 100 : 0
    const pRate = pInc ? ((pInc - pSpd) / pInc) * 100 : 0
    const balance = STARTING_BALANCE + months.reduce((s, m) => s + m.income - m.spending, 0)
    const pct = (a: number, b: number) => (b ? ((a - b) / b) * 100 : null)

    const kpis: Kpi[] = [
      { label: 'Balance', value: balance, delta: null },
      { label: `Income, ${range} months`, value: inc, delta: prev.length ? pct(inc, pInc) : null },
      { label: `Spending, ${range} months`, value: spd, delta: prev.length ? pct(spd, pSpd) : null, goodWhenUp: false },
      { label: 'Savings rate', value: rate, delta: prev.length ? rate - pRate : null, format: 'pct' },
    ]

    const keys = new Set(cur.map(m => m.key))
    const byCat = new Map<Category, number>()
    const thisMonth: Record<string, number> = {}
    const monthKey = months[months.length - 1].key
    for (const t of transactions) {
      if (t.category === 'Income') continue
      const k = t.date.slice(0, 7)
      if (keys.has(k)) byCat.set(t.category, (byCat.get(t.category) ?? 0) + -t.amount)
      if (k === monthKey) thisMonth[t.category] = (thisMonth[t.category] ?? 0) + -t.amount
    }
    const cats = [...byCat.entries()].map(([name, value]) => ({ name, value: Math.round(value) })).sort((a, b) => b.value - a.value)
    return { cur, kpis, cats, thisMonth: thisMonth as Record<Category, number> }
  }, [range])

  const dark = theme === 'dark'
  const hour = TODAY.getHours()
  const greeting = hour < 12 ? 'Good morning' : 'Good afternoon'

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 pb-40 pt-6 md:px-8 lg:pb-24">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-stone-500">{TODAY.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">{greeting}, Maya</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">Sample data</span>
            <div className="flex rounded-xl bg-stone-200/70 p-1 dark:bg-stone-800" role="group" aria-label="Time range">
              {RANGES.map(r => (
                <button key={r} onClick={() => setRange(r)} aria-pressed={range === r}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${range === r ? 'bg-white shadow-sm dark:bg-stone-600' : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'}`}>
                  {r}M
                </button>
              ))}
            </div>
            <button onClick={() => setTheme(dark ? 'light' : 'dark')} aria-label={`Switch to ${dark ? 'light' : 'dark'} theme`}
              className="grid size-10 place-items-center rounded-xl bg-stone-200/70 hover:bg-stone-300/70 dark:bg-stone-800 dark:hover:bg-stone-700">
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <div className="mt-6"><Kpis items={view.kpis} /></div>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
          <Card title="Cash flow" action={<div className="flex gap-4 text-xs text-stone-500"><span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-brand" />Income</span><span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-amber-500" />Spending</span></div>}>
            <CashflowChart data={view.cur} dark={dark} />
          </Card>
          <Card title={`Where it went, ${range} months`}>
            <CategoryChart data={view.cats} />
          </Card>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.6fr]">
          <Card title={`${TODAY.toLocaleString('en-US', { month: 'long' })} budgets`}>
            <Budgets spent={view.thisMonth} />
          </Card>
          <Card title="Recent activity">
            <Transactions items={transactions} />
          </Card>
        </div>
      </main>
      <TabBar />
      <DemoBanner />
    </div>
  )
}
