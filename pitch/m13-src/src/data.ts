// Shop facts, team, reviews and photos taken from the shop's public map card (September 2026).

export const BRAND = {
  name: 'M13',
  logo: 'M13',
  tagline: 'Барбершоп в Химках',
  address: 'Химки, ул. 9 Мая, 10Б',
  addressNote: 'Остановка «Улица 9-го Мая, 12» в 80 метрах, рядом парковка',
  phone: '+7 (936) 286-00-10',
  phoneHref: 'tel:+79362860010',
  hours: 'Ежедневно 10:00-22:00',
  open: 10,
  close: 22,
  rating: '5,0',
  ratingValue: 5,
  ratings: 346,
  reviews: 196,
  yandexId: '186999175325',
  routeUrl: 'https://yandex.ru/maps/?rtext=~55.902184%2C37.414656&rtt=auto',
  coords: [55.902184, 37.414656] as const,
}

export const NAV = [
  { label: 'Услуги', href: '#services' },
  { label: 'Работы', href: '#gallery' },
  { label: 'Барберы', href: '#team' },
  { label: 'Отзывы', href: '#reviews' },
  { label: 'Контакты', href: '#contacts' },
]

export type Master = { id: string; name: string; role: string; cats: string[]; note: string }

// Names and strengths come from client reviews on the shop's map card.
export const TEAM: Master[] = [
  { id: 'mark', name: 'Марк', role: 'Барбер', cats: ['cut', 'beard', 'promo'], note: 'Больше всего благодарностей в отзывах. К нему ходят целыми семьями, вместе с детьми.' },
  { id: 'akmal', name: 'Акмал', role: 'Барбер', cats: ['cut', 'beard', 'promo'], note: 'Постоянные клиенты ходят к нему годами. Стрижёт и отцов, и сыновей.' },
  { id: 'ziko', name: 'Зико', role: 'Барбер', cats: ['cut', 'beard'], note: 'Понимает с полуслова и умеет работать с удлинёнными стрижками.' },
  { id: 'alexander', name: 'Александр', role: 'Барбер', cats: ['cut', 'beard', 'promo'], note: 'Стрижка, борода и воск. Легко находит общий язык с детьми.' },
  { id: 'numon', name: 'Нумон', role: 'Барбер', cats: ['cut', 'beard'], note: 'Помогает уточнить пожелания, чтобы стрижка вышла ещё лучше задуманной.' },
  { id: 'maga', name: 'Мага', role: 'Барбер', cats: ['cut', 'promo'], note: 'Спокойно стрижёт даже малышей младше двух лет.' },
]

export type Review = { author: string; date: string; text: string; tag: string }

export const REVIEWS: Review[] = [
  { author: 'Кирилл С.', date: '18 мая 2026', tag: 'Стрижка', text: 'Небольшой, уютный и очень чистый барбершоп. Мастер внимательно выслушал пожелания и сделал стрижку точно под форму головы, густоту волос и стиль. Получилось даже лучше, чем я ожидал.' },
  { author: 'Кирилл Л.', date: '27 сентября 2026', tag: 'Атмосфера', text: 'Прекрасное обращение к клиентам, очень вежливый администратор. У заведения нет давящего пафоса, всё сделано для людей. Заслуженные 5 звёзд.' },
  { author: 'Валентина М.', date: '17 апреля 2025', tag: 'Дети', text: 'Мастер Марк сотворил чудо и сделал стрижку абсолютно «несидящему» кричащему ребёнку. Обычно максимум был под машинку, а тут настоящая стрижка!' },
  { author: 'Овиг В.', date: '12 августа 2026', tag: 'Удлинённые стрижки', text: 'Мне кажется, Зико переплюнул моего прошлого барбера. Замечательный мастер и приятный собеседник. Умеет работать с удлинёнными стрижками.' },
  { author: 'Наталья Д.', date: '5 апреля 2025', tag: 'Сервис', text: 'Чисто, гостеприимно, для ждущих чай и кофе с конфетками. Муж ходит только сюда, мастер Марк всё делает чётко и красиво.' },
  { author: 'Сандор К.', date: '9 сентября 2021', tag: 'Постоянный клиент', text: 'Лучше барбершопа в Химках нет, я стригся во всех. Всегда спокойно и без суеты. Главное здесь качество и желаемый результат. Постоянно хожу к Акмалу.' },
  { author: 'Майя Б.', date: '5 мая 2024', tag: 'Дети', text: 'Подстригли сынишку быстро и практически без слёз. Тут и машинка, и мультики по телевизору, всё продумано для маленьких посетителей.' },
  { author: 'Марина М.', date: '11 мая 2025', tag: 'Без записи', text: 'Проезжали мимо и сразу попали без записи к мастеру Саше. Стрижка головы, бороды и воск. Всё чётко и ровно.' },
  { author: 'Ашот Б.', date: '20 октября 2020', tag: 'Борода', text: 'Барберы высочайшего уровня, таким я себя даже не представлял. Моделирование бороды без комментариев, просто кайф. Приятная обстановка и культура обслуживания.' },
  { author: 'Богдан', date: '12 ноября 2025', tag: 'Интерьер', text: 'Классное место в стиле лофт. Нажал на первого попавшегося мастера и записался. Постригли максимально круто.' },
]

// What reviewers mention most, with the number of reviews per topic.
export const THEMES = [
  { label: 'Персонал', count: 161 },
  { label: 'Барберы', count: 106 },
  { label: 'Стрижка', count: 76 },
  { label: 'Атмосфера', count: 45 },
  { label: 'Компетентность', count: 38 },
  { label: 'Интерьер', count: 13 },
  { label: 'Кофе', count: 12 },
]

export const reviewWord = (n: number) => {
  const t = n % 10, h = n % 100
  if (t === 1 && h !== 11) return 'отзыв'
  if (t >= 2 && t <= 4 && (h < 12 || h > 14)) return 'отзыва'
  return 'отзывов'
}

export type Shot = { src: string; title: string; tag: string }

export const GALLERY: Shot[] = [
  { src: 'img/cut-fade-1.jpg', title: 'Фейд и укладка', tag: 'Стрижка' },
  { src: 'img/beard-trim.jpg', title: 'Контур бороды', tag: 'Борода' },
  { src: 'img/cut-scissors.jpg', title: 'Работа ножницами', tag: 'Стрижка' },
  { src: 'img/shave-towel.jpg', title: 'Горячее полотенце', tag: 'Бритьё' },
  { src: 'img/cut-fade-2.jpg', title: 'Короткий фейд', tag: 'Стрижка' },
  { src: 'img/cut-neck.jpg', title: 'Чистый затылок', tag: 'Стрижка' },
  { src: 'img/shave-foam.jpg', title: 'Опасная бритва', tag: 'Борода' },
  { src: 'img/cut-comb.jpg', title: 'Пробор по расчёске', tag: 'Стрижка' },
  { src: 'img/wash.jpg', title: 'Мытьё головы', tag: 'Уход' },
  { src: 'img/cut-clipper.jpg', title: 'Машинка и триммер', tag: 'Стрижка' },
  { src: 'img/cut-wash-dry.jpg', title: 'Сушка и укладка', tag: 'Укладка' },
]

export const INTERIOR: Shot[] = [
  { src: 'img/hall.jpg', title: 'Зал', tag: 'Интерьер' },
  { src: 'img/lounge.jpg', title: 'Зона ожидания', tag: 'Интерьер' },
  { src: 'img/reception-bar.jpg', title: 'Ресепшен и кофе', tag: 'Интерьер' },
  { src: 'img/tools.jpg', title: 'Инструменты', tag: 'Интерьер' },
  { src: 'img/hall-mirror.jpg', title: 'Кирпич и дерево', tag: 'Интерьер' },
  { src: 'img/facade.jpg', title: 'Вход с улицы', tag: 'Фасад' },
]

// Service filters. `cats` are ids from prices.ts.
export const FILTERS = [
  { id: 'hits', label: 'Популярное', cats: [] as string[] },
  { id: 'cut', label: 'Стрижки', cats: ['cut'] },
  { id: 'beard', label: 'Борода', cats: ['beard'] },
  { id: 'promo', label: 'Акции', cats: ['promo'] },
]

export const PRICE_RANGES = [
  { id: 'all', label: 'Любая цена', min: 0, max: Infinity },
  { id: 'low', label: 'до 1 300 ₽', min: 0, max: 1300 },
  { id: 'mid', label: '1 300-2 000 ₽', min: 1300, max: 2000 },
  { id: 'high', label: 'от 2 000 ₽', min: 2000, max: Infinity },
]

// Popular services: the shop's own showcase plus what reviews praise most.
export const POPULAR: Record<string, string[]> = {
  cut: ['Мужская стрижка', 'Стрижка + моделирование'],
  beard: ['Моделирование бороды опасной бритвой'],
  promo: ['Акция «Отец + сын»', 'Акция «Первый визит»'],
}

/** Why families come here: facts from the card and from reviews. */
export const PERKS = [
  { title: 'Детская комната', text: 'Машинка, мультики по телевизору и мастера, которые спокойно стригут даже малышей.' },
  { title: 'Отец + сын', text: 'Стрижка для двоих по акции. Многие приходят всей семьёй к одному барберу.' },
  { title: 'Первый визит', text: 'Первая стрижка по акции за 1 200 ₽.' },
  { title: 'Кофе с конфетами', text: 'Чай и кофе от администратора входят в стоимость стрижки.' },
  { title: 'Можно с собакой', text: 'Пускаем с собаками до 35 см.' },
  { title: 'Без пафоса', text: 'Лофт, кирпич и дерево. Спокойно, без суеты, всё для людей.' },
]

export const FAQ = [
  { q: 'Где вход?', a: 'Химки, ул. 9 Мая, 10Б, вход с улицы под вывеской M13. Остановка «Улица 9-го Мая, 12» в 80 метрах, рядом парковка.' },
  { q: 'Стрижёте детей?', a: 'Да, и очень любим. Есть детская комната с мультиками. Для папы с сыном действует акция «Отец + сын».' },
  { q: 'Можно прийти без записи?', a: 'Если барбер свободен, примем сразу. Чтобы не ждать, запишитесь онлайн или по телефону.' },
  { q: 'Есть скидка на первый визит?', a: 'Да: по акции «Первый визит» первая стрижка стоит 1 200 ₽.' },
  { q: 'Как оплатить?', a: 'Наличными, картой, безналичным переводом или по QR-коду.' },
  { q: 'Можно подарить стрижку?', a: 'Да, есть подарочные сертификаты. Позвоните, и администратор поможет с номиналом.' },
]
