// Пищевая ценность продуктов из PR: [ккал, белки, жиры, углеводы].
// Для продуктов в г и мл — на 100 г (100 мл), для продуктов в шт — на 1 штуку.
// Крупы, макароны и мука — в сухом виде, как они указаны в рецептах. Мясо на кости (курица целая,
// рулька, утиные ножки, мидии в раковинах) — на 100 г покупного веса, с учётом отходов.
window.NUTR = {
 beef:[180,19,12,0], pork:[267,16,22,0], lamb:[209,16,16,0], fillet:[113,23.6,1.9,0.4],
 thighs:[185,17,13,0], mince:[263,17,21,0], beefmince:[220,18,16,0], liver:[137,20,6,1],
 knuckle:[210,18,15,0], ribs:[300,15,27,0], salo:[770,2,82,0], bacon:[470,14,45,1],
 pepperoni:[470,20,42,2], ham:[240,17,19,1], sausage:[257,13,22,1.5], sausages:[250,11,22,1.6],
 salmon:[208,20,13,0], whitefish:[78,18,0.7,0], shrimp:[95,20,1.5,0], herring:[220,17,17,0],
 tuna:[120,24,2.5,0], crab:[85,6,1,10],
 potato:[77,2,0.4,16.3], onion:[41,1.4,0.2,8.2], carrot:[35,1.3,0.1,6.9], beet:[42,1.5,0.1,8.8],
 cabbage:[28,1.8,0.1,4.7], tomato:[20,1,0.2,3.7], cherry:[18,0.9,0.2,3.9], cucumber:[15,0.8,0.1,2.8],
 pepper:[27,1.3,0.1,5.3], zucchini:[24,0.6,0.3,4.6], eggplant:[24,1.2,0.1,4.5], mushrooms:[27,4.3,1,0.1],
 broccoli:[28,3,0.4,5.2], greenbeans:[24,2,0.2,3.6], spinach:[23,2.9,0.3,2], sorrel:[22,1.5,0.3,2.9],
 lettuce:[50,4,0.7,8], celery:[13,0.9,0.1,2.1], leek:[60,3,0.3,12], garlic:[149,6.5,0.5,30],
 ginger:[80,1.8,0.8,16], chili:[40,2,0.4,8], dill:[38,2.5,0.5,6.3], parsley:[49,3.7,0.4,7.6],
 cilantro:[23,2.1,0.5,3.7], greenonion:[20,1.3,0.1,3.2], basil:[23,3.2,0.6,2.7],
 lemon:[20,0.6,0.1,3], lime:[15,0.3,0,3], orange:[43,0.9,0.2,8.1], apples:[47,0.4,0.4,9.8],
 avocado:[240,3,22,3], cherryfr:[52,0.8,0.5,11], prunes:[240,2.3,0.7,57.5],
 rice:[333,7,1,74], roundrice:[333,7,1,74], arborio:[350,7,0.6,78], jasmine:[350,7,0.5,78],
 sushirice:[345,7,0.6,76], buckwheat:[313,12.6,3.3,62], millet:[342,11.5,3.3,66.5], barley:[324,10,1.3,65],
 cornmeal:[337,8.3,1.2,71], spaghetti:[344,11,1.5,71], penne:[344,11,1.5,71], lasagna:[350,12,1.5,71],
 eggnoodles:[370,13,4,70], udon:[340,10,1,72], ricenoodles:[360,6,0.6,80], ricepaper:[330,6,0.5,80],
 flour:[334,10,1.1,70], yeast:[325,40,7,40], breadcrumbs:[395,13,5,72], bread:[262,7.5,2.9,51],
 ryebread:[208,6.8,1.3,40.7], baguette:[650,22,4,128], toast:[265,8,3.5,49], puff:[380,6,24,36],
 savoiardi:[390,8,5,80],
 tpaste:[99,5.6,1.5,16.7], ctomato:[22,1.1,0.2,4], beans:[99,6.7,0.3,17.4], peas:[55,3.6,0.1,9.8],
 pickles:[16,0.8,0.1,2.8], sauerkraut:[23,1.8,0.1,3], olives:[145,1,14,3], pesto:[450,5,45,5],
 soy:[53,6,0,7], ricevin:[20,0,0,5], fishsauce:[35,5,0,4], sweetchili:[210,0.5,0.5,51],
 coconut:[200,2,20,3], tomyum:[350,4,28,20], miso:[199,12,6,26], tofu:[76,8,4.8,1.9], nori:[5,1,0.1,0.5],
 sesame:[573,18,49,12], peanuts:[552,26,45,10], curry:[325,14,14,25], zira:[375,18,22,44],
 honey:[304,0.8,0,82], starch:[313,0.1,0,78], cocoa:[289,24,15,10], chocolate:[550,7,38,45],
 coffee:[2,0.1,0,0.3], mustard:[140,9,10,5], mayo:[600,1,65,3], wine:[60,0,0,1], winew:[60,0,0,1],
 eggs:[86,7,6,0.4], milk:[60,2.9,3.2,4.7], kefir:[53,2.9,2.5,4], cream:[205,2.8,20,3.7],
 sourcream:[206,2.8,20,3.2], tvorog:[159,16.7,9,2], butter:[748,0.5,82.5,0.8], cheese:[360,24,29,0],
 parmesan:[392,36,26,0], mozzarella:[240,18,17,1], mascarpone:[410,4,42,4], feta:[265,14,22,1],
 oil:[899,0,99.9,0], olive:[898,0,99.8,0], salt:[0,0,0,0], bpepper:[251,10,3,64], sugar:[398,0,0,99.7],
 bayleaf:[313,7.6,8.4,48],
 capers:[23,2,0.9,5], gelatin:[355,87,0.4,0.7], perlovka:[315,9.3,1.1,66.9], splitpeas:[298,20.5,2,53],
 corn:[80,2.5,1,15], soda:[0,0,0,0], pumpkin:[22,1,0.1,4.4], oats:[352,12.3,6.2,61.8],
 buckflour:[353,13.6,1.3,70.6], cauliflower:[30,2.5,0.3,4.2], mussels:[30,4.5,1,1], steak:[210,19,15,0],
 duck:[240,15,20,0], cashew:[600,18,48,22], soba:[340,14,1,68], kimchi:[25,1.7,0.5,3.5],
 gochujang:[220,4,2,45], sesameoil:[899,0,99.9,0], banana:[96,1.5,0.2,21],
 ricotta:[174,11,13,3], jam:[260,0.4,0,66], almonds:[609,18.6,53.7,13], icecream:[227,3.2,15,20.8],
 radish:[19,1.2,0.1,3.4], semolina:[333,10.3,1,73.3], cranberry:[30,0.5,0.2,6], berries:[45,0.8,0.4,9],
 poppy:[556,17.5,47.5,14.5], chicken:[150,13,10,0], currypaste:[120,2,6,13], creamcheese:[280,6,27,3],
 tteok:[230,4,0.5,50], glassnoodle:[330,0.5,0,82], oyster:[51,1.4,0.3,11],
 // 2026-10-28 (dishes-world.js); tortilla, buns and mango are per piece
 lemongrass:[99,1.8,0.5,25], mint:[70,3.8,0.9,15], sprouts:[30,3,0.2,6], staranise:[337,18,16,50], cinnamon:[247,4,1.2,81],
 hoisin:[220,3.3,3.4,44], sriracha:[93,2,1,19], mirin:[240,0.3,0,43], ricefloor:[366,6,1.4,80], turmeric:[312,10,3.3,67],
 pineapple:[60,0.5,0.1,15], tortilla:[180,5,4.5,30], buns:[220,7,3.5,40], cheddar:[400,25,33,1.3], bbq:[170,1,0.6,40],
 ketchup:[110,1.8,0.1,25], wings:[190,18,13,0], porkribs:[280,15,24,0], maple:[260,0,0.1,67], bakingpowder:[53,0,0,28],
 jalapeno:[28,1,0.4,5], paprika:[282,14,13,54], oregano:[265,9,4.3,69], cookies:[460,7,18,68], condensed:[320,7.2,8.5,56],
 mango:[120,1.6,0.8,30], sichuan:[300,11,9,58], porkbelly:[500,9,52,0]
};

// Масло для фритюра почти всё остаётся в кастрюле: сверх 120 мл на рецепт считаем впитавшимися ~15%.
const FRY_OIL = new Set(['oil','olive','sesameoil']);
const NCACHE = {};
// Калории и БЖУ на одну порцию (рецепты в DL на 4 порции)
window.nutr = function (d) {
  if (NCACHE[d.id]) return NCACHE[d.id];
  const t = [0, 0, 0, 0];
  for (const [pid, v0] of Object.entries(d.i)) {
    const n = NUTR[pid]; if (!n) continue;
    const v = FRY_OIL.has(pid) && v0 > 120 ? 120 + (v0 - 120) * 0.15 : v0;
    const k = P[pid].u === 'шт' ? v : v / 100;
    for (let j = 0; j < 4; j++) t[j] += n[j] * k;
  }
  return NCACHE[d.id] = { kcal: Math.round(t[0] / 4 / 10) * 10, p: Math.round(t[1] / 4), f: Math.round(t[2] / 4), c: Math.round(t[3] / 4) };
};

// Правильное питание: сытная, но лёгкая порция без колбас, майонеза, фритюра и лишнего сахара.
// Порции в рецептах полные, с гарниром, поэтому планка — 600 ккал на тарелку.
const PP_NO = new Set(['bacon','salo','pepperoni','sausage','sausages','ham','ribs','knuckle','mayo','puff','icecream','jam','savoiardi','sweetchili','creamcheese','mascarpone','baguette','porkbelly','porkribs','bbq','ketchup','condensed','cookies','maple','buns']);
const PP_VEG = new Set(['potato','onion','carrot','beet','cabbage','tomato','cherry','cucumber','pepper','zucchini','eggplant','mushrooms','broccoli','greenbeans','spinach','sorrel','celery','garlic','dill','parsley','cilantro','greenonion','basil','pumpkin','cauliflower','radish','ctomato','beans','peas','sauerkraut','kimchi','sprouts','mint','lemongrass','pineapple','lettuce']);
const PP_GOODFAT = new Set(['salmon','herring','tuna','whitefish','shrimp','mussels','olive','avocado']);
const PP_GRAIN = new Set(['buckwheat','oats','millet','perlovka','barley','buckflour','soba']);
const PP_WHITE = new Set(['spaghetti','penne','lasagna','eggnoodles','udon','bread','baguette','toast','breadcrumbs','tteok','flour','ricefloor']);
window.isPP = function (d) {
  if (d.type === 'Десерт' || d.type === 'Выпечка') return false;
  const ids = Object.keys(d.i);
  if (ids.some(p => PP_NO.has(p))) return false;
  if ((d.i.sugar || 0) + (d.i.honey || 0) > 40) return false;                 // больше 10 г сахара на порцию
  if ((d.i.oil || 0) > 80 || (d.i.butter || 0) > 80 || (d.i.cream || 0) > 200) return false;
  const n = nutr(d);
  if (n.kcal > 600 || n.kcal < 100) return false;
  // жиров не больше 45% калорий; рыба и оливковое масло дают полезный жир, им можно больше
  if (n.f * 9 > n.kcal * (ids.some(p => PP_GOODFAT.has(p)) ? 0.62 : 0.45)) return false;
  let w = 0, veg = 0, grain = 0, white = 0;
  for (const [p, v] of Object.entries(d.i)) if (P[p].u !== 'шт') {
    w += v; if (PP_VEG.has(p)) veg += v; if (PP_GRAIN.has(p)) grain += v; if (PP_WHITE.has(p)) white += v;
  }
  const prot = n.p * 4 / n.kcal;
  if (white > w * 0.12 && prot < 0.25) return false;                            // белая паста и хлеб — только при сильном белке
  // хватает белка, или блюдо в основном из овощей, или из цельной крупы
  return prot >= 0.16 || veg >= w * 0.6 || grain >= w * 0.12;
};
