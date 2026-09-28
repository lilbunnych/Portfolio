// Laser hair removal: per-zone prices and the salon's five complexes (from the price list on the map card).

export type Zone = { id: string; label: string; price: number; group: 'body' | 'legs' | 'arms' | 'face' }

export const ZONES: Zone[] = [
  { id: 'bikini', label: 'Глубокое бикини', price: 2300, group: 'body' },
  { id: 'bikini-classic', label: 'Классическое бикини', price: 1500, group: 'body' },
  { id: 'armpits', label: 'Подмышки', price: 1100, group: 'body' },
  { id: 'belly-line', label: 'Белая линия', price: 800, group: 'body' },
  { id: 'belly', label: 'Живот полностью', price: 1800, group: 'body' },
  { id: 'buttocks', label: 'Ягодицы', price: 2800, group: 'body' },
  { id: 'back', label: 'Спина полностью', price: 2800, group: 'body' },
  { id: 'chest', label: 'Грудь', price: 2500, group: 'body' },
  { id: 'legs', label: 'Ноги полностью', price: 3500, group: 'legs' },
  { id: 'shins', label: 'Голени с коленями', price: 2850, group: 'legs' },
  { id: 'thighs', label: 'Бёдра', price: 2700, group: 'legs' },
  { id: 'arms', label: 'Руки полностью', price: 2800, group: 'arms' },
  { id: 'forearms', label: 'Руки ниже локтя', price: 1800, group: 'arms' },
  { id: 'upper-arms', label: 'Руки выше локтя', price: 1600, group: 'arms' },
  { id: 'lip', label: 'Над губой', price: 650, group: 'face' },
  { id: 'chin', label: 'Подбородок', price: 500, group: 'face' },
  { id: 'cheeks', label: 'Щёки', price: 850, group: 'face' },
  { id: 'face', label: 'Лицо полностью', price: 1650, group: 'face' },
  { id: 'neck', label: 'Шея', price: 1400, group: 'face' },
]

export const ZONE_GROUPS = [
  { id: 'body', label: 'Тело' },
  { id: 'legs', label: 'Ноги' },
  { id: 'arms', label: 'Руки' },
  { id: 'face', label: 'Лицо и шея' },
] as const

/** Zones that include other zones: "legs" already covers shins and thighs, and so on. */
export const INCLUDES: Record<string, string[]> = {
  legs: ['shins', 'thighs'],
  arms: ['forearms', 'upper-arms'],
  belly: ['belly-line'],
  face: ['lip', 'chin', 'cheeks'],
  bikini: ['bikini-classic'],
}

const withIncluded = (ids: string[]) => ids.flatMap(id => [id, ...(INCLUDES[id] ?? [])])

export type Complex = { n: number; name: string; price: number; covers: Set<string> | 'all'; picks: string[]; text: string }

export const COMPLEXES: Complex[] = [
  { n: 1, name: 'Комплекс 1', price: 2750, covers: new Set(withIncluded(['bikini', 'armpits'])), picks: ['bikini', 'armpits'], text: 'Глубокое бикини и подмышки' },
  { n: 2, name: 'Комплекс 2', price: 3950, covers: new Set(withIncluded(['bikini', 'armpits', 'shins'])), picks: ['bikini', 'armpits', 'shins'], text: 'Глубокое бикини, подмышки, голени' },
  { n: 3, name: 'Комплекс 3', price: 4600, covers: new Set(withIncluded(['bikini', 'armpits', 'legs'])), picks: ['bikini', 'armpits', 'legs'], text: 'Глубокое бикини, подмышки, ноги полностью' },
  { n: 4, name: 'Комплекс 4', price: 5600, covers: new Set(withIncluded(['bikini', 'armpits', 'legs', 'arms', 'buttocks', 'lip', 'belly-line'])), picks: ['bikini', 'armpits', 'legs', 'arms', 'buttocks', 'lip', 'belly-line'], text: 'Ноги и руки полностью, глубокое бикини, подмышки, ягодицы, над губой, белая линия' },
  { n: 5, name: 'Комплекс 5', price: 7000, covers: 'all', picks: ['bikini', 'armpits', 'belly', 'buttocks', 'back', 'chest', 'legs', 'arms', 'face', 'neck'], text: 'Всё тело без ограничений' },
]

/** Price of the picked zones, skipping zones already inside a bigger picked zone. */
export function zonesTotal(ids: string[]) {
  const covered = new Set(ids.flatMap(id => INCLUDES[id] ?? []))
  return ZONES.filter(z => ids.includes(z.id) && !covered.has(z.id)).reduce((s, z) => s + z.price, 0)
}

/** Cheapest complex that covers every picked zone, if any. */
export function bestComplex(ids: string[]) {
  if (!ids.length) return null
  return COMPLEXES.filter(c => c.covers === 'all' || ids.every(id => (c.covers as Set<string>).has(id)))
    .sort((a, b) => a.price - b.price)[0] ?? null
}
