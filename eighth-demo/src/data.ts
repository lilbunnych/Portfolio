// Deterministic sample data so every visit shows the same dashboard.
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(20260923)

export type Category = 'Housing' | 'Groceries' | 'Dining' | 'Transport' | 'Shopping' | 'Health' | 'Travel' | 'Subscriptions'

export const CATEGORY_COLORS: Record<Category, string> = {
  Housing: '#0f766e',
  Groceries: '#14b8a6',
  Dining: '#f59e0b',
  Transport: '#6366f1',
  Shopping: '#ec4899',
  Health: '#22c55e',
  Travel: '#0ea5e9',
  Subscriptions: '#a8a29e',
}

export const BUDGETS: Record<Category, number> = {
  Housing: 1850, Groceries: 520, Dining: 300, Transport: 180, Shopping: 250, Health: 120, Travel: 400, Subscriptions: 60,
}

export interface Month { key: string; label: string; income: number; spending: number }
export interface Txn { id: string; date: string; merchant: string; category: Category | 'Income'; amount: number }

const MERCHANTS: Record<Category, string[]> = {
  Housing: ['Oakridge Rentals', 'City Power', 'Aqua Utilities'],
  Groceries: ['Greenleaf Market', 'Corner Grocer', 'Harvest Co-op'],
  Dining: ['Luma Ramen', 'Bread & Bean', 'Taqueria Sol', 'Night Owl Pizza'],
  Transport: ['Metro Card', 'Shell Station', 'CityBike'],
  Shopping: ['North Supply', 'Paper Goods', 'Atlas Outdoor'],
  Health: ['Riverside Pharmacy', 'Pulse Gym'],
  Travel: ['Skyway Air', 'Harbor Hotel'],
  Subscriptions: ['Streamly', 'Cloud Storage', 'Newsroom Daily'],
}
const CATS = Object.keys(MERCHANTS) as Category[]

const today = new Date(2026, 8, 23)
const MONTHS: Month[] = []
const TXNS: Txn[] = []

for (let m = 11; m >= 0; m--) {
  const d = new Date(today.getFullYear(), today.getMonth() - m, 1)
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  const label = d.toLocaleString('en-US', { month: 'short' })
  const income = Math.round(5800 + rand() * 900 + (m % 4 === 0 ? 650 : 0))
  let spending = 0
  const lastDay = m === 0 ? today.getDate() : new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()

  TXNS.push({ id: `${key}-pay`, date: `${key}-01`, merchant: 'Northwind Payroll', category: 'Income', amount: income })
  for (const cat of CATS) {
    const budget = BUDGETS[cat]
    const n = cat === 'Housing' ? 3 : cat === 'Travel' ? (rand() < 0.35 ? 2 : 0) : 2 + Math.floor(rand() * 4)
    const share = (0.55 + rand() * 0.6) * budget * (m === 0 ? today.getDate() / 30 : 1)
    for (let i = 0; i < n; i++) {
      const amount = Math.round((share / n) * (0.6 + rand() * 0.8) * 100) / 100
      spending += amount
      const day = 1 + Math.floor(rand() * lastDay)
      const list = MERCHANTS[cat]
      TXNS.push({ id: `${key}-${cat}-${i}`, date: `${key}-${String(day).padStart(2, '0')}`, merchant: list[Math.floor(rand() * list.length)], category: cat, amount: -amount })
    }
  }
  MONTHS.push({ key, label, income, spending: Math.round(spending) })
}

TXNS.sort((a, b) => b.date.localeCompare(a.date))

export const months = MONTHS
export const transactions = TXNS
export const categories = CATS
export const STARTING_BALANCE = 18400
export const TODAY = today

export const money = (n: number, cents = false) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: cents ? 2 : 0, minimumFractionDigits: cents ? 2 : 0 }).format(n)
