# Sixth Demo — Driftnote

Original variation on Fifth Demo: a one-screen waitlist page for a fictional voice-journal app, "Driftnote". Same format (single-screen launch moment), new concept, design and interactions.

## Stack

- One self-contained `index.html`: plain HTML, CSS, and vanilla JavaScript, no libraries
- Fonts: Cabinet Grotesk, Switzer (Fontshare); Phosphor icons
- No video or images: the background is drawn on a 2D canvas

## Features

- Halftone "sound field": a breathing voice waveform drawn in dots
- Pointer moves, clicks and typing in the email field send ripples through the field
- Headline decodes letter by letter on load
- Working waitlist form with inline validation and a success state
- Live countdown to the launch date
- Automatic light and dark theme, responsive layout, honors `prefers-reduced-motion`

## Run

```bash
python3 -m http.server 5178
```
