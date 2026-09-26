// Adapted from "Image Trail" by danielpetho (fancycomponents.dev) on 21st.dev.
// Changes: motion/react instead of framer-motion, crypto ids instead of uuid, pointer events,
// and trail items kept in state so React re-renders only when an item is added or removed.
import { Children, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { motion, useAnimate } from 'motion/react'
import type { AnimationSequence, DOMKeyframesDefinition, AnimationOptions } from 'motion/react'

type TrailSegment = [DOMKeyframesDefinition, AnimationOptions]

type ImageTrailProps = {
  children: ReactNode
  /** Element whose area the pointer is tracked in; positions are relative to it. */
  containerRef: RefObject<HTMLElement | null>
  rotationRange?: number
  animationSequence?: TrailSegment[]
  /** Minimum time between spawned items, ms. */
  interval?: number
  /** Minimum pointer travel between spawned items, px. */
  minDistance?: number
}

type Item = { id: string; x: number; y: number; rotation: number; child: ReactNode }

const DEFAULT_SEQUENCE: TrailSegment[] = [
  [{ scale: 1.2 }, { duration: .1, ease: 'circOut' }],
  [{ scale: 0 }, { duration: .5, ease: 'circIn' }],
]

export function ImageTrail({ children, containerRef, rotationRange = 15, animationSequence = DEFAULT_SEQUENCE, interval = 100, minDistance = 40 }: ImageTrailProps) {
  const [items, setItems] = useState<Item[]>([])
  const kids = useMemo(() => Children.toArray(children), [children])
  const last = useRef({ t: 0, x: -999, y: -999, i: 0 })

  useEffect(() => {
    const el = containerRef.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const x = e.clientX - r.left, y = e.clientY - r.top
      const now = performance.now(), l = last.current
      if (now - l.t < interval || Math.hypot(x - l.x, y - l.y) < minDistance) return
      l.t = now; l.x = x; l.y = y
      const child = kids[l.i % kids.length]
      l.i++
      setItems(prev => [...prev, { id: crypto.randomUUID(), x, y, rotation: (Math.random() - .5) * rotationRange * 2, child }])
    }
    el.addEventListener('pointermove', onMove)
    return () => el.removeEventListener('pointermove', onMove)
  }, [containerRef, kids, interval, minDistance, rotationRange])

  const remove = useCallback((id: string) => setItems(prev => prev.filter(i => i.id !== id)), [])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map(item => <TrailItem key={item.id} item={item} sequence={animationSequence} onComplete={remove} />)}
    </div>
  )
}

function TrailItem({ item, sequence, onComplete }: { item: Item; sequence: TrailSegment[]; onComplete: (id: string) => void }) {
  const [scope, animate] = useAnimate()
  useEffect(() => {
    const seq = sequence.map(([keyframes, options]) => [scope.current, keyframes, options]) as AnimationSequence
    const controls = animate(seq)
    controls.then(() => onComplete(item.id))
    return () => controls.stop()
  }, [animate, scope, sequence, item.id, onComplete])
  return (
    <motion.div ref={scope} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: item.x, top: item.y, rotate: item.rotation }}>
      {item.child}
    </motion.div>
  )
}
