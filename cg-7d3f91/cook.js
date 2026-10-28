// «Умные шаги»: находит в тексте шага продукты этого блюда и подставляет их количество
// на выбранное число порций, добавляет размеры нарезки и кнопки-таймеры.
// Работает поверх обычных шагов из recipes*.js, сами тексты не меняются.

// Как продукт может называться в тексте: начала слов (корни) на русском, «ё» пишем как «е».
// Чем длиннее совпадение, тем выше приоритет (так «зелёный лук» не путается с «луком»).
const ALIAS = {
  beef: ['говядин', 'говяж'], pork: ['свинин'], lamb: ['баранин'], fillet: ['филе'], thighs: ['бедр'],
  mince: ['фарш'], beefmince: ['фарш'], liver: ['печень\\b', 'печени\\b', 'печенью'], knuckle: ['рульк'], ribs: ['ребрышк'],
  salo: ['сал(?:о|а|ом|е)\\b'], bacon: ['бекон'], pepperoni: ['пепперони'], ham: ['ветчин'], sausage: ['колбас'], sausages: ['сосиск'],
  salmon: ['лосос'], whitefish: ['треск'], shrimp: ['кревет'], herring: ['сельд'], tuna: ['тун(?:ец|ца|цом)'], crab: ['крабов'],
  potato: ['картоф', 'картошк'], onion: ['лук(?!-порей| зелен)'], carrot: ['морков'], beet: ['свекл'],
  cabbage: ['капуст(?![а-я]* (?:квашен|цветн))', 'кочан'], tomato: ['помидор'], cherry: ['черри'], cucumber: ['огур(?:ец|цы|цов|цом|ца)'],
  pepper: ['болгарск[а-я]* перец', 'болгарск[а-я]* перц', 'сладк[а-я]* перец', 'перец(?! чили)', 'перц(?:ы|ев)\\b'], zucchini: ['кабач'], eggplant: ['баклажан'], mushrooms: ['гриб', 'шампиньон'],
  broccoli: ['брокколи'], greenbeans: ['стручков[а-я]* фасол'], spinach: ['шпинат'], sorrel: ['щавел'], lettuce: ['салат(?:а|ом|е|ы)?\\b'],
  celery: ['сельдере'], leek: ['поре[йя]'], garlic: ['чеснок', 'чеснока', 'чесноком'], ginger: ['имбир'], chili: ['чили(?! соус)'],
  dill: ['укроп'], parsley: ['петрушк'], cilantro: ['кинз'], greenonion: ['зелен[а-я]* лук', 'лук[а-я]* зелен'], basil: ['базилик'],
  lemon: ['лимон'], lime: ['лайм'], orange: ['апельсин'], apples: ['яблок', 'яблоч'], avocado: ['авокадо'], cherryfr: ['вишн'],
  prunes: ['черносл'], rice: ['рис\\b', 'рис[ау]\\b'], roundrice: ['рис\\b', 'рис[ау]\\b'], arborio: ['рис\\b', 'рис[ау]\\b'],
  jasmine: ['рис\\b', 'рис[ау]\\b'], sushirice: ['рис\\b', 'рис[ау]\\b'], buckwheat: ['гречк', 'гречн[а-я]* круп'], millet: ['пшен'],
  barley: ['круп', 'ячнев'], cornmeal: ['кукурузн[а-я]* круп', 'круп'], spaghetti: ['спагетти', 'паст(?:а|у|ы|ой)\\b'],
  penne: ['пенне', 'макарон', 'паст(?:а|у|ы|ой)\\b'], lasagna: ['лист[а-я]* (?:для )?лазан', 'листы'], eggnoodles: ['лапш'], udon: ['удон', 'лапш'],
  ricenoodles: ['лапш'], ricepaper: ['рисов[а-я]* бумаг', 'бумаг'], flour: ['мук(?:а|у|и|ой)\\b'], yeast: ['дрожж'], breadcrumbs: ['сухар'],
  bread: ['хлеб', 'батон'], ryebread: ['бородин', 'хлеб'], baguette: ['багет'], toast: ['тост', 'хлеб'], puff: ['тест'], savoiardi: ['савоярди'],
  tpaste: ['томатн[а-я]* паст'], ctomato: ['томат(?:ы|ов|ами)\\b'], beans: ['фасол'], peas: ['горош'], pickles: ['огур(?:ец|цы|цов|цом|ца)'],
  sauerkraut: ['квашен[а-я]* капуст', 'капуст'], olives: ['оливк', 'маслин'], pesto: ['песто'], soy: ['соев'], ricevin: ['уксус'],
  fishsauce: ['рыбн[а-я]* соус'], sweetchili: ['сладк[а-я]* чили', 'чили соус', 'соус[а-я]* чили'], coconut: ['кокосов[а-я]* молок', 'кокос'],
  tomyum: ['паст[а-я]* том ям', 'том ям'], miso: ['мисо'], tofu: ['тофу'], nori: ['нори'], sesame: ['кунжут(?![а-я]* масл)'],
  peanuts: ['арахис'], curry: ['карри'], zira: ['зир'], honey: ['мед(?:а|ом|у)?\\b'], starch: ['крахмал'], cocoa: ['какао'],
  chocolate: ['шоколад'], coffee: ['кофе'], mustard: ['горчиц'], mayo: ['майонез'], wine: ['вин(?:о|а|ом)\\b'], winew: ['вин(?:о|а|ом)\\b'],
  eggs: ['яйц', 'яиц'], milk: ['молок(?!о кокос)'], kefir: ['кефир'], cream: ['сливк', 'сливок', 'сливками'], sourcream: ['сметан'],
  tvorog: ['творог'], butter: ['сливочн[а-я]* масл', 'масл'], cheese: ['сыр(?:а|ом|у)?\\b'], parmesan: ['пармезан'],
  mozzarella: ['моцарел'], mascarpone: ['маскарпоне'], feta: ['фет', 'брынз'], oil: ['подсолнечн[а-я]* масл', 'растительн[а-я]* масл', 'масл'],
  olive: ['оливков[а-я]* масл', 'масл'], salt: ['посол', 'соль\\b', 'солью'], bpepper: ['черн[а-я]* перц', 'молот[а-я]* перц', 'поперч', 'перец\\b', 'перц(?:ем|а)?\\b'],
  sugar: ['сахар'], bayleaf: ['лавров'], capers: ['каперс'], gelatin: ['желатин'], perlovka: ['перлов'], splitpeas: ['горох'],
  corn: ['кукуруз(?![а-я]* круп)'], soda: ['сод(?:а|у|ой)\\b'], pumpkin: ['тыкв'], oats: ['хлоп', 'овсян'], buckflour: ['гречнев[а-я]* мук'],
  cauliflower: ['цветн[а-я]* капуст', 'соцвет', 'капуст'], mussels: ['миди'], steak: ['стейк'], duck: ['утин', 'утк', 'ножк'], cashew: ['кешью'],
  soba: ['соба', 'лапш'], kimchi: ['кимчи'], gochujang: ['кочхуджан'], sesameoil: ['кунжутн[а-я]* масл'], banana: ['банан'], ricotta: ['рикотт'],
  jam: ['варень'], almonds: ['миндал'], icecream: ['морожен'], radish: ['редис'], semolina: ['манк', 'манн[а-я]* круп'], cranberry: ['клюкв'],
  berries: ['ягод'], poppy: ['мак(?:а|ом)?\\b'], chicken: ['куриц', 'тушк'], currypaste: ['паст[а-я]* карри', 'карри'],
  creamcheese: ['сливочн[а-я]* сыр'], tteok: ['клецк'], glassnoodle: ['фунчоз'], oyster: ['устричн'],
  // 2026-10-28: Vietnam, Japan, China, Thailand, Korea, the Americas
  lemongrass: ['лемонграсс'], mint: ['мят'], sprouts: ['ростк', 'проростк'], staranise: ['бадьян'], cinnamon: ['кориц'],
  hoisin: ['хойсин'], sriracha: ['шрирач'], mirin: ['мирин'], ricefloor: ['рисов[а-я]* мук', 'мук(?:а|у|и|ой)\\b'], turmeric: ['куркум'],
  pineapple: ['ананас'], tortilla: ['тортиль', 'лепешк'], buns: ['булочк', 'булк'], cheddar: ['чеддер', 'сыр(?:а|ом|у)?\\b'],
  bbq: ['барбекю'], ketchup: ['кетчуп'], wings: ['крыл'], porkribs: ['ребрышк'], maple: ['кленов[а-я]* сироп', 'сироп'],
  bakingpowder: ['разрыхлит'], jalapeno: ['халапеньо'], paprika: ['паприк'], oregano: ['орегано'], cookies: ['печень[еяю]'],
  condensed: ['сгущ'], mango: ['манго'], sichuan: ['сычуаньск'], porkbelly: ['грудинк'],
};
// Общие слова: «мясо», «курица», «рыба» — относим к первому подходящему продукту в блюде
const GENERIC = [
  ['мяс', ['beef', 'pork', 'lamb', 'mince', 'beefmince', 'steak', 'duck', 'knuckle', 'ribs', 'porkribs', 'porkbelly', 'chicken', 'fillet', 'thighs', 'wings']],
  ['кур(?:ин|иц|ицу)', ['fillet', 'thighs', 'chicken', 'wings']],
  ['рыб(?![а-я]* соус)', ['whitefish', 'salmon', 'herring', 'tuna']],
];

const norm = (s) => s.toLowerCase().replace(/ё/g, 'е');

// Размеры нарезки, чтобы было понятно, «кубики» — это сколько
const CUTS = [
  [/(мелк(?:им|ими) куби(?:ком|ками))/gi, '$1 по 5 мм'],
  [/(крупн(?:ым|ыми) куби(?:ком|ками))/gi, '$1 по 2–3 см'],
  [/((?<!мелк(?:им|ими) |крупн(?:ым|ыми) )куби(?:ком|ками))(?! по)/gi, '$1 по 1–1,5 см'],
  [/(тонк(?:ой|ими) соломк(?:ой))/gi, '$1 по 2–3 мм'],
  [/((?<!тонк(?:ой|ими) )соломк(?:ой))(?! по)/gi, '$1 по 3–4 мм'],
  [/(тонкими кружками)/gi, '$1 по 2–3 мм'],
  [/((?<!тонкими )кружками)(?! по)/gi, '$1 по 5 мм'],
  [/((?<!тонкими )полукольцами)/gi, '$1 толщиной 3–4 мм'],
  [/(брус(?:очками|ками))/gi, '$1 примерно 1 × 1 см'],
  [/(полосками)(?! по)/gi, '$1 шириной около 1 см'],
];

// Количество продукта для показа: граммы, миллилитры, штуки
function amountOf(pid, k, part) {
  const d = window.__dish; const pr = P[pid]; let v = d.i[pid] * k / 4 * (part || 1);
  if (pr.u === 'шт') { const n = Math.round(v * 2) / 2; return (n || 0.5).toString().replace('.', ',') + ' шт'; }
  if (v < 10) v = Math.round(v); else if (v < 100) v = Math.round(v / 5) * 5; else v = Math.round(v / 10) * 10;
  return amt(v, pr.u);
}

// Возвращает html шага с количествами и список продуктов, которые в нём упомянуты
// ctx keeps what earlier steps already measured: amounts show at the first mention only
function smartStep(d, k, text, ctx = { seen: new Set(), half: new Set() }) {
  window.__dish = d;
  const pids = Object.keys(d.i);
  const low = norm(text);
  const rules = [];
  // JS \b does not see Cyrillic letters, so word ends are written as (?![а-я])
  const fix = (a) => a.replace(/\\b/g, '(?![а-я])');
  for (const pid of pids) for (const a of (ALIAS[pid] || [])) rules.push({ pid, re: fix(a), w: a.replace(/\\[a-z]|[()?:!|\[\]*+]/g, '').length });
  for (const [re, list] of GENERIC) { const pid = list.find((p) => pids.includes(p)); if (pid) rules.push({ pid, re, w: 1 }); }
  rules.sort((a, b) => b.w - a.w);
  const taken = []; const marks = []; const used = new Set();
  // Two-word names («сливочное масло», «болгарский перец») belong to their own product only:
  // the short stem «масл» of sunflower oil must not take them
  const reserved = [];
  for (const r of rules) if (r.re.includes(' ')) {
    const rx = new RegExp('(^|[^а-я])(' + r.re + ')[а-я]*', 'g'); let m;
    while ((m = rx.exec(low))) reserved.push([m.index + m[1].length, m.index + m[0].length, r.pid]);
  }
  // Products with the most specific names go first; each takes its earliest free mention
  const order = [...new Set(rules.map((r) => r.pid))];
  for (const pid of order) {
    let best = null;
    for (const r of rules.filter((x) => x.pid === pid)) {
      const rx = new RegExp('(^|[^а-я])(' + r.re + ')[а-я]*', 'g');
      let m;
      while ((m = rx.exec(low))) {
        const s = m.index + m[1].length, e = m.index + m[0].length;
        if (taken.some(([a, b]) => s < b && e > a)) continue;
        if (!r.re.includes(' ') && reserved.some(([a, b, p]) => p !== pid && s < b && e > a)) continue;
        if (!best || s < best.s) best = { s, e };
        break;
      }
    }
    if (best) {
      const { s, e } = best; const r = { pid };
      taken.push([s, e]); used.add(r.pid);
      const before = low.slice(Math.max(0, s - 22), s);
      let label;
      if (/половин[а-я]*\s+([а-я]+\s+)?$/.test(before)) { label = '½ — ' + amountOf(r.pid, k, 0.5); ctx.half.add(r.pid); }
      else if (/(оставш|остальн|остаток|остатк)[а-я]*\s+([а-я]+\s+)?$/.test(before)) label = 'остаток';
      else if (/(част[ьи]|немного|ложк[а-я]*|щепот[а-я]*|кусоч[а-я]*)\s+([а-я]+\s+)?$/.test(before)) label = null;
      else if (ctx.half.has(r.pid)) { label = 'остаток — ' + amountOf(r.pid, k, 0.5); ctx.half.delete(r.pid); }
      else if (ctx.seen.has(r.pid)) label = null;
      else label = amountOf(r.pid, k);
      ctx.seen.add(r.pid);
      if (label) marks.push([e, label]);
    }
  }
  let html = text;
  for (const [pos, label] of marks.sort((a, b) => b[0] - a[0])) html = html.slice(0, pos) + `<b class="amt">${label}</b>` + html.slice(pos);
  for (const [re, rep] of CUTS) html = html.replace(re, rep);
  // таймеры: «15 минут», «2–3 минуты», «1,5 часа», «40 мин»
  html = html.replace(/(\d+(?:,\d+)?)(?:[–-](\d+(?:,\d+)?))?\s*(минут[а-я]*|мин(?![а-я])|час(?:а|ов)?(?![а-я]))/g, (all, a, b, unit) => {
    const n = parseFloat((b || a).replace(',', '.'));
    const sec = Math.round(n * (unit.startsWith('час') ? 3600 : 60));
    return `<button class="timer-chip" data-timer="${sec}" data-tlabel="${all}">⏱ ${all}</button>`;
  });
  return { html, used: [...used] };
}

// Продукт, который в шагах ни разу не назван («обжарьте» без слова «масло»), прикрепляем к шагу,
// где он нужен по смыслу: масло — где жарят, зелень — где посыпают, мука — где обваливают.
const HINT = {
  oil: 'обжар|жар|фритюр|сковород|смаж', olive: 'обжар|жар|полей|смаж|сковород|прогрей', butter: 'растоп|смаж|обжар|жар|сковород|пюре|каш|подава',
  sesameoil: 'полей|соус|заправ|обжар|смеш', flour: 'обвал|панир|тест|загуст|соус|посып', buckflour: 'тест|смеш', eggs: 'кляр|желтк|белк|взбей|смеш|обмак|яичн|вбей',
  greenonion: 'посып|подава|украс|добав', cilantro: 'посып|подава|украс|добав', dill: 'посып|подава|добав', parsley: 'посып|подава|добав', basil: 'посып|добав|украс',
  thighs: 'бульон|вар|обжар|кур', fillet: 'обжар|кур', salmon: 'рыб|вар', soy: 'соус', sweetchili: 'соус', fishsauce: 'соус', oyster: 'соус',
  jasmine: 'подава|рис', rice: 'подава|рис', roundrice: 'рис|смеш', sushirice: 'рис|подава', sauerkraut: 'капуст', salo: 'шкварк|сал|вытоп',
};
function smartSteps(d, k, steps) {
  const ctx = { seen: new Set(), half: new Set() };
  const out = steps.map((t) => smartStep(d, k, t, ctx));
  const seen = new Set(out.flatMap((s) => s.used));
  for (const pid of Object.keys(d.i)) {
    if (seen.has(pid) || pid === 'salt' || pid === 'bpepper') continue;
    const re = new RegExp(HINT[pid] || 'добав|положит|смеш|влейт', 'i');
    let i = steps.findIndex((t) => re.test(norm(t)));
    if (i < 0) i = 0;
    out[i].html += ` <span class="need">+ ${P[pid].n.toLowerCase().replace(/ \(.*\)$/, '').replace(/ с[0-2]$/, '')} <b>${amountOf(pid, k)}</b></span>`;
    out[i].used.push(pid);
  }
  return out;
}

// Таймер: одна полоска внизу экрана, звук и вибрация в конце
let TIMER = null;
function startTimer(sec, label) {
  stopTimer();
  const end = Date.now() + sec * 1000;
  const bar = document.createElement('div');
  bar.className = 'timer-bar'; bar.setAttribute('role', 'timer');
  bar.innerHTML = `<span class="t-label">${label}</span><b class="t-left"></b><button class="t-stop" aria-label="Остановить таймер">✕</button>`;
  document.body.append(bar);
  const tick = () => {
    const left = Math.max(0, Math.round((end - Date.now()) / 1000));
    bar.querySelector('.t-left').textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    if (left === 0) { clearInterval(TIMER.int); bar.classList.add('done'); bar.querySelector('.t-label').textContent = 'Готово: ' + label; ring(); }
  };
  TIMER = { bar, int: setInterval(tick, 500) }; tick();
  bar.querySelector('.t-stop').onclick = stopTimer;
}
function stopTimer() { if (TIMER) { clearInterval(TIMER.int); TIMER.bar.remove(); TIMER = null; } }
function ring() {
  try { navigator.vibrate && navigator.vibrate([300, 150, 300, 150, 300]); } catch {}
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.35, 0.7].forEach((t) => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = 880; g.gain.setValueAtTime(0.25, ac.currentTime + t); g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + 0.3); o.connect(g).connect(ac.destination); o.start(ac.currentTime + t); o.stop(ac.currentTime + t + 0.3); });
  } catch {}
}

// Режим «Готовлю»: шаг за шагом крупно, экран не гаснет
let WAKE = null;
async function keepAwake(on) {
  try { if (on && 'wakeLock' in navigator) WAKE = await navigator.wakeLock.request('screen'); else if (!on && WAKE) { await WAKE.release(); WAKE = null; } } catch {}
}
