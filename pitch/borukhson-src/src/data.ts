// Salon facts, team, reviews and photos taken from the salon's public map card (September 2026).

export const BRAND = {
  name: 'Марина Борухсон',
  short: 'МБ',
  tagline: 'Салон красоты в Химках',
  address: 'Химки, ул. Калинина, 9',
  addressNote: 'Этаж 1, помещение 4',
  phone: '+7 (977) 567-71-43',
  phoneHref: 'tel:+79775677143',
  hours: 'Ежедневно 10:00-22:00',
  open: 10,
  close: 22,
  rating: '5,0',
  ratings: 227,
  reviews: 181,
  yandexId: '160133495568',
  routeUrl: 'https://yandex.ru/maps/?rtext=~55.887382%2C37.443981&rtt=auto',
  coords: [55.887382, 37.443981] as const,
}

export const NAV = [
  { label: 'Услуги', href: '#services' },
  { label: 'Лазер', href: '#laser' },
  { label: 'Работы', href: '#gallery' },
  { label: 'Мастера', href: '#team' },
  { label: 'Отзывы', href: '#reviews' },
  { label: 'Контакты', href: '#contacts' },
]

/** Lacquer shades for the bottle in the hero, picked from the salon's own manicure photos. */
export const SHADES = [
  { id: 'berry', label: 'Ягодный', hex: '#b3245e' },
  { id: 'red', label: 'Красный', hex: '#c4142c' },
  { id: 'cobalt', label: 'Кобальт', hex: '#2141c4' },
  { id: 'bordeaux', label: 'Бордо', hex: '#62102a' },
  { id: 'nude', label: 'Нюд', hex: '#e6b2a4' },
  { id: 'milk', label: 'Молочный', hex: '#f1ebe6' },
]

export type Master = { id: string; name: string; role: string; cats: string[]; note: string }

// Names and specialities come from client reviews on the salon's map card.
export const TEAM: Master[] = [
  { id: 'yulia', name: 'Юлия', role: 'Наращивание ресниц', cats: ['lashes'], note: 'Про неё больше всего отзывов. Натуральный объём, лисий эффект, ресницы держатся до двух месяцев.' },
  { id: 'oksana', name: 'Оксана', role: 'Маникюр и педикюр', cats: ['mani', 'pedi'], note: 'К ней ходят годами. Следит за новинками палитры и знает ваши ногти лучше вас.' },
  { id: 'irina', name: 'Ирина', role: 'Парикмахер-колорист', cats: ['color', 'cut', 'care'], note: 'Окрашивание, стрижки, уходы. Умеет спасти неудачное тонирование.' },
  { id: 'dina', name: 'Дина', role: 'Бровист', cats: ['brows'], note: 'Коррекция и окрашивание бровей. Клиенты пишут: тонко и с большим вкусом.' },
  { id: 'silvia', name: 'Сильвия', role: 'Шугаринг и депиляция', cats: ['depil'], note: 'Любые зоны, быстро и почти без боли. Результата хватает надолго.' },
  { id: 'anna', name: 'Анна', role: 'Лазерная эпиляция', cats: ['laser', 'laserset'], note: 'Внимательно объясняет каждый шаг. Процедура проходит комфортно.' },
]

export type Review = { author: string; date: string; text: string; tag: string }

export const REVIEWS: Review[] = [
  { author: 'Надежда М.', date: '23 апреля 2026', tag: 'Ресницы', text: 'Я хотела эффект накрашенных ресниц, и чудо-мастер Юля сделала максимально натуральные, с лисьей стрелкой. Прекрасно проходила с ними два месяца. Очень советую этого мастера.' },
  { author: 'Заруи А.', date: '8 июля 2026', tag: 'Маникюр', text: 'Я постоянная клиентка уже не первый год. Оксана знает мои предпочтения и строение ногтей лучше меня самой. Девочки всегда предлагают новинки в палитре и рассказывают о трендах.' },
  { author: 'Анжела О.', date: '14 сентября 2026', tag: 'Атмосфера', text: 'Уютный, симпатичный салон с хорошей аурой. Отдельно хочу поблагодарить хозяйку Марину: она всегда внимательно выслушает клиента и идёт навстречу.' },
  { author: 'Катя А.', date: '27 июля 2025', tag: 'В 4 руки', text: 'Перед отпуском делала маникюр, педикюр и реснички. Девочки предложили сделать педикюр и ресницы в 4 руки без доплат. Сэкономила минимум два часа.' },
  { author: 'Ольга П.', date: '17 сентября 2025', tag: 'Шугаринг', text: 'Хожу сюда на маникюр, педикюр и шугаринг. Шугаринг у Сильвии лучший: вообще без боли и быстро, 10 из 10. Теперь только к ней.' },
  { author: 'Лидия З.', date: '25 октября 2025', tag: 'Ресницы', text: 'Наращивание делали не на кушетке, а в удобном кресле-трансформере. Спина не болит, есть куда положить руки. Очень аккуратный и заботливый мастер.' },
  { author: 'Карина О.', date: '17 апреля 2025', tag: 'Тотал блонд', text: 'Благодарна за окрашивание в тотал блонд. Цвет получился светлым, ровным и естественным. После окрашивания сделала массаж головы, это настоящее удовольствие.' },
  { author: 'Greza', date: '25 февраля 2025', tag: 'Брови', text: 'На оформление и окрашивание бровей хожу к Дине. Очень нравится её работа: с большим вкусом, тонко и благородно.' },
  { author: 'Julia Z.', date: '15 октября 2024', tag: 'Лазерная эпиляция', text: 'Салон чистый и стильный, удобная зона ожидания с заварным кофе и сладостями. Мастер лазерной эпиляции деликатная, всегда ответит на вопросы, процедуры проходят почти безболезненно.' },
  { author: 'Марина А.', date: '25 февраля 2025', tag: 'Запись', text: 'Можно попасть если не сегодня, то завтра точно. Не надо записываться за неделю. Для меня это важно: у меня ненормированная работа.' },
]

// What reviewers mention most, with the number of reviews per topic.
export const THEMES = [
  { label: 'Персонал', count: 163 },
  { label: 'Маникюр', count: 81 },
  { label: 'Атмосфера', count: 61 },
  { label: 'Компетентность', count: 60 },
  { label: 'Ресницы', count: 39 },
  { label: 'Время ожидания', count: 31 },
  { label: 'Чистота', count: 23 },
  { label: 'Кофе', count: 20 },
  { label: 'Эпиляция', count: 17 },
]

export const reviewWord = (n: number) => {
  const t = n % 10, h = n % 100
  if (t === 1 && h !== 11) return 'отзыв'
  if (t >= 2 && t <= 4 && (h < 12 || h > 14)) return 'отзыва'
  return 'отзывов'
}

export type Shot = { src: string; title: string; tag: string }

export const GALLERY: Shot[] = [
  { src: 'img/lashes-volume.jpg', title: 'Объём и изгиб', tag: 'Ресницы' },
  { src: 'img/nails-cobalt.jpg', title: 'Кобальт', tag: 'Маникюр' },
  { src: 'img/hair-total-blonde.jpg', title: 'Тотал блонд', tag: 'Окрашивание' },
  { src: 'img/brows-architecture.jpg', title: 'Архитектура бровей', tag: 'Брови' },
  { src: 'img/nails-milk.jpg', title: 'Молочный глянец', tag: 'Маникюр' },
  { src: 'img/pedi-berry.jpg', title: 'Малиновые блёстки', tag: 'Педикюр' },
  { src: 'img/lashes-natural.jpg', title: 'Натуральный эффект', tag: 'Ресницы' },
  { src: 'img/hair-bob-highlights.jpg', title: 'Каре с мелированием', tag: 'Окрашивание' },
  { src: 'img/nails-bordeaux.jpg', title: 'Бордо', tag: 'Маникюр' },
  { src: 'img/brows-blue.jpg', title: 'Брови и ресницы', tag: 'Брови' },
  { src: 'img/nails-glitter.jpg', title: 'Нюд с блеском', tag: 'Маникюр' },
  { src: 'img/hair-blonde-bob.jpg', title: 'Светлое каре', tag: 'Стрижка' },
  { src: 'img/pedi-cobalt.jpg', title: 'Синий педикюр', tag: 'Педикюр' },
  { src: 'img/lashes-long.jpg', title: 'Длинные ресницы', tag: 'Ресницы' },
  { src: 'img/nails-red.jpg', title: 'Красная классика', tag: 'Маникюр' },
  { src: 'img/hair-highlights-long.jpg', title: 'Мелирование на длину', tag: 'Окрашивание' },
  { src: 'img/brows-shape.jpg', title: 'Оформление бровей', tag: 'Брови' },
  { src: 'img/pedi-pearl.jpg', title: 'Перламутр', tag: 'Педикюр' },
  { src: 'img/nails-pink.jpg', title: 'Розовый миндаль', tag: 'Маникюр' },
  { src: 'img/hair-chocolate-bob.jpg', title: 'Шоколадное каре', tag: 'Стрижка' },
  { src: 'img/lashes-curl.jpg', title: 'Мягкий изгиб', tag: 'Ресницы' },
]

export const INTERIOR: Shot[] = [
  { src: 'img/int-moss.jpg', title: 'Стена из мха у входа', tag: 'Интерьер' },
  { src: 'img/int-hall.jpg', title: 'Зал', tag: 'Интерьер' },
  { src: 'img/int-nails.jpg', title: 'Маникюрная зона', tag: 'Интерьер' },
  { src: 'img/int-cosmo.jpg', title: 'Кабинет косметолога', tag: 'Интерьер' },
  { src: 'img/int-hair.jpg', title: 'Место парикмахера', tag: 'Интерьер' },
  { src: 'img/int-laser.jpg', title: 'Лазерная эпиляция', tag: 'Интерьер' },
]

// Service filters. `cats` are ids from prices.ts.
export const FILTERS = [
  { id: 'hits', label: 'Популярное', cats: [] as string[] },
  { id: 'nails', label: 'Ногти', cats: ['mani', 'pedi'] },
  { id: 'eyes', label: 'Ресницы и брови', cats: ['lashes', 'brows'] },
  { id: 'hair', label: 'Волосы', cats: ['cut', 'color', 'style', 'care'] },
  { id: 'laser', label: 'Эпиляция', cats: ['laserset', 'laser', 'depil'] },
  { id: 'face', label: 'Лицо', cats: ['clean', 'peel', 'facemassage', 'sphere', 'makeup'] },
  { id: 'body', label: 'Тело', cats: ['hardware', 'massage', 'wrap', 'tan'] },
]

export const PRICE_RANGES = [
  { id: 'all', label: 'Любая цена', min: 0, max: Infinity },
  { id: 'low', label: 'до 2 000 ₽', min: 0, max: 2000 },
  { id: 'mid', label: '2 000-4 000 ₽', min: 2000, max: 4000 },
  { id: 'high', label: 'от 4 000 ₽', min: 4000, max: Infinity },
]

// Popular services: the salon's own showcase on the map card plus what reviews praise most.
export const POPULAR: Record<string, string[]> = {
  mani: ['Маникюр + покрытие + снятие', 'Комплекс: маникюр + снятие + выравнивание + покрытие гель-лаком'],
  pedi: ['Смарт-педикюр (аппаратная обработка стоп) + покрытие + снятие'],
  lashes: ['Классическое наращивание 1Д', 'Наращивание 1,5Д', 'Ламинирование ресниц'],
  brows: ['Архитектура бровей (коррекция + окрашивание)'],
  cut: ['Стрижка женская (длина волос до 25 см)'],
  color: ['Тотал блонд (полное осветление, длина волос до 25 см)'],
  laserset: ['Комплекс 5. Всё тело без ограничений', 'Комплекс 1'],
  depil: ['Бикини глубокое'],
  massage: ['Классический 60 мин'],
  tan: ['Классический 1-2 слоя'],
}

/** Small things that make a visit here, all taken from the card and from reviews. */
export const PERKS = [
  { title: 'В 4 руки', text: 'Маникюр и педикюр или педикюр и ресницы одновременно. Экономит пару часов.' },
  { title: 'Кофе и сладости', text: 'Заварной кофе, чай и угощения, пока ждёте или сидите на процедуре.' },
  { title: 'Кресло вместо кушетки', text: 'Ресницы наращивают в кресле-трансформере: спина не устаёт, руки лежат удобно.' },
  { title: 'Хозяйка рядом', text: 'Марина сама встречает гостей, рассказывает об услугах и подбирает мастера.' },
  { title: 'Запись на завтра', text: 'Окно обычно находится в ближайшие дни, без записи за неделю.' },
  { title: 'Можно с собакой', text: 'А ещё парковка, Wi-Fi, оплата картой и подарочные сертификаты.' },
]

export const FAQ = [
  { q: 'Где вход в салон?', a: 'Химки, ул. Калинина, 9, первый этаж, помещение 4. Остановка «Сквер Юбилейный» в 140 метрах, рядом есть парковка.' },
  { q: 'Есть скидка на первый визит?', a: 'Да, новым клиентам 10% на первый визит. Для постоянных гостей есть абонементы на услуги.' },
  { q: 'Можно сделать несколько процедур сразу?', a: 'Да, мастера работают в 4 руки: например, маникюр и педикюр за один визит. Скажите об этом администратору при записи.' },
  { q: 'Вы выезжаете на дом?', a: 'Да, часть услуг мастера выполняют с выездом. Позвоните, и администратор скажет, какие именно.' },
  { q: 'Как перенести или отменить запись?', a: 'Позвоните администратору по номеру +7 (977) 567-71-43. Лучше предупредить заранее, чтобы мы предложили время другому гостю.' },
  { q: 'Можно подарить визит?', a: 'Да, есть подарочные сертификаты. Администратор поможет выбрать номинал и оформление.' },
]
