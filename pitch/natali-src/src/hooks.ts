import { useEffect, useState } from 'react'
import Lenis from 'lenis'

let lenis: Lenis | null = null

/** Smooth scrolling plus in-page anchor links routed through Lenis. */
export function useSmoothScroll() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    lenis = new Lenis({ lerp: .085, smoothWheel: true, autoRaf: true })
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest<HTMLElement>('a[href^="#"], [data-go]')
      if (!a) return
      const id = a.dataset.go || a.getAttribute('href')!.slice(1)
      const el = id && document.getElementById(id)
      if (!el) return
      e.preventDefault()
      lenis?.scrollTo(el, { duration: 1.6, offset: el.closest('#sheet') ? -40 : 0 })
    }
    document.addEventListener('click', onClick)
    return () => { document.removeEventListener('click', onClick); lenis?.destroy(); lenis = null }
  }, [])
}

/** Which chapter is active and whether the page chrome (rail, HUD, mobile CTA) should show. */
export function useChrome() {
  const [s, setS] = useState({ active: 0, onSheet: false, hudHidden: false, fabHidden: true })
  useEffect(() => {
    const read = () => {
      const ch = document.getElementById('chapters'), b = document.getElementById('builder'), sh = document.getElementById('sheet')
      if (!ch || !b || !sh) return
      const r = ch.getBoundingClientRect(), br = b.getBoundingClientRect(), sr = sh.getBoundingClientRect()
      const prog = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight * .9))) * 3
      const bw = Math.min(1, Math.max(0, (innerHeight - br.top) / (innerHeight * .7)))
      const next = {
        active: bw > .6 ? 4 : Math.round(prog),
        onSheet: sr.top < innerHeight * .6,
        hudHidden: sr.top < innerHeight * .6 || br.top < innerHeight * .9,
        fabHidden: scrollY < innerHeight * .5 || (br.top < innerHeight * .8 && br.bottom > innerHeight * .2),
      }
      setS(p => (p.active === next.active && p.onSheet === next.onSheet && p.hudHidden === next.hudHidden && p.fabHidden === next.fabHidden) ? p : next)
    }
    read()
    addEventListener('scroll', read, { passive: true }); addEventListener('resize', read)
    return () => { removeEventListener('scroll', read); removeEventListener('resize', read) }
  }, [])
  return s
}
