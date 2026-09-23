// Portfolio notice shown at the bottom of every demo.
export function DemoBanner() {
  return (
    <div
      role="note"
      aria-label="Demo site notice"
      className="fixed inset-x-0 bottom-0 z-[2147483647] flex h-[46px] items-center justify-center gap-3.5 border-t-[3px] border-black px-3.5 font-extrabold uppercase tracking-[.14em] text-[#111] shadow-[0_-6px_18px_rgba(0,0,0,.25)]"
      style={{ background: 'repeating-linear-gradient(-45deg,#ffd400 0 22px,#ffc400 22px 44px)', fontFamily: 'system-ui,-apple-system,sans-serif' }}
    >
      <span className="rounded bg-[#111] px-3 py-1.5 text-[20px] tracking-[.2em] text-[#ffd400]">DEMO</span>
      <span className="truncate text-[11px] tracking-[.06em] sm:text-[13px]">Portfolio demo · fictional brand · not a real product</span>
    </div>
  )
}
