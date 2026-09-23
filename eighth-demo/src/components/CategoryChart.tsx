import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { CATEGORY_COLORS, money, type Category } from '../data'

export function CategoryChart({ data }: { data: { name: Category; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <div className="grid items-center gap-4 sm:grid-cols-[180px_1fr]">
      <div className="relative mx-auto size-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius="68%" outerRadius="100%" paddingAngle={2} stroke="none" isAnimationActive={false}>
              {data.map(d => <Cell key={d.name} fill={CATEGORY_COLORS[d.name]} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
          <span className="text-xs text-stone-500">Spent</span>
          <span className="num font-mono text-lg font-medium">{money(total)}</span>
        </div>
      </div>
      <ul className="grid gap-2 text-sm">
        {data.map(d => (
          <li key={d.name} className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: CATEGORY_COLORS[d.name] }} />
            <span className="flex-1 text-stone-600 dark:text-stone-300">{d.name}</span>
            <span className="num font-mono">{money(d.value)}</span>
            <span className="num w-10 text-right text-xs text-stone-400">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
