# Груша: spec site (React)

Pitch prototype for «Груша», a beauty salon in Khimki (ul. Akademika Grushina, 8).
Services, prices, photos, team names and reviews come from the salon's Yandex Maps card (organisation 26071151936).

## Highlights

- Light futuristic look: mint base, frosted glass panels, Unbounded display type, JetBrains Mono for prices and numbers, one lime accent
- Hero: a smooth, slightly asymmetric 3D glass pear (three.js physical transmission with dispersion, vertex-tinted with a faint blush) levitates in the centre, twisting one way, then the other; a giant "ГРУША" wordmark and two orbits sit behind it and are refracted by the glass
- Hero background: a WebGL shader with a slow, uneven wavy gradient from pale mint to juicy green
- Standard glass navigation bar with an active-section pill, full-screen menu on phones, and a call / book bar at the bottom of the phone screen
- Scroll text animations: masked word-by-word headings, an owner's quote (placeholder) that lights up word by word, count-up rating
- Services: 154 services with filters (Popular, Hair, Nails, Brows and lashes, Face and body, Laser), price ranges and search; popular services carry a "хит" badge
- Gallery: 2D strip on native horizontal scroll with snap; cards lean with the scroll speed like a flipped deck, photos slide in parallax inside their frames, lightbox on tap
- Online booking mock-up: services, master, date and time, contacts with validation, .ics calendar file
- Reviews: rating, the topics guests mention most, curated cards and a live reviews widget
- "Before your visit" answers (entrance, parking, wheelchair access, curly hair, rescheduling, gift certificates), live open / closed status, map and route

## Stack

Vite, React 19, TypeScript, Tailwind CSS v4, three.js via @react-three/fiber and drei, Motion, Lenis, lucide-react, self-hosted Unbounded, Manrope and JetBrains Mono.

## Run

```bash
npm install
npm run dev
npm run build   # builds into ../grusha, the published folder
```
