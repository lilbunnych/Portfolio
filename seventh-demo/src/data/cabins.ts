export interface Cabin {
  id: string;
  name: string;
  blurb: string;
  sleeps: number;
  price: number; // NOK per night
  size: string;
  image: string;
  features: string[];
}

const img = (id: number, w = 1200, h = 900) => `https://picsum.photos/id/${id}/${w}/${h}`;

export const cabins: Cabin[] = [
  { id: 'fjord', name: 'Fjord House', blurb: 'Glass wall facing the water, wood stove and a deck over the rocks.', sleeps: 4, price: 3200, size: '62 m²', image: img(37, 1400, 1000), features: ['Wood stove', 'Private deck', 'Fjord view'] },
  { id: 'shore', name: 'Shore Cabin', blurb: 'Two steps from the pebble beach. Built for early swims.', sleeps: 2, price: 2400, size: '34 m²', image: img(13), features: ['Beach access', 'Outdoor shower'] },
  { id: 'loft', name: 'Forest Loft', blurb: 'A tall timber loft in the pines, sleeping six under the roof beams.', sleeps: 6, price: 4800, size: '88 m²', image: img(17), features: ['Sleeps six', 'Kitchen', 'Sauna nearby'] },
];

export const experiences = [
  { title: 'Waterfall walk', text: 'A two hour loop to Storfossen, best after rain.', image: img(15, 900, 1100) },
  { title: 'Ridge hike', text: 'Full day above the treeline with a packed lunch.', image: img(177, 900, 1100) },
  { title: 'Sea kayaking', text: 'Guided paddles between the islands at slack tide.', image: img(16, 900, 1100) },
  { title: 'Mountain lake', text: 'Cold plunge, warm sauna, repeat until dinner.', image: img(128, 900, 1100) },
];

export const extras = [
  { id: 'breakfast', label: 'Breakfast basket', price: 290, per: 'guest / night' },
  { id: 'sauna', label: 'Private sauna evening', price: 650, per: 'stay' },
  { id: 'kayak', label: 'Guided kayak trip', price: 890, per: 'guest' },
] as const;
