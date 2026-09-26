import { useEffect } from 'react'
import Lenis from 'lenis'

let lenis: Lenis | null = null

/** Scrolls to a section, through Lenis when it is running. */
export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { duration: 1.4, offset: -80 })
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** Smooth scrolling plus in-page anchor links routed through Lenis. */
export function useSmoothScroll() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    lenis = new Lenis({ lerp: .09, smoothWheel: true, autoRaf: true })
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]')
      if (!a) return
      const id = a.getAttribute('href')!.slice(1)
      if (!id || !document.getElementById(id)) return
      e.preventDefault()
      scrollToId(id)
    }
    document.addEventListener('click', onClick)
    return () => { document.removeEventListener('click', onClick); lenis?.destroy(); lenis = null }
  }, [])
}
