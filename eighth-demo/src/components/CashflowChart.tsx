import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { money, type Month } from '../data'

export function CashflowChart({ data, dark }: { data: Month[]; dark: boolean }) {
  const grid = dark ? '#292524' : '#e7e5e4'
  const tick = dark ? '#a8a29e' : '#78716c'
  return (
    <div className="h-64 md:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0f766e" stopOpacity={0.35} /><stop offset="100%" stopColor="#0f766e" stopOpacity={0} /></linearGradient>
            <linearGradient id="spd" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} /><stop offset="100%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={grid} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: tick, fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} width={48} tick={{ fill: tick, fontSize: 12 }} tickFormatter={v => `$${v / 1000}k`} />
          <Tooltip
            formatter={(v, name) => [money(Number(v)), name === 'income' ? 'Income' : 'Spending']}
            contentStyle={{ borderRadius: 12, border: `1px solid ${grid}`, background: dark ? '#1c1917' : '#fff', fontSize: 13 }}
            labelStyle={{ color: tick }}
          />
          <Area type="monotone" dataKey="income" stroke="#0f766e" strokeWidth={2.2} fill="url(#inc)" />
          <Area type="monotone" dataKey="spending" stroke="#f59e0b" strokeWidth={2.2} fill="url(#spd)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
