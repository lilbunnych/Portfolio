// Shop facts, team, reviews and photos taken from the shop's public map card (September 2026).

export const BRAND = {
  name: 'РЕАЛ',
  logo: 'REAL',
  tagline: 'Барбершоп в Новокуркино',
  address: 'Химки, ул. Марии Рубцовой, 5',
  addressNote: 'Новокуркино. Остановка «Стокманн» в 380 метрах, рядом парковка и велопарковка',
  phone: '+7 (994) 888-88-79',
  phoneHref: 'tel:+79948888879',
  hours: 'Ежедневно 10:00-21:00',
  open: 10,
  close: 21,
  rating: '5,0',
  ratingValue: 5,
  ratings: 135,
  reviews: 88,
  yandexId: '39002232539',
  routeUrl: 'https://yandex.ru/maps/?rtext=~55.907761%2C37.400215&rtt=auto',
  coords: [55.907761, 37.400215] as const,
}

export const NAV = [
  { label: 'Чек', href: '#services' },
  { label: 'Работы', href: '#gallery' },
  { label: 'Барберы', href: '#team' },
  { label: 'Отзывы', href: '#reviews' },
  { label: 'Контакты', href: '#contacts' },
]

export type Master = { id: string; name: string; role: string; cats: string[]; note: string }

// Names and strengths come from client reviews on the shop's map card.
export const TEAM: Master[] = [
  { id: 'dizik', name: 'Дилзатбек', role: 'Для своих просто Дизик', cats: ['cut', 'beard', 'combo'], note: 'Главная легенда отзывов: к нему ходят по три-четыре года. Не боится пробовать новое, после стрижки делает массаж в подарок.' },
  { id: 'aziz', name: 'Азиз', role: 'Барбер', cats: ['cut', 'beard', 'combo'], note: 'Внимателен к каждой детали и может предложить что-то от себя. Стрижёт целые семьи.' },
  { id: 'ravshan', name: 'Равшан', role: 'Барбер', cats: ['cut', 'beard'], note: 'Качественно и быстро, отлично знает своё дело.' },
]

export type Review = { author: string; date: string; text: string; tag: string }

export const REVIEWS: Review[] = [
  { author: 'Шерзод Х.', date: '7 октября 2024', tag: 'Массаж', text: 'Стригусь у Дизика уже где-то три года. Ни разу не подвёл. За массаж отдельный респект: делает массаж после стрижки в качестве комплимента.' },
  { author: 'Станислав Г.', date: '9 марта 2024', tag: 'Цена', text: 'По уровню и качеству ничуть не хуже именитых салонов. Есть оздоровительные услуги: массаж, фитобочка. А главное, очень доступная цена.' },
  { author: 'Евгений К.', date: '23 июня 2024', tag: 'Дети', text: 'Хожу к Дизику, шикарно стрижёт, попробовал несколько стрижек за пару лет. Приходил с ребёнком, подстригли в кресле-автомобиле. За цену отдельное спасибо.' },
  { author: 'Ислам Ш.', date: '14 октября 2024', tag: 'Сервис', text: 'Мастер Дилзатбек выполнил работу аккуратно и грамотно. Очень воспитанный молодой человек, всегда даёт советы по стрижке и уходу за волосами.' },
  { author: 'Бек К.', date: '7 октября 2024', tag: 'Кроп', text: 'Решил рискнуть и попробовать у Дизика кроп. Сделал всё чётко. Теперь хожу к нему.' },
  { author: 'Амир З.', date: '27 августа 2024', tag: 'Внимание к деталям', text: 'Барбер Азиз проявил высокий профессионализм, уделил внимание каждой детали. Ушёл целый час, но результат меня полностью удовлетворил.' },
  { author: 'Александр К.', date: '19 мая 2024', tag: 'Настроение', text: 'Ещё ни разу ни из одной парикмахерской я не выходил в таком отличном настроении. А массаж после стрижки прямо реанимировал.' },
  { author: 'Абдумалик Ж.', date: '21 марта 2024', tag: 'Издалека', text: 'Приехали за 80 км от дома, знакомые посоветовали. Мастер Азизилло очень хорошо стрижёт, место классное, все удобства есть.' },
  { author: 'Олег Ч.', date: '26 октября 2024', tag: 'Постоянный клиент', text: 'Стригусь здесь уже года три-четыре у мастера Дизика. Золотые руки! Всегда ухожу довольный.' },
  { author: 'Нурислам К.', date: '29 марта 2026', tag: 'Атмосфера', text: 'Очень уютное место, мастера все добрые. Стрижка, массаж, так ещё и голову помоют.' },
]

// What reviewers mention most, with the number of reviews per topic.
export const THEMES = [
  { label: 'Персонал', count: 61 },
  { label: 'Барберы', count: 47 },
  { label: 'Стрижка', count: 46 },
  { label: 'Компетентность', count: 14 },
]

export const reviewWord = (n: number) => {
  const t = n % 10, h = n % 100
  if (t === 1 && h !== 11) return 'отзыв'
  if (t >= 2 && t <= 4 && (h < 12 || h > 14)) return 'отзыва'
  return 'отзывов'
}

export type Shot = { src: string; title: string; tag: string }

export const GALLERY: Shot[] = [
  { src: 'img/kid-pattern.jpg', title: 'Молния на висках', tag: 'Рисунок' },
  { src: 'img/man-cut.jpg', title: 'Классика с пробором', tag: 'Модельная' },
  { src: 'img/kid-cut.jpg', title: 'Детский фейд', tag: 'Детская' },
  { src: 'img/kids-yellow.jpg', title: 'Братья после стрижки', tag: 'Детская' },
  { src: 'img/hall-car.jpg', title: 'Кресло-машинка', tag: 'Для детей' },
  { src: 'img/clients.jpg', title: 'В кресле у барбера', tag: 'Процесс' },
  { src: 'img/hall-mirrors.jpg', title: 'Зеркала и неон', tag: 'Интерьер' },
  { src: 'img/logo-neon.jpg', title: 'Real Barbershop', tag: 'Вывеска' },
]

export const INTERIOR: Shot[] = [
  { src: 'img/hall.jpg', title: 'Зал', tag: 'Интерьер' },
  { src: 'img/hall-car.jpg', title: 'Кресло-машинка для детей', tag: 'Интерьер' },
  { src: 'img/facade.jpg', title: 'Вход с улицы', tag: 'Фасад' },
  { src: 'img/rb-sign.jpg', title: 'Знак RB', tag: 'Интерьер' },
]

// Service filters. `cats` are ids from prices.ts.
export const FILTERS = [
  { id: 'all', label: 'Всё', cats: ['cut', 'beard', 'combo'] },
  { id: 'cut', label: 'Стрижки', cats: ['cut'] },
  { id: 'beard', label: 'Борода и бритьё', cats: ['beard'] },
  { id: 'combo', label: 'Комплекс', cats: ['combo'] },
]

export const PRICE_RANGES = [
  { id: 'all', label: 'Любая цена', min: 0, max: Infinity },
  { id: 'low', label: 'до 500 ₽', min: 0, max: 501 },
  { id: 'mid', label: '500-800 ₽', min: 501, max: 801 },
  { id: 'high', label: 'от 800 ₽', min: 801, max: Infinity },
]

export const POPULAR: Record<string, string[]> = {
  cut: ['Модельная стрижка', 'Детская стрижка'],
  beard: ['Королевское бритьё'],
  combo: ['Комплекс стрижка + борода'],
}

export const FAQ = [
  { q: 'Где вас найти?', a: 'Химки, ул. Марии Рубцовой, 5, Новокуркино. Остановка «Стокманн» в 380 метрах, рядом парковка и велопарковка.' },
  { q: 'Стрижёте детей?', a: 'Да. Детская стрижка 600 ₽, малыши сидят в кресле-машинке. Можно сделать рисунок на волосах.' },
  { q: 'Есть массаж и фитобочка?', a: 'Да, кроме стрижек есть массаж и фитобочка. Цены и свободное время уточните у администратора по телефону.' },
  { q: 'Как оплатить?', a: 'Наличными, банковским переводом или онлайн.' },
  { q: 'Можно с питомцем?', a: 'Только с кошкой. Серьёзно, так написано в правилах заведения.' },
  { q: 'Как записаться?', a: 'Онлайн на сайте или по телефону +7 (994) 888-88-79. Если опаздываете, предупредите барбера.' },
]
