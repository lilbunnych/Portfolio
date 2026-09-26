// Content collected from the salon's Yandex Maps card (2026-09-26): services, team names from reviews, photos, reviews.

export const BRAND = {
  name: 'Tina Studio',
  mapsName: 'Рутина',
  slogan: ['Сияй,', 'чёрт возьми!'],
  rating: '5,0',
  votes: 392,
  reviews: 268,
  award: 'Хорошее место 2026',
  hours: 'Открыто до 22:00',
  address: 'Химки, ул. Энгельса, 7/15',
  phone: '+7 (968) 738-33-38',
  phoneHref: 'tel:+79687383338',
  whatsapp: 'https://wa.me/79687383338',
  telegram: 'https://t.me/tina_studio_team',
  vk: 'https://vk.ru/tina__studio',
  maps: 'https://yandex.ru/maps/org/rutina/240894615468/',
  coords: { lat: 55.894574, lon: 37.442549 },
}

export const img = (name: string) => `./img/${name}.jpg`

/** The nine directions shown as cards; `from` is the lowest price in that part of the price list. */
export const DIRECTIONS: { id: string; title: string; text: string; from: number; photo: string }[] = [
  { id: 'hair', title: 'Волосы', text: 'Стрижки, окрашивание, AirTouch и балаяж, уходы Kevin Murphy и Nashi Argan.', from: 1200, photo: 'hair-copper' },
  { id: 'nails', title: 'Ногти', text: 'Пилочный и японский маникюр, покрытие, наращивание, дизайн.', from: 1750, photo: 'nails-dried-flowers' },
  { id: 'podo', title: 'Подология', text: 'Подологический педикюр, онихолизис, коррекция вросшего ногтя.', from: 3000, photo: 'pedi-white' },
  { id: 'brows', title: 'Брови и ресницы', text: 'Архитектура бровей, ламинирование, окрашивание.', from: 1200, photo: 'brows-architecture' },
  { id: 'pmu', title: 'Перманент', text: 'Брови, губы, стрелки и межресничка.', from: 2600, photo: 'brows-natural' },
  { id: 'cosmo', title: 'Косметология', text: 'Чистки, пилинги, карбокси, массажное спа для лица.', from: 3700, photo: 'cosmo-mask' },
  { id: 'epil', title: 'Эпиляция', text: 'Шугаринг, воск и диодный лазер, в том числе для мужчин.', from: 400, photo: 'int-studio' },
  { id: 'makeup', title: 'Макияж', text: 'Дневной, вечерний и экспресс-макияж, укладка локоны.', from: 3500, photo: 'makeup-evening' },
  { id: 'spa', title: 'Спа и массаж', text: 'Лимфодренаж, антицеллюлитное спа, обёртывания.', from: 2600, photo: 'int-lounge' },
]

export type Work = { photo: string; title: string; meta: string; cat: 'hair' | 'nails' | 'brows' | 'face' }
export const WORKS: Work[] = [
  { photo: 'hair-copper', title: 'Медное окрашивание', meta: 'Волосы', cat: 'hair' },
  { photo: 'nails-dried-flowers', title: 'Маникюр с сухоцветами', meta: 'Ногти', cat: 'nails' },
  { photo: 'hair-blonde-waves', title: 'Блонд и локоны', meta: 'Волосы', cat: 'hair' },
  { photo: 'brows-architecture', title: 'Архитектура бровей', meta: 'Брови', cat: 'brows' },
  { photo: 'nails-leopard', title: 'Леопардовый дизайн', meta: 'Ногти', cat: 'nails' },
  { photo: 'hair-pixie', title: 'Пикси', meta: 'Волосы', cat: 'hair' },
  { photo: 'makeup-neon', title: 'Яркий макияж', meta: 'Макияж', cat: 'face' },
  { photo: 'hair-curtain-bangs', title: 'Чёлка-шторка', meta: 'Волосы', cat: 'hair' },
  { photo: 'nails-french-flowers', title: 'Френч с цветами', meta: 'Ногти', cat: 'nails' },
  { photo: 'lashes', title: 'Ламинирование ресниц', meta: 'Ресницы', cat: 'brows' },
  { photo: 'hair-straight', title: 'Гладкость и блеск', meta: 'Уход', cat: 'hair' },
  { photo: 'nails-graphic', title: 'Графика на ногтях', meta: 'Ногти', cat: 'nails' },
  { photo: 'makeup-evening', title: 'Вечерний образ', meta: 'Макияж', cat: 'face' },
  { photo: 'hair-crop', title: 'Короткая стрижка', meta: 'Волосы', cat: 'hair' },
  { photo: 'brows-tint', title: 'Окрашивание бровей', meta: 'Брови', cat: 'brows' },
  { photo: 'nails-velvet', title: 'Бархатный песок', meta: 'Ногти', cat: 'nails' },
  { photo: 'hair-blonde-cut', title: 'Стрижка на блонд', meta: 'Волосы', cat: 'hair' },
  { photo: 'cosmo-procedure', title: 'Процедура для лица', meta: 'Косметология', cat: 'face' },
]

/** Photos cycled by the cursor trail in the "Сияй" block. */
export const TRAIL = ['nails-berry', 'hair-waves', 'nails-mono', 'brows-shape', 'hair-balayage', 'nails-fuchsia', 'hair-bangs', 'nails-pearl', 'brows-lashes', 'hair-blonde', 'nails-french', 'pedi-design']

export type Master = { id: string; name: string; dative: string; role: string; cats: string[]; quote: string }
// Names and specialities as guests describe them in reviews; quotes are trimmed from those reviews.
export const TEAM: Master[] = [
  { id: 'ivan', name: 'Иван', dative: 'Ивану', role: 'Парикмахер-стилист', cats: ['hair'], quote: 'Мои волосы начинают жить новой жизнью после рук Ивана.' },
  { id: 'irina', name: 'Ирина', dative: 'Ирине', role: 'Стилист-колорист', cats: ['hair'], quote: 'Исправила мою неудачную стрижку и подобрала обалденный цвет.' },
  { id: 'alexandra', name: 'Александра', dative: 'Александре', role: 'Стилист', cats: ['hair'], quote: 'Делала мелирование — потрясающая умничка!' },
  { id: 'tatiana', name: 'Татьяна', dative: 'Татьяне', role: 'Топ-мастер ногтевого сервиса', cats: ['nails'], quote: 'Никакого дискомфорта, стерильные инструменты и идеальный результат.' },
  { id: 'valeria', name: 'Валерия', dative: 'Валерии', role: 'Мастер маникюра и подолог', cats: ['nails', 'podo'], quote: 'Всё объяснила, аккуратно выполнила — рай для интровертов.' },
  { id: 'alina', name: 'Алина', dative: 'Алине', role: 'Бровист, перманентный макияж', cats: ['brows', 'pmu'], quote: 'Сделала просто невероятно красивые брови.' },
  { id: 'natalia', name: 'Наталья', dative: 'Наталье', role: 'Косметолог, массажное спа', cats: ['cosmo', 'spa'], quote: 'Кожа дышит, наполнена сиянием и имеет здоровый вид.' },
  { id: 'daria', name: 'Дарья', dative: 'Дарье', role: 'Косметолог, лазерная эпиляция', cats: ['cosmo', 'epil'], quote: 'Процедура прошла комфортно и безболезненно.' },
]

export const REVIEWS: { name: string; text: string }[] = [
  { name: 'Мария', text: 'Девичий рай. Эстетика салона выше всяких похвал. Волшебница Алина сделала просто невероятно красивые брови. Вернусь однозначно.' },
  { name: 'Ольга', text: 'Классный салон! Очень милая администратор, красивый стильный интерьер! Всегда стригусь только у Ивана, он мастер своего дела!' },
  { name: 'Дилана', text: 'Администратор, мастера, атмосфера, чистота — всё на высшем уровне! Коррекция наращивания у Татьяны: идеальный результат!' },
  { name: 'Яна', text: 'Всегда очень внимательные и приветливые. Ходила также к подологу. Быстро и эффективно обработали, объяснили причину, посоветовали лечение.' },
  { name: 'Iuliia', text: 'Клиентоориентированность, сервис и качество. Когда для всех — руководителя, мастеров, администраторов — нет мелочей. Доверяю Тине на 200%.' },
  { name: 'Соня', text: 'Записывалась на стрижку и окрашивание. Сделали всё в лучшем виде, прямо как я и хотела. Огромное спасибо мастеру Ирине!' },
  { name: 'Наталия', text: 'Сама эстетика! Очень красиво, уютно, в уборной есть даже духи и зубная щётка. Потрясающее место!' },
  { name: 'Maksim', text: 'Посещаем всей семьёй, для каждого нашлось своё удовольствие! Уровень специалистов и оборудования на высоте!' },
  { name: 'Мария', text: 'Атмосфера спокойствия и роскоши. Угостили вкуснейшим кофе, Иван сделал шикарную укладку после стрижки.' },
  { name: 'Елена', text: 'Всегда тёплая приятная атмосфера! Обязательно предложат чай, кофе, печеньки. Очень нравится мастер маникюра Татьяна.' },
]

export const PERKS = [
  ['Кофе, чай и печенье', 'Пока ждёте — угостим.'],
  ['Парковка рядом', 'И удобный подъезд к салону.'],
  ['Выезд на дом', 'Мастер приедет к вам.'],
  ['Подарочные сертификаты', 'На любую сумму и услугу.'],
  ['Доступная среда', 'Пандус, вход и зал для колясок.'],
  ['Оплата картой и Wi-Fi', 'Всё как должно быть.'],
]
