# Fourth Demo — Vitrea

Original variation on Third Demo: a scroll story for a fictional glass studio, "Vitrea". Same stack family (single HTML + Three.js), new concept, palette, layout and interactions.

## Stack

- One self-contained `index.html`: plain HTML, CSS, and JavaScript (ES modules)
- Three.js r160 (+ RoomEnvironment) and Lenis via importmap
- Fonts: Satoshi (Fontshare), JetBrains Mono (Google Fonts)
- No external models or images: the glass form is generated in code

## Features

- Procedural glass form that morphs through four chapters: sand, heat, breath, stillness
- Physical glass material (transmission, clearcoat, iridescence) refracting a caustic-light backdrop
- Live furnace temperature readout tied to scroll
- Drag to turn the piece, chapter rail with scroll-to navigation
- Real scrolling sections (not fixed slides), studio facts and a validated visit form
- Honors `prefers-reduced-motion`; falls back to a static gradient without WebGL

## Run

```bash
python3 -m http.server 5176
```
