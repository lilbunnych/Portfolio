// Adapted from "Hover Expand Gallery" by kedhareswer on 21st.dev (pure CSS flex-basis transition).
// Changes: salon styling (hard borders, no rounded corners), caption block on the open panel, lazy images.
import * as React from 'react'

export type HoverExpandItem = {
  title: string
  meta?: string
  src?: string
  alt?: string
  accent?: string
}

export type HoverExpandGalleryProps = {
  items: HoverExpandItem[]
  /** Height of the desktop row (must be a definite length). */
  height?: string
  /** Width of a closed panel on desktop, px. */
  railWidth?: number
  /** Cap on the open panel's width on desktop, px. */
  maxOpenWidth?: number
  /** Height of the open panel's image below 1024px, px. */
  mobileImageHeight?: number
  defaultIndex?: number
  duration?: number
  className?: string
}

export default function HoverExpandGallery({
  items,
  height = '38rem',
  railWidth = 60,
  maxOpenWidth = 460,
  mobileImageHeight = 380,
  defaultIndex = 0,
  duration = 620,
  className = '',
}: HoverExpandGalleryProps) {
  const [active, setActive] = React.useState(defaultIndex)
  const current = Math.min(active, items.length - 1)

  const rootVars = {
    '--hx-h': height,
    '--hx-rail': `${railWidth}px`,
    '--hx-max': `${maxOpenWidth}px`,
    '--hx-t': `${duration}ms`,
  } as React.CSSProperties

  return (
    <div style={rootVars} className={`relative w-full border-2 border-foreground bg-card shadow-hard lg:h-[var(--hx-h)] lg:overflow-hidden ${className}`}>
      <ul className="flex w-full flex-col lg:h-full lg:flex-row">
        {items.map((item, index) => {
          const isActive = index === current
          const panelVars = {
            '--hx-basis': isActive ? 'var(--hx-max)' : 'var(--hx-rail)',
            '--hx-img-h': isActive ? `${mobileImageHeight}px` : '0px',
            '--hx-img-o': isActive ? 1 : 0,
          } as React.CSSProperties

          return (
            <li
              key={`${item.title}-${index}`}
              style={panelVars}
              className="border-b-2 border-foreground/15 last:border-b-0 lg:h-full lg:min-w-0 lg:flex-grow lg:border-b-0 lg:border-l-2 lg:first:border-l-0 lg:[flex-basis:var(--hx-basis)] lg:[flex-shrink:1] lg:transition-[flex-basis] lg:duration-[var(--hx-t)] lg:ease-[cubic-bezier(0.32,0.72,0,1)] lg:motion-reduce:transition-none"
            >
              <button
                type="button"
                aria-current={isActive}
                aria-label={item.title}
                onPointerEnter={e => { if (e.pointerType === 'mouse') setActive(index) }}
                onFocus={() => setActive(index)}
                onClick={() => setActive(index)}
                className="group relative block w-full cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary lg:h-full lg:overflow-hidden"
              >
                <span
                  aria-hidden={!isActive}
                  style={{ background: item.accent, opacity: 'var(--hx-img-o)' as unknown as number }}
                  className="relative block h-[var(--hx-img-h)] w-full overflow-hidden transition-[height,opacity] duration-[var(--hx-t)] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none lg:absolute lg:inset-y-3 lg:right-3 lg:left-[var(--hx-rail)] lg:h-auto lg:w-auto lg:transition-opacity"
                >
                  {item.src && (
                    <img src={item.src} alt={item.alt ?? item.title} loading="lazy" draggable={false}
                      className="block h-full w-full max-w-none object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]" />
                  )}
                  <span className="absolute bottom-0 left-0 hidden bg-foreground px-3 py-2 font-mono text-[.72rem] tracking-[.12em] text-cream uppercase lg:block">{item.meta}</span>
                </span>

                <span className={`flex h-16 w-full items-center justify-between gap-3 overflow-hidden px-5 text-[.95rem] font-medium transition-colors duration-[var(--hx-t)] lg:absolute lg:inset-y-0 lg:left-0 lg:h-full lg:w-[var(--hx-rail)] lg:flex-col-reverse lg:justify-between lg:px-0 lg:py-5 ${isActive ? 'text-foreground' : 'text-foreground/45'}`}>
                  <span className="truncate font-serif lg:rotate-180 lg:overflow-hidden lg:text-[1.05rem] lg:whitespace-nowrap lg:[writing-mode:vertical-rl]">{item.title}</span>
                  <span style={{ opacity: isActive && item.meta ? 1 : 0 }}
                    className="shrink-0 font-mono text-[.72rem] tracking-[.1em] uppercase transition-opacity duration-[var(--hx-t)] lg:rotate-180 lg:whitespace-nowrap lg:[writing-mode:vertical-rl]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
