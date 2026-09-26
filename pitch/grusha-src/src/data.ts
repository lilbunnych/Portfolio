// Salon facts, team, reviews and photos taken from the salon's public map card (September 2026).

export const BRAND = {
  name: 'Груша',
  logo: 'груша.',
  tagline: 'Салон красоты в Химках',
  address: 'Химки, ул. Академика Грушина, 8',
  addressNote: 'Вход с торца дома',
  phone: '+7 (915) 268-94-09',
  phoneHref: 'tel:+79152689409',
  hours: 'Ежедневно 10:00-21:00',
  open: 10,
  close: 21,
  rating: '5,0',
  ratings: 113,
  reviews: 94,
  yandexId: '26071151936',
  yandexUrl: 'https://yandex.ru/maps/org/grusha/26071151936/',
  reviewsUrl: 'https://yandex.ru/maps/org/grusha/26071151936/reviews/',
  routeUrl: 'https://yandex.ru/maps/?rtext=~55.909821%2C37.454721&rtt=auto',
  coords: [55.909821, 37.454721] as const,
}

export const NAV = [
  { label: 'Услуги', href: '#services' },
  { label: 'Работы', href: '#gallery' },
  { label: 'Мастера', href: '#team' },
  { label: 'Отзывы', href: '#reviews' },
  { label: 'Контакты', href: '#contacts' },
]

export type Master = { id: string; name: string; role: string; cats: string[]; note: string }

// Names and specialities come from client reviews on the Yandex card.
export const TEAM: Master[] = [
  { id: 'marina', name: 'Марина Сотникова', role: 'Стилист-колорист', cats: ['color', 'cut', 'style', 'perm'], note: 'Тотал блонд, контуринг, выход из чёрного. Клиенты ездят к ней больше десяти лет.' },
  { id: 'anna', name: 'Анна Гарипова', role: 'Мастер ухода и бровист', cats: ['care', 'style', 'brows'], note: 'Глубокие уходы для волос и архитектура бровей с учётом мимики.' },
  { id: 'kate-sh', name: 'Екатерина Шарова', role: 'Мастер маникюра и педикюра', cats: ['nails'], note: 'Аппаратный необрезной маникюр, покрытие держится до месяца.' },
  { id: 'kate', name: 'Екатерина', role: 'Мастер маникюра и педикюра', cats: ['nails'], note: 'Френч, дизайн, укрепление. Стерильность, которую отмечают даже медики.' },
  { id: 'oksana', name: 'Оксана', role: 'Косметолог', cats: ['clean', 'peel', 'meso', 'massage', 'laser'], note: 'Чистки, пилинги, мезотерапия, микротоки и лазерная эпиляция.' },
]

export type Review = { author: string; date: string; text: string; tag: string }

export const REVIEWS: Review[] = [
  { author: 'Александрова Е.', date: '24 мая 2026', tag: 'Маникюр', text: 'Наконец-то я нашла подходящее для себя бьюти место, где делают качественный маникюр, педикюр, брови, уход за волосами. К Екатерине Шаровой хожу на постоянной основе. Идеальное покрытие, держится более трёх недель.' },
  { author: 'Анна', date: '18 апреля 2026', tag: 'Атмосфера', text: 'Замечательная студия. Чувствуется приятная атмосфера женственности и красоты. Сидеть на процедуре: настоящее спа для ручек и ножек. Всё красиво, аккуратно, бережно и нежно.' },
  { author: 'Екатерина Сергеевна', date: '22 июля 2026', tag: 'Окрашивание', text: 'Делала в этой студии контуринг у Сотниковой Марины. Я в восторге от результата! Сервис и качество услуги на высоте. Очень приятный персонал, чай-кофе, атмосфера лёгкая.' },
  { author: 'Рида Т.', date: '17 апреля 2026', tag: 'Стрижка', text: 'Мастер Анна сделала классный уход моим волосам, а мастер Марина выполнила стрижку просто идеально, точно так, как я хотела! Видно, что люди любят своё дело.' },
  { author: 'Ольга Малышева', date: '23 апреля 2026', tag: 'Сервис', text: 'Современный салон с душевной атмосферой. Пока мастера колдуют над вашим имиджем, можно сделать массаж ног, выпить кофе с вкусными конфетами, поговорить на любую тему.' },
  { author: 'LEO', date: '20 декабря 2025', tag: 'Тотал блонд', text: 'Сделала окрашивание Тотал Блонд на свежую стрижку у Марины Сотниковой. Делали окрашивание в 4 руки. Марина и Аня поколдовали и сделали очень круто.' },
  { author: 'Нина', date: '14 февраля 2026', tag: 'Брови', text: 'Была на архитектуре бровей у Ани. Столько заботы от мастера и любви к своему делу, она корректировала брови даже в соответствии с моей мимикой.' },
  { author: 'Елена Степкина', date: '26 августа 2025', tag: 'Маникюр', text: 'Хожу с дочкой на маникюр к двум Катюшам, к стилисту Марине, у всех золотые ручки. Мне как медику очень важна стерильность в маникюре, тут я спокойна.' },
  { author: 'Нина Кочетова', date: '9 апреля 2025', tag: 'Брови', text: 'Мастера лучшие. Прислушиваются ко всем пожеланиям клиентов. Салон атмосферный, очень красивый, девочки с каждым приходом его усовершенствуют.' },
  { author: 'Анастасия С.', date: '19 ноября 2025', tag: 'Окрашивание', text: 'Марина мягко вывела меня из чёрного цвета и подарила новый образ и новое качество моих волос. За ухоженным маникюром и весёлым общением, велком к Катям.' },
]

// What reviewers mention most, with the number of reviews per topic.
export const THEMES = [
  { label: 'Персонал', count: 83 },
  { label: 'Маникюр', count: 41 },
  { label: 'Атмосфера', count: 33 },
  { label: 'Компетентность', count: 32 },
  { label: 'Кофе и угощения', count: 19 },
  { label: 'Педикюр', count: 12 },
  { label: 'Стрижка', count: 12 },
]

export const reviewWord = (n: number) => {
  const t = n % 10, h = n % 100
  if (t === 1 && h !== 11) return 'отзыв'
  if (t >= 2 && t <= 4 && (h < 12 || h > 14)) return 'отзыва'
  return 'отзывов'
}

export type Shot = { src: string; title: string; tag: string }

export const GALLERY: Shot[] = [
  { src: 'img/hair-copper-waves.jpg', title: 'Медные волны', tag: 'Окрашивание' },
  { src: 'img/nails-blossom.jpg', title: 'Весенний френч', tag: 'Маникюр' },
  { src: 'img/hair-silver-pixie.jpg', title: 'Серебряный пикси', tag: 'Стрижка' },
  { src: 'img/nails-leaves.jpg', title: 'Зелёный акцент', tag: 'Маникюр' },
  { src: 'img/hair-caramel.jpg', title: 'Карамельные блики', tag: 'Окрашивание' },
  { src: 'img/braids-red.jpg', title: 'Брейды с канекалоном', tag: 'Косы' },
  { src: 'img/hair-curly.jpg', title: 'Кудри после завивки', tag: 'Завивка' },
  { src: 'img/nails-hydrangea.jpg', title: 'Нюд и гортензии', tag: 'Маникюр' },
  { src: 'img/hair-green.jpg', title: 'Яркий зелёный', tag: 'Яркое окрашивание' },
  { src: 'img/lashes.jpg', title: 'Ламинирование ресниц', tag: 'Ресницы' },
  { src: 'img/hair-copper-bob.jpg', title: 'Медное каре', tag: 'Стрижка' },
  { src: 'img/nails-green-french.jpg', title: 'Зелёный френч', tag: 'Маникюр' },
  { src: 'img/hair-red.jpg', title: 'Красный градиент', tag: 'Яркое окрашивание' },
  { src: 'img/brows.jpg', title: 'Архитектура бровей', tag: 'Брови' },
  { src: 'img/hair-rainbow.jpg', title: 'Радужный андеркат', tag: 'Яркое окрашивание' },
  { src: 'img/nails-pink.jpg', title: 'Малиновый глянец', tag: 'Маникюр' },
  { src: 'img/hair-curls.jpg', title: 'Мягкие локоны', tag: 'Завивка' },
  { src: 'img/braids.jpg', title: 'Боксёрки', tag: 'Косы' },
]

export const INTERIOR: Shot[] = [
  { src: 'img/int-green-wall.jpg', title: 'Мойка у зелёной стены', tag: 'Интерьер' },
  { src: 'img/int-hall.jpg', title: 'Зал стилистов', tag: 'Интерьер' },
  { src: 'img/int-studio.jpg', title: 'Маникюрная зона', tag: 'Интерьер' },
  { src: 'img/int-cosmo.jpg', title: 'Кабинет косметолога', tag: 'Интерьер' },
]

// Service filters. `cats` are ids from prices.ts.
export const FILTERS = [
  { id: 'hits', label: 'Популярное', cats: [] as string[] },
  { id: 'hair', label: 'Волосы', cats: ['color', 'cut', 'style', 'care', 'perm', 'braids'] },
  { id: 'nails', label: 'Ногти', cats: ['nails'] },
  { id: 'brows', label: 'Брови и ресницы', cats: ['brows'] },
  { id: 'face', label: 'Лицо и тело', cats: ['clean', 'peel', 'meso', 'massage'] },
  { id: 'laser', label: 'Эпиляция', cats: ['laser'] },
]

export const PRICE_RANGES = [
  { id: 'all', label: 'Любая цена', min: 0, max: Infinity },
  { id: 'low', label: 'до 2 500 ₽', min: 0, max: 2500 },
  { id: 'mid', label: '2 500-7 000 ₽', min: 2500, max: 7000 },
  { id: 'high', label: 'от 7 000 ₽', min: 7000, max: Infinity },
]

// Popular services: what clients book and praise most often in reviews
// (manicure, pedicure, contouring, total blond, haircuts, brows, laser) plus the salon's signature colour work.
export const POPULAR: Record<string, string[]> = {
  color: ['Контуринг', 'Airtouch Средняя длина', 'Тотал блонд Длина до плеч', 'Выход из чёрного средняя длина, длинные, тонкие', 'Тонирование волос длина до плеч'],
  cut: ['Стрижка'],
  care: ['Глубокий уход длина до плеч'],
  braids: ['Боксерки с узором и канекалоном'],
  nails: ['Маникюр', 'Педикюр'],
  brows: ['Архитектура бровей (воск+пинцет) + окрашивание краской', 'Ламинирование ресниц'],
  clean: ['Ультразвуковая чистка лица'],
  laser: ['Сет 1. Подмышки + глубокое бикини'],
}

export const FAQ = [
  { q: 'Где вход в салон?', a: 'Химки, ул. Академика Грушина, 8, вход с торца дома. Остановка «Улица Павлова» в 140 метрах.' },
  { q: 'Есть ли парковка?', a: 'Да, у салона есть парковка, в том числе места для людей с инвалидностью, и велопарковка.' },
  { q: 'Можно ли приехать на коляске?', a: 'Да. У входа пандус, в зале нет порогов.' },
  { q: 'Работаете с кудрявыми волосами?', a: 'Да, это одно из наших направлений. Перед завивкой делаем тест-прядь за 1 000 ₽, чтобы проверить, как волосы примут состав.' },
  { q: 'Как перенести или отменить запись?', a: 'Позвоните администратору по номеру +7 (915) 268-94-09. Лучше предупредить заранее, чтобы мы предложили время другому гостю.' },
  { q: 'Можно подарить визит?', a: 'Да, есть подарочные сертификаты. Позвоните нам, и администратор поможет выбрать номинал и оформление.' },
]
