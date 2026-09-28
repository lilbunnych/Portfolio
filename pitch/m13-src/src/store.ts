import { useSyncExternalStore } from 'react'
import type { Service } from './prices'

export type CartItem = Service & { cat: string }

type Booking = {
  open: boolean
  cart: CartItem[]
  cat: string          // category open in the services step
  master: string       // master id or 'any'
  day: string          // ISO date
  time: string         // "HH:MM"
  step: number         // 0 services, 1 master, 2 time, 3 contacts, 4 done
}

let state: Booking = { open: false, cart: [], cat: 'color', master: 'any', day: '', time: '', step: 0 }
const subs = new Set<() => void>()
const emit = () => subs.forEach(f => f())
const same = (a: CartItem, b: CartItem) => a.name === b.name && a.cat === b.cat && a.price === b.price

/** Booking state shared by the price list, the team cards and the booking dialog. */
export const booking = {
  get: () => state,
  subscribe(f: () => void) { subs.add(f); return () => { subs.delete(f) } },
  set(patch: Partial<Booking>) { state = { ...state, ...patch }; emit() },
  open(patch: Partial<Booking> = {}) { state = { ...state, step: state.step === 4 ? 0 : state.step, ...patch, open: true }; emit() },
  close() { state = { ...state, open: false }; emit() },
  toggle(item: CartItem) {
    state = { ...state, cart: state.cart.some(c => same(c, item)) ? state.cart.filter(c => !same(c, item)) : [...state.cart, item] }
    emit()
  },
  has: (item: CartItem) => state.cart.some(c => same(c, item)),
  reset() { state = { ...state, cart: [], master: 'any', day: '', time: '', step: 0 }; emit() },
}

export const useBooking = () => useSyncExternalStore(booking.subscribe, booking.get)
