import { BUDGETS, CATEGORY_COLORS, money, type Category } from '../data'

export function Budgets({ spent }: { spent: Record<Category, number> }) {
  const rows = (Object.keys(BUDGETS) as Category[]).map(c => ({ c, used: spent[c] ?? 0, cap: BUDGETS[c] }))
  return (
    <ul className="grid gap-4">
      {rows.map(({ c, used, cap }) => {
        const pct = Math.min(100, (used / cap) * 100)
        const over = used > cap
        return (
          <li key={c}>
            <div className="flex justify-between text-sm">
              <span>{c}</span>
              <span className={`num font-mono ${over ? 'text-rose-600 dark:text-rose-400' : 'text-stone-500'}`}>{money(used)} / {money(cap)}</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800" role="progressbar" aria-label={`${c} budget`} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${pct}%`, background: over ? '#e11d48' : CATEGORY_COLORS[c] }} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
