# Third Demo — Laocoön

Cinematic scroll-driven WebGL page, "Bronze and Time", rebuilt from a detailed spec (prompt 2 of the Teletype prompt pack).

## Stack

- One self-contained `index.html`: plain HTML, CSS, and JavaScript (ES modules)
- Three.js r160 (+ GLTFLoader) via importmap from unpkg
- Fonts: Italiana, Outfit (Google Fonts)
- Bronze horse GLB and editorial image loaded from the original asset bucket

## Features

- 360° camera orbit around a bronze horse, driven by a 900vh scroll
- Liquid-bronze wave shader that shifts to sapphire as you scroll
- 450 additive forge sparks that get turbulent on fast scroll
- Four text slides with per-letter blur-up reveal, clip-path image wipe
- Grid overlay with drifting dots, stories-style progress, double-ring custom cursor

## Run

```bash
python3 -m http.server 5175
```
