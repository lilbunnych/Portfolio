import * as THREE from 'three'
import { DRIED, PALETTES, petalsFor, BUDGET } from '../data'
import { order, readout } from '../store'

export const RM = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const smooth = (t: number) => t * t * (3 - 2 * t)

type Look = {
  open: number; count: number; size: number; droop: number
  rough: number; sheen: number; caustic: number
  inner: THREE.Color; outer: THREE.Color; stem: THREE.Color; bgA: THREE.Color; bgB: THREE.Color
}
const C = (h: string) => new THREE.Color(h)
const look = (o: Omit<Look, 'inner' | 'outer' | 'stem' | 'bgA' | 'bgB'> & Record<'inner' | 'outer' | 'stem' | 'bgA' | 'bgB', string>): Look =>
  ({ ...o, inner: C(o.inner), outer: C(o.outer), stem: C(o.stem), bgA: C(o.bgA), bgB: C(o.bgB) })

// Story chapters: bud, story (palette cycles), bloom, forever (dried).
const STATES: Look[] = [
  look({ open: .05, count: 96, size: .95, droop: 0, rough: .5, sheen: 1, caustic: .3, inner: '#d63b6b', outer: '#ff9db5', stem: '#4f8a3c', bgA: '#f6f3f8', bgB: '#e2dbea' }),
  look({ open: .5, count: 96, size: 1, droop: 0, rough: .5, sheen: 1, caustic: .45, inner: '#d63b6b', outer: '#ff9db5', stem: '#4f8a3c', bgA: '#f7f2f4', bgB: '#eadbe3' }),
  look({ open: 1, count: 118, size: 1.06, droop: 0, rough: .45, sheen: 1, caustic: .7, inner: '#c8285a', outer: '#ff8fab', stem: '#4a8a3a', bgA: '#f1f2f8', bgB: '#d9dcef' }),
  look({ open: .78, count: 104, size: .96, droop: .3, rough: .9, sheen: .2, caustic: .2, inner: '#6e3f26', outer: '#c08a5e', stem: '#7d7648', bgA: '#f5f1ec', bgB: '#e4d9cc' }),
]
// Builder state: follows the order live.
const BUILD = look({ open: .9, count: 60, size: 1, droop: 0, rough: .5, sheen: 1, caustic: .5, inner: '#d63b6b', outer: '#ff9db5', stem: '#4f8a3c', bgA: '#f3f1f6', bgB: '#dfd9e8' })

/** The blended look the scene renders this frame. */
export const cur: Look = look({ open: 0, count: 0, size: 1, droop: 0, rough: .5, sheen: 1, caustic: .3, inner: '#fff', outer: '#fff', stem: '#fff', bgA: '#fff', bgB: '#fff' })
const mid: Look = look({ open: 0, count: 0, size: 1, droop: 0, rough: .5, sheen: 1, caustic: .3, inner: '#fff', outer: '#fff', stem: '#fff', bgA: '#fff', bgB: '#fff' })

function blendInto(out: Look, a: Look, b: Look, t: number) {
  for (const k of Object.keys(a) as (keyof Look)[]) {
    const av = a[k], bv = b[k]
    if (av instanceof THREE.Color) (out[k] as THREE.Color).copy(av).lerp(bv as THREE.Color, t)
    else (out[k] as number) = lerp(av, bv as number, t)
  }
}

/** Motion state shared by the scene components. */
export const motionState = { time: 0, wind: 0, spin: 0, tilt: 0, intro: RM ? 1 : 0, open: 0 }
export const layout = { x: 0, y: 0, s: 1, cx: .68, cy: .56 }

let prog = 0, bW = 0
const cycle = { i: 0, t: 0 }
const tmp = new THREE.Color()

// Drag to turn
let spinV = 0, dragging = false, lastX = 0, lastY = 0
export function bindDrag() {
  const down = (e: PointerEvent) => {
    if ((e.target as Element).closest('a,button,input,textarea,select,[data-no-drag]')) return
    dragging = true; lastX = e.clientX; lastY = e.clientY
  }
  const move = (e: PointerEvent) => {
    if (!dragging) return
    spinV = (e.clientX - lastX) * .006; motionState.spin += spinV
    motionState.tilt = clamp(motionState.tilt + (e.clientY - lastY) * .003, -.4, .4)
    lastX = e.clientX; lastY = e.clientY
  }
  const up = () => { dragging = false }
  addEventListener('pointerdown', down); addEventListener('pointermove', move)
  addEventListener('pointerup', up); addEventListener('pointercancel', up)
  return () => {
    removeEventListener('pointerdown', down); removeEventListener('pointermove', move)
    removeEventListener('pointerup', up); removeEventListener('pointercancel', up)
  }
}

/** Places the rose in the free area right of the text column (desktop) or at the top (phones). */
export function computeLayout(w: number, h: number, fov: number, camZ: number) {
  const vw0 = 2 * Math.tan(THREE.MathUtils.degToRad(fov / 2)) * camZ * (w / h)
  const upp = vw0 / w
  if (w >= 980) {
    const padL = Math.max(32, (w - 1280) / 2 + 32)
    const textR = padL + Math.min(560, w * .42) + 48, right = w - 190
    const cx = (textR + right) / 2, room = Math.min((right - textR) / 2, h * .36)
    layout.x = (cx - w / 2) * upp; layout.y = -.08; layout.s = clamp((room * upp) / 1.55, .5, 1.1)
    layout.cx = cx / w; layout.cy = .56
  } else {
    layout.x = 0; layout.y = .62; layout.s = Math.min(.58, w / 680)
    layout.cx = .5; layout.cy = .7
  }
}

/** Advance one frame: scroll progress, palette cycle, builder look, blend, wind, drag inertia. */
export function step(dt: number) {
  const ms = motionState
  ms.time += dt
  const time = ms.time

  const chapters = document.getElementById('chapters'), builder = document.getElementById('builder')
  let target = 0, bTarget = 0
  if (chapters && builder) {
    const r = chapters.getBoundingClientRect()
    target = clamp(-r.top / (r.height - innerHeight * .9), 0, 1) * 3
    bTarget = clamp((innerHeight - builder.getBoundingClientRect().top) / (innerHeight * .7), 0, 1)
  }
  prog += (target - prog) * (RM ? 1 : .06)
  bW += (bTarget - bW) * (RM ? 1 : .07)
  ms.intro = Math.min(1, ms.intro + dt * .45)
  ms.wind = RM ? 0 : Math.sin(time * .9) * .6 + Math.sin(time * 2.3) * .25 + Math.sin(time * 5.1) * .08

  // "Story" chapter cycles through the palettes
  cycle.t += dt
  if (cycle.t > 2.6) { cycle.t = 0; cycle.i = (cycle.i + 1) % 5 }
  const cp = PALETTES[cycle.i]
  STATES[1].inner.lerp(tmp.set(cp.heart), .05); STATES[1].outer.lerp(tmp.set(cp.outer), .05)

  // Builder look follows the order
  const o = order.get(), bp = PALETTES[o.palette], dried = o.palette === DRIED
  BUILD.inner.lerp(tmp.set(bp.heart), .08); BUILD.outer.lerp(tmp.set(bp.outer), .08)
  BUILD.stem.lerp(tmp.set(dried ? '#7d7648' : '#4f8a3c'), .08)
  BUILD.count = lerp(BUILD.count, petalsFor(o.budget), .12)
  BUILD.size = lerp(BUILD.size, .86 + ((o.budget - BUDGET.min) / (BUDGET.max - BUDGET.min)) * .3, .1)
  BUILD.rough = lerp(BUILD.rough, dried ? .9 : .5, .08)
  BUILD.sheen = lerp(BUILD.sheen, dried ? .2 : 1, .08)
  BUILD.droop = lerp(BUILD.droop, dried ? .3 : 0, .08)

  const i0 = Math.min(2, Math.floor(prog))
  blendInto(mid, STATES[i0], STATES[i0 + 1], smooth(clamp(prog - i0, 0, 1)))
  blendInto(cur, mid, BUILD, smooth(bW))
  ms.open = cur.open * smooth(ms.intro) + (RM ? 0 : Math.sin(time * .8) * .012)

  if (!dragging) { spinV *= .94; ms.spin += spinV + (RM ? 0 : dt * .12); ms.tilt *= .96 }

  readout.set({ open: Math.round(cur.open * 100), count: Math.round(cur.count), palette: cp.name })
}
