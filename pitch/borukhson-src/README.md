# Салон красоты Марины Борухсон: spec site (React)

Pitch prototype for the beauty salon of Marina Borukhson in Khimki (ul. Kalinina, 9).
Services, prices, photos, team names and reviews come from the salon's Yandex Maps card (organisation 160133495568).
Built on the «Груша» prototype (`../grusha-src`) with a new palette, a new hero object and a new section.

## Highlights

- Light futuristic look in pearl and berry, taken from the salon's pink «МБ» monogram: blush base, frosted glass panels, Unbounded display type
- Hero: a 3D glass lacquer bottle (three.js physical transmission with dispersion and iridescence) levitates and twists; a giant "БОРУХСОН" wordmark and two orbits sit behind it and are refracted by the glass
- Shade picker under the bottle: six shades from the salon's own manicure photos; the lacquer inside flows into the new colour
- Owner's word (placeholder) plus six "small things" from reviews: work in 4 hands, coffee, the lash chair, the owner greeting guests, next-day slots, dogs welcome
- Services: about 230 services in 20 categories with filters (Popular, Nails, Lashes and brows, Hair, Hair removal, Face, Body), price ranges, search and "от" prices
- Laser hair removal builder: pick zones, see the per-session price, and get the cheapest of the salon's five complexes that covers them, with the saving
- Gallery: 2D strip with speed-based lean and parallax, lightbox on tap
- Masters from reviews, online booking mock-up (services, master, time, contacts, .ics file)
- Reviews: rating, the topics guests mention most, curated cards and a live reviews widget; FAQ, live open status, map and route

## Stack

Vite, React 19, TypeScript, Tailwind CSS v4, three.js via @react-three/fiber and drei, Motion, Lenis, lucide-react, self-hosted Unbounded, Manrope and JetBrains Mono.

## Run

```bash
npm install
npm run dev
npm run build   # builds into ../borukhson, the published folder
```
