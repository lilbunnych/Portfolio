# Fifth Demo — Loopstack

Single-screen "footer hero" with a looping flower video, rebuilt from a detailed spec (prompt 3 of the Teletype prompt pack).

## Stack

- One self-contained `index.html`: plain HTML, CSS, and vanilla JavaScript, no libraries
- Fonts: Playfair Display, Outfit (Google Fonts), General Sans (Fontshare)
- Video and gradient loaded from the original asset bucket

## Features

- Background video under a soft black top gradient
- Word-by-word headline reveal and letter-by-letter giant wordmark reveal (mask + blur)
- Neon-green pulsing status dot on the CTA
- Custom cursor: instant outline ring plus a lagging glass "Say hello!" pill

Note: the spec is desktop-first and not responsive; the footer row crowds on phones by design.

## Run

```bash
python3 -m http.server 5177
```
