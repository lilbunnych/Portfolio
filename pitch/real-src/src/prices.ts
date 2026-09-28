// Prices from the shop's public map card (September 2026). `from: true` means the shop lists the price as "от".
export type Service = { name: string; desc?: string; price: number | null; from?: boolean }
export type Category = { id: string; title: string; items: Service[] }

export const CATEGORIES: Category[] = [
  {
    id: 'cut', title: 'Стрижки', items: [
      { name: 'Модельная стрижка', desc: 'Кроп, фейд или классика, форма под ваш стиль.', price: 700, from: true },
      { name: 'Стрижка машинкой, 2 насадки', price: 600 },
      { name: 'Стрижка машинкой, 1 насадка', price: 500 },
      { name: 'Детская стрижка', desc: 'Малыши сидят в кресле-машинке.', price: 600 },
      { name: 'Окантовка', price: 300 },
      { name: 'Рисунок на волосах', desc: 'Узоры машинкой, например молния.', price: 100, from: true },
    ],
  },
  {
    id: 'beard', title: 'Борода и бритьё', items: [
      { name: 'Моделирование бороды', price: 600 },
      { name: 'Стрижка бороды и усов', price: 500 },
      { name: 'Королевское бритьё', desc: 'Классическое бритьё опасной бритвой.', price: 800 },
      { name: 'Королевское бритьё головы + борода', price: 1500 },
    ],
  },
  {
    id: 'combo', title: 'Комплекс', items: [
      { name: 'Комплекс стрижка + борода', desc: 'Стрижка и борода за один визит.', price: 1200 },
      { name: 'Восковая эпиляция', price: 300 },
    ],
  },
]
