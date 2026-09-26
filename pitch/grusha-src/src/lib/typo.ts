// Russian typesetting: keep words and numbers that must not be split on one line.
const NBSP = ' '
const NBHY = '‑' // non-breaking hyphen

const SHORT = /(^|[\s «„"(—-])([А-Яа-яЁёA-Za-z]{1,2}|для|без|под|над|при|про)\s+/g
const PARTICLE = /\s+(ли|же|бы|ль)(?=[\s.,!?:;»)]|$)/g
const THOUSANDS = /(\d)\s+(?=\d{3}(?!\d))/g
const UNIT = /(\d)\s+(₽|руб\.?|м|км|см|мин|ч|лет|года|год|шт\.?|%)(?=[\s.,;:!?)»]|$)/g
const NUM_HYPHEN = /(\d)-(?=\d)/g
const WORD_HYPHEN = /([А-Яа-яЁёA-Za-z])-(?=[А-Яа-яЁёA-Za-z])/g // тест-прядь, гель-лак, чай-кофе
const BEFORE_NUM = /(№|до|от|за|с|по|на|в)\s+(?=\d)/gi
const DASH = /\s+(—|–)\s+/g
const DATE = /(\d)\s+(?=(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)(?![а-я]))/g
const PHONE = /\+7\s*\((\d{3})\)\s*(\d{3})[-\u2011](\d{2})[-\u2011](\d{2})/g

/** Returns the string with non-breaking spaces and hyphens where a line break would look broken. Idempotent. */
export function typo(s: string): string {
  if (!s || !/[\s-]/.test(s)) return s
  let out = s
  // run twice so chains of short words ("и в", "а с") all get glued
  out = out.replace(SHORT, (_, a, w) => a + w + NBSP).replace(SHORT, (_, a, w) => a + w + NBSP)
  return out
    .replace(PARTICLE, NBSP + '$1')
    .replace(THOUSANDS, '$1' + NBSP)
    .replace(THOUSANDS, '$1' + NBSP)
    .replace(UNIT, '$1' + NBSP + '$2')
    .replace(NUM_HYPHEN, '$1' + NBHY)
    .replace(WORD_HYPHEN, '$1' + NBHY)
    .replace(BEFORE_NUM, '$1' + NBSP)
    .replace(DASH, NBSP + '$1 ')
    .replace(DATE, '$1' + NBSP)
    .replace(PHONE, `+7${NBSP}($1)${NBSP}$2${NBHY}$3${NBHY}$4`)
}

const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'CODE', 'PRE'])

function fixNode(n: Node) {
  if (n.nodeType === Node.TEXT_NODE) {
    const v = n.nodeValue ?? ''
    const t = typo(v)
    if (t !== v) n.nodeValue = t
    return
  }
  if (n.nodeType !== Node.ELEMENT_NODE || SKIP.has((n as Element).tagName)) return
  const walker = document.createTreeWalker(n, NodeFilter.SHOW_TEXT)
  for (let t = walker.nextNode(); t; t = walker.nextNode()) {
    if (t.parentElement && SKIP.has(t.parentElement.tagName)) continue
    const v = t.nodeValue ?? ''
    const r = typo(v)
    if (r !== v) t.nodeValue = r
  }
}

/** Applies `typo` to every text node under `root`, now and whenever React renders new text. */
export function watchTypography(root: HTMLElement) {
  fixNode(root)
  const mo = new MutationObserver(list => {
    for (const m of list) {
      if (m.type === 'characterData') fixNode(m.target)
      else m.addedNodes.forEach(fixNode)
    }
  })
  mo.observe(root, { subtree: true, childList: true, characterData: true })
  return () => mo.disconnect()
}
