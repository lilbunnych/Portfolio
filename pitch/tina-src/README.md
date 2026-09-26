# Tina Studio — spec site (React)

Pitch prototype for the Tina Studio beauty and podology salon in Khimki (listed as «Рутина» on Yandex Maps).
Services, prices, photos, team names and reviews come from the salon's Yandex Maps card.

## Highlights

- 3D neon "TS" monogram on a brick wall (like the sign in the salon); click it or the swatches to change the colour
- Portfolio built on the Hover Expand Gallery from 21st.dev (kedhareswer), with category filters
- "Сияй" block with the Image Trail from 21st.dev (danielpetho): the studio's work follows the cursor
- Full price list (300+ services) with search; every line can be added to the booking
- Booking wizard mock-up: services, master, date and time, contacts, .ics calendar file
- Theme: the client's shadcn palette (cream, dusty rose, cocoa), zero radius, hard offset shadows

## Stack

Vite, React 19, TypeScript, Tailwind CSS v4, three.js via @react-three/fiber, Motion, Lenis.

## Run

```bash
npm install
npm run dev
npm run build   # builds into ../tina, the published folder
```
