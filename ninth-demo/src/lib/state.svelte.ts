// App state with localStorage persistence (Svelte 5 runes).
export type Mode = 'focus' | 'short' | 'long'
export interface Task { id: string; title: string; done: boolean }
export interface Session { at: number; minutes: number; taskId: string | null }
export interface Settings { focus: number; short: number; long: number; longEvery: number; sound: boolean }

const KEY = 'tempo-v1'
const DEFAULT_TASKS: Task[] = [
  { id: 't1', title: 'Outline the quarterly report', done: false },
  { id: 't2', title: 'Review two pull requests', done: false },
  { id: 't3', title: 'Inbox to zero', done: true },
]

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null') } catch { return null }
}
const saved = load()

// A few past sessions so the stats are not empty on first visit (sample data).
function seedSessions(): Session[] {
  const out: Session[] = []
  const day = 86400000
  const counts = [3, 5, 2, 6, 4, 1]
  counts.forEach((n, i) => {
    for (let k = 0; k < n; k++) out.push({ at: Date.now() - (6 - i) * day + k * 1800000, minutes: 25, taskId: null })
  })
  return out
}

export const app = $state({
  tasks: (saved?.tasks as Task[]) ?? DEFAULT_TASKS,
  sessions: (saved?.sessions as Session[]) ?? seedSessions(),
  settings: (saved?.settings as Settings) ?? { focus: 25, short: 5, long: 15, longEvery: 4, sound: true },
  activeTask: ((saved?.activeTask as string | null | undefined) ?? 't1') as string | null,
})

export function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(app)) } catch { /* private mode */ }
}

export function uid() { return Math.random().toString(36).slice(2, 9) }

export function chime() {
  try {
    const ctx = new AudioContext()
    ;[0, 0.18, 0.36].forEach((t, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.type = 'sine'; o.frequency.value = [880, 1108.7, 1318.5][i]
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t)
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.6)
      o.connect(g).connect(ctx.destination); o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.65)
    })
  } catch { /* audio unavailable */ }
}
