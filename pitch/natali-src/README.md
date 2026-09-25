# Natali — spec site (React)

Pitch demo for the "Натали" flower workshop in Khimki. A 3D rose opens as you scroll, and the bouquet builder changes it live and sends a ready order to Telegram.

## Stack

- Vite, React 19, TypeScript
- Tailwind CSS v4
- three.js via @react-three/fiber (procedural rose, no models)
- Motion (scroll reveals), Lenis (smooth scroll)

## Run

```bash
npm install
npm run dev      # local dev server
npm run build    # builds into ../natali (the published folder)
```

The build output in `../natali` is committed so GitHub Pages serves it at `/Portfolio/pitch/natali/`.
