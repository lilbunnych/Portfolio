import { useSyncExternalStore } from 'react'
import type { Service } from './prices'

export type CartItem = Service & { cat: string }

type Booking = {
  cart: CartItem[]
  cat: string          // category open in the service step
  master: string       // master id or 'any'
  day: string          // ISO date
  time: string         // "HH:MM"
  step: number         // 0 services, 1 master, 2 time, 3 contacts, 4 done
}

let state: Booking = { cart: [], cat: 'hair', master: 'any', day: '', time: '', step: 0 }
const subs = new Set<() => void>()
const emit = () => subs.forEach(f => f())

/** Booking wizard state, shared by the price list, the direction cards and the wizard itself. */
export const booking = {
  get: () => state,
  subscribe(f: () => void) { subs.add(f); return () => { subs.delete(f) } },
  set(patch: Partial<Booking>) { state = { ...state, ...patch }; emit() },
  toggle(item: CartItem) {
    const has = state.cart.some(c => c.name === item.name && c.cat === item.cat)
    state = { ...state, cart: has ? state.cart.filter(c => !(c.name === item.name && c.cat === item.cat)) : [...state.cart, item] }
    emit()
  },
  has: (item: CartItem) => state.cart.some(c => c.name === item.name && c.cat === item.cat),
  reset() { state = { cart: [], cat: state.cat, master: 'any', day: '', time: '', step: 0 }; emit() },
}

export const useBooking = () => useSyncExternalStore(booking.subscribe, booking.get)
