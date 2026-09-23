# First Demo — Lumora

Single-page landing site for a fictional design & engineering studio, "Lumora".

## Stack

- One self-contained `index.html`: plain HTML, CSS, and JavaScript (ES modules)
- [Lenis](https://github.com/darkroomengineering/lenis) smooth scroll, loaded from a CDN via importmap
- Google Font: Onest

## Features

- Intro loader counting 000 → 100, then sliding up
- Hero with a "liquid" cursor reveal (canvas brush that paints a second image)
- Line-by-line and word-by-word text reveals on scroll
- Hand-written spring physics for hovers and entrances (no animation library)
- Rem-based adaptive grid that scales with the viewport
- Scroll-driven stats count-up
- Full-screen menu overlay and a project request modal (form submit is stubbed)

## Run

Serve the folder with any static server:

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173.
