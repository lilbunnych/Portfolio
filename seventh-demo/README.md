# Seventh Demo — Fjordhus

Booking site for a fictional group of cabins on the Norwegian coast.

## Stack

- [Astro](https://astro.build) 7 (static output) + Tailwind CSS v4
- Content in `src/data/cabins.ts`, one page in `src/pages/index.astro`
- CSS is inlined at build time, so `dist/index.html` works from any folder

## Features

- Hero with quick date search that pre-fills the booking form
- Cabin cards with "Choose" buttons wired to the booking form
- Live price calculator: nights, guests, extras, cleaning fee
- Validation: leave date after arrival, guest count vs cabin size, name and email
- Confirmation dialog (no payment, demo only)
- Scroll-snap experiences row, FAQ accordion, reduced-motion support

## Run

```bash
npm install
npm run dev      # development
npm run build    # static site in dist/
```
