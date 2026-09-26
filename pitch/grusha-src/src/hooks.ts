import { useEffect } from 'react'
import Lenis from 'lenis'

let lenis: Lenis | null = null

export const stopScroll = (stop: boolean) => (stop ? lenis?.stop() : lenis?.start())

/** Smooth scrolling plus in-page anchor links routed through Lenis. */
export function useSmoothScroll() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true, autoRaf: true })
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]')
      if (!a) return
      const id = a.getAttribute('href')!.slice(1)
      if (!id) { e.preventDefault(); lenis?.scrollTo(0, { duration: 1.4 }); return }
      const el = document.getElementById(id)
      if (!el) return
      e.preventDefault()
      lenis?.scrollTo(el, { duration: 1.4, offset: -24 })
    }
    document.addEventListener('click', onClick)
    return () => { document.removeEventListener('click', onClick); lenis?.destroy(); lenis = null }
  }, [])
}

export const rub = (n: number | null) => (n === null ? 'по запросу' : n.toLocaleString('ru-RU') + '\u00a0₽')
