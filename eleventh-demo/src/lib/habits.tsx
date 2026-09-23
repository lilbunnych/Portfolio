import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'

export interface Habit { id: string; name: string; icon: string; color: string; createdAt: string }
type Log = Record<string, string[]> // dateKey -> habit ids completed
interface State { habits: Habit[]; log: Log; ready: boolean }

type Action =
  | { type: 'load'; state: Omit<State, 'ready'> }
  | { type: 'toggle'; day: string; id: string }
  | { type: 'add'; habit: Habit }
  | { type: 'remove'; id: string }
  | { type: 'reset' }

export const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }

const KEY = 'sprout-v1'

// Sample data: five habits and two months of history (deterministic).
function sample(): Omit<State, 'ready'> {
  const start = addDays(new Date(), -70)
  const habits: Habit[] = [
    { id: 'h1', name: 'Drink 2 L of water', icon: 'water', color: '#2f80ed', createdAt: dayKey(start) },
    { id: 'h2', name: 'Read 20 pages', icon: 'book', color: '#f2994a', createdAt: dayKey(start) },
    { id: 'h3', name: 'Walk 8,000 steps', icon: 'walk', color: '#1f7a55', createdAt: dayKey(start) },
    { id: 'h4', name: 'Meditate 10 minutes', icon: 'leaf', color: '#00a3a3', createdAt: dayKey(start) },
    { id: 'h5', name: 'No phone after 22:00', icon: 'moon', color: '#9b51e0', createdAt: dayKey(start) },
  ]
  const log: Log = {}
  let seed = 7
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  const odds = [0.9, 0.6, 0.7, 0.55, 0.4]
  for (let i = 70; i >= 1; i--) {
    const k = dayKey(addDays(new Date(), -i))
    log[k] = habits.filter((_, j) => rnd() < odds[j] + (i < 14 ? 0.1 : 0)).map(h => h.id)
  }
  log[dayKey(new Date())] = ['h1']
  return { habits, log }
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'load': return { ...a.state, ready: true }
    case 'toggle': {
      const cur = s.log[a.day] ?? []
      const next = cur.includes(a.id) ? cur.filter(x => x !== a.id) : [...cur, a.id]
      return { ...s, log: { ...s.log, [a.day]: next } }
    }
    case 'add': return { ...s, habits: [...s.habits, a.habit] }
    case 'remove': {
      const log: Log = {}
      for (const k in s.log) log[k] = s.log[k].filter(x => x !== a.id)
      return { ...s, habits: s.habits.filter(h => h.id !== a.id), log }
    }
    case 'reset': return { ...sample(), ready: true }
  }
}

const Ctx = createContext<{ state: State; dispatch: (a: Action) => void } | null>(null)

export function HabitsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { habits: [], log: {}, ready: false })

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then(raw => dispatch({ type: 'load', state: raw ? JSON.parse(raw) : sample() }))
      .catch(() => dispatch({ type: 'load', state: sample() }))
  }, [])

  useEffect(() => {
    if (state.ready) AsyncStorage.setItem(KEY, JSON.stringify({ habits: state.habits, log: state.log })).catch(() => {})
  }, [state])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useHabits() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useHabits must be used inside HabitsProvider')
  return ctx
}

export function streakOf(log: Log, id: string, today = new Date()) {
  let n = 0
  let d = today
  if (!(log[dayKey(d)] ?? []).includes(id)) d = addDays(d, -1) // today not done yet: count up to yesterday
  while ((log[dayKey(d)] ?? []).includes(id)) { n++; d = addDays(d, -1) }
  return n
}
