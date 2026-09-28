// Prices from the shop's public map card (September 2026).
export type Service = { name: string; desc?: string; price: number | null }
export type Category = { id: string; title: string; items: Service[] }

export const CATEGORIES: Category[] = [
  {
    id: 'cut', title: 'Стрижки', items: [
      { name: 'Мужская стрижка', desc: 'Классические и современные мужские стрижки под ваш стиль.', price: 1500 },
      { name: 'Стрижка + моделирование', desc: 'Стрижка и форма, которая подчеркнёт ваш стиль. Учтём пожелания и предложим варианты.', price: 2800 },
      { name: 'Стрижка машинкой (1-2 насадки)', desc: 'Короткая аккуратная стрижка машинкой.', price: 900 },
    ],
  },
  {
    id: 'beard', title: 'Борода', items: [
      { name: 'Моделирование бороды опасной бритвой', desc: 'Идеальная форма и чистый контур с опасной бритвой.', price: 1400 },
      { name: 'Моделирование бороды (без опасного бритья)', desc: 'Форма и контур бороды без опасной бритвы.', price: 1200 },
    ],
  },
  {
    id: 'promo', title: 'Акции', items: [
      { name: 'Акция «Первый визит»', desc: 'Для новых клиентов: скидка на первую стрижку.', price: 1200 },
      { name: 'Акция «Отец + сын»', desc: 'Приходите с сыном: стрижка для двоих.', price: 2750 },
    ],
  },
]
