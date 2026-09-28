import { useCallback, useEffect } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import type { Shot } from '@/data'

export function Lightbox({ items, index, onIndex, onClose }: { items: Shot[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const it = items[index]
  const go = useCallback((d: number) => onIndex((index + d + items.length) % items.length), [index, items.length, onIndex])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [go, onClose])
  return (
    <motion.div
      role="dialog" aria-modal="true" aria-label={it.title}
      className="fixed inset-0 z-[70] grid place-items-center bg-foreground/80 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.figure
        key={it.src}
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="relative max-h-[88svh] max-w-[min(92vw,720px)]"
        onClick={e => e.stopPropagation()}
      >
        <img src={it.src} alt={it.title} className="max-h-[80svh] w-auto rounded-3xl object-contain" />
        <figcaption className="mt-3 flex items-center justify-between text-background">
          <span><span className="eyebrow !text-background/60">{it.tag}</span><br /><b>{it.title}</b></span>
          <span className="text-sm text-background/60">{index + 1} / {items.length}</span>
        </figcaption>
      </motion.figure>
      <button onClick={e => { e.stopPropagation(); go(-1) }} aria-label="Назад" className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-background/90"><ArrowLeft className="h-5 w-5" /></button>
      <button onClick={e => { e.stopPropagation(); go(1) }} aria-label="Вперёд" className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-background/90"><ArrowRight className="h-5 w-5" /></button>
      <button onClick={onClose} aria-label="Закрыть" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-background/90"><X className="h-5 w-5" /></button>
    </motion.div>
  )
}
