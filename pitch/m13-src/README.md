# M13: spec site for a barbershop (React)

Pitch prototype for M13, a barbershop in Khimki (ul. 9 Maya, 10B).
Services, prices, photos, barber names and reviews come from the shop's Yandex Maps card (organisation 186999175325).
Functionality follows the «Груша» prototype (filters, search, gallery, booking, reviews, FAQ, map); the design is new.

## Highlights

- Dark loft look taken from the shop itself: warm graphite, brick red, bone-white type, film grain, sharp corners and hairlines
- Condensed Oswald display type, Onest for text, JetBrains Mono for small labels; numbered sections
- Hero: the shop's hall as a dim backdrop, a giant "M13" and a 3D barber pole (striped shader core inside a glass tube, chrome caps) that tilts toward the cursor; a brick ticker with prices underneath
- Family barbershop block: a quote from a review and six facts (kids room, father + son, first visit, coffee, dogs, loft)
- Price list as a numbered menu with filters, price ranges, search and add-to-booking
- Gallery strip, barbers from reviews, booking mock-up, reviews with topics and a live widget, FAQ, contacts with a monochrome map

## Run

```bash
npm install
npm run dev
npm run build   # builds into ../m13, the published folder
```
