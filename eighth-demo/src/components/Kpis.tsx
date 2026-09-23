import { ArrowDownRight, ArrowUpRight } from '@phosphor-icons/react'
import { money } from '../data'

export interface Kpi { label: string; value: number; delta: number | null; format?: 'money' | 'pct'; goodWhenUp?: boolean }

export function Kpis({ items }: { items: Kpi[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {items.map(k => {
        const up = (k.delta ?? 0) >= 0
        const good = k.goodWhenUp === false ? !up : up
        return (
          <div key={k.label} className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
            <p className="text-sm text-stone-500 dark:text-stone-400">{k.label}</p>
            <p className="num mt-2 font-mono text-2xl font-medium tracking-tight md:text-[1.7rem]">
              {k.format === 'pct' ? `${k.value.toFixed(1)}%` : money(k.value)}
            </p>
            {k.delta !== null && (
              <p className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${good ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {up ? <ArrowUpRight size={14} weight="bold" /> : <ArrowDownRight size={14} weight="bold" />}
                {Math.abs(k.delta).toFixed(1)}{k.format === 'pct' ? ' pts' : '%'} vs previous period
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
