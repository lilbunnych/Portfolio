// Small inline icons (stroke 1.8/2, currentColor), kept in one place.
type P = { className?: string }
const base = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, viewBox: '0 0 24 24' }

export const Check = ({ className }: P) => <svg {...base} strokeWidth={2} className={className}><path d="M20 6 9 17l-5-5" /></svg>
export const ArrowDown = ({ className }: P) => <svg {...base} strokeWidth={2} className={className}><path d="M12 5v14M6 13l6 6 6-6" /></svg>
export const Send = ({ className }: P) => <svg {...base} strokeWidth={2} className={className}><path d="m22 2-7 20-4-9-9-4z" /><path d="M22 2 11 13" /></svg>
export const Pin = ({ className }: P) => <svg {...base} strokeWidth={1.8} className={className}><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
export const Chat = ({ className }: P) => <svg {...base} strokeWidth={1.8} className={className}><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M8 9h8M8 13h5" /></svg>
