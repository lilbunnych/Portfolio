import { useMemo, useState } from 'react'
import { MagnifyingGlass, SortAscending, SortDescending } from '@phosphor-icons/react'
import { CATEGORY_COLORS, categories, money, type Txn } from '../data'

type SortKey = 'date' | 'amount'

export function Transactions({ items }: { items: Txn[] }) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string>('All')
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'date', dir: -1 })
  const [limit, setLimit] = useState(12)

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return items
      .filter(t => (cat === 'All' || t.category === cat) && (!needle || t.merchant.toLowerCase().includes(needle)))
      .sort((a, b) => sort.key === 'date' ? a.date.localeCompare(b.date) * sort.dir : (Math.abs(a.amount) - Math.abs(b.amount)) * sort.dir)
  }, [items, q, cat, sort])

  const toggle = (key: SortKey) => setSort(s => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : -1 }))
  const SortIcon = sort.dir === 1 ? SortAscending : SortDescending

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <label className="relative md:w-60 md:shrink-0">
          <span className="sr-only">Search merchants</span>
          <MagnifyingGlass size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={q} onChange={e => { setQ(e.target.value); setLimit(12) }} placeholder="Search merchants"
            className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand dark:border-stone-700 dark:bg-stone-800" />
        </label>
        <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto pb-1 md:pb-0" role="group" aria-label="Filter by category">
          {['All', 'Income', ...categories].map(c => (
            <button key={c} onClick={() => { setCat(c); setLimit(12) }} aria-pressed={cat === c}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${cat === c ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900' : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <table className="mt-4 w-full text-sm">
        <thead className="text-left text-xs text-stone-500">
          <tr className="border-b border-stone-200 dark:border-stone-800">
            <th className="py-2 font-medium"><button onClick={() => toggle('date')} className="inline-flex items-center gap-1">Date {sort.key === 'date' && <SortIcon size={14} />}</button></th>
            <th className="py-2 font-medium">Merchant</th>
            <th className="hidden py-2 font-medium sm:table-cell">Category</th>
            <th className="py-2 text-right font-medium"><button onClick={() => toggle('amount')} className="inline-flex items-center gap-1">Amount {sort.key === 'amount' && <SortIcon size={14} />}</button></th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, limit).map(t => (
            <tr key={t.id} className="border-b border-stone-100 last:border-0 dark:border-stone-800/70">
              <td className="num whitespace-nowrap py-3 pr-3 text-stone-500">{new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
              <td className="py-3 pr-3 font-medium">{t.merchant}</td>
              <td className="hidden py-3 pr-3 sm:table-cell">
                <span className="inline-flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                  <span className="size-2 rounded-full" style={{ background: t.category === 'Income' ? '#10b981' : CATEGORY_COLORS[t.category] }} />{t.category}
                </span>
              </td>
              <td className={`num py-3 text-right font-mono ${t.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>{t.amount > 0 ? '+' : ''}{money(t.amount, true)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="py-10 text-center text-sm text-stone-500">No transactions match “{q}”. Try another merchant or category.</p>}
      {rows.length > limit && (
        <button onClick={() => setLimit(l => l + 12)} className="mt-4 w-full rounded-xl border border-stone-200 py-2.5 text-sm font-medium hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800">
          Show more ({rows.length - limit} left)
        </button>
      )}
    </div>
  )
}
