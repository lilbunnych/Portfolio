# Second Demo — Tessel

Landing page for a fictional product engineering studio, "Tessel". A rethink of First Demo with a new concept, brand, layout and interactions.

## Stack

- One self-contained `index.html`: plain HTML, CSS, and JavaScript (ES modules)
- [Lenis](https://github.com/darkroomengineering/lenis) smooth scroll via importmap
- Geist + Geist Mono (Google Fonts), Phosphor icons (web font)
- Photos from Picsum (grayscale)

## Features

- Automatic light and dark theme (`prefers-color-scheme`)
- Column-shutter intro loader
- Hero "mosaic" effect: a pixelated photo resolves into sharp tiles under the pointer
- Scroll-linked manifesto where words light up as you read
- Work index with a cursor-following image preview
- Process section with vertical scroll driving a horizontal pan (desktop)
- Bento services grid, testimonial marquee, asymmetric engagement cards, FAQ accordion
- Project drawer with chip selectors, inline validation and a stubbed submit
- Magnetic primary buttons, hide-on-scroll header, copy-email button
- Honors `prefers-reduced-motion`

## Run

```bash
python3 -m http.server 5174
```

Then open http://localhost:5174.
