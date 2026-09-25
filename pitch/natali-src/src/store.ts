import { useSyncExternalStore } from 'react'

/** Tiny external store: React components subscribe, the 3D loop reads and writes without re-rendering. */
function createStore<T extends object>(initial: T) {
  let state = initial
  const subs = new Set<() => void>()
  return {
    get: () => state,
    set(patch: Partial<T>) {
      const next = { ...state, ...patch }
      if ((Object.keys(patch) as (keyof T)[]).every(k => next[k] === state[k])) return
      state = next
      subs.forEach(f => f())
    },
    subscribe(f: () => void) {
      subs.add(f)
      return () => { subs.delete(f) }
    },
  }
}

/** The bouquet the visitor is composing (builder writes, rose reads every frame). */
export const order = createStore({ occasion: 'День рождения', budget: 3500, palette: 0 })
export const useOrder = () => useSyncExternalStore(order.subscribe, order.get)

/** Values the 3D stage reports back to the page (only changes when the rounded numbers change). */
export const readout = createStore({ open: 4, count: 96, palette: 'Нежная' })
export const useReadout = () => useSyncExternalStore(readout.subscribe, readout.get)
