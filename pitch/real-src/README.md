# РЕАЛ: spec site for a barbershop (React)

Pitch prototype for REAL, a barbershop in Novokurkino, Khimki (ul. Marii Rubtsovoy, 5).
Services, prices, photos, barber names and reviews come from the shop's Yandex Maps card (organisation 39002232539).
Functionality follows the «Груша» prototype (filters, search, gallery, booking, reviews, FAQ, map); design and ideas are new.

## Highlights

- Street poster look: paper white, ink black and the shop's signal red; Dela Gothic One display type, price stickers, pill buttons
- Hero: a giant red "REAL" with a 3D straight razor across it that flips open on load and "breathes" every few seconds; price stickers pop on; a black ticker with prices
- "Real = настоящий": numbers from reviews (from 700 ₽, 3-4 years with one barber, guests who drove 80 km) and perks (massage after the haircut, phyto barrel, the kids' car chair, cats allowed)
- Price list as a receipt builder: tap services and they print into a paper receipt with a torn edge, a running total and a barcode; "Book with this receipt" opens the booking with the same items
- Gallery strip, barbers from reviews, booking mock-up, reviews with topics and a live widget, FAQ, contacts with map

## Run

```bash
npm install
npm run dev
npm run build   # builds into ../real, the published folder
```
