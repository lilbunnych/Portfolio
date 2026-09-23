# Portfolio

Twelve demo projects: websites, web apps, a mobile app and a desktop app. Every project uses a fictional brand and shows a "DEMO" notice.

Open `index.html` (served over HTTP) for the portfolio hub with previews and links to every demo.

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Projects

| Folder | Name | Type | Stack | Origin |
|---|---|---|---|---|
| `first-demo/` | Lumora | Studio landing page | HTML/CSS/JS, Lenis | Rebuilt from spec |
| `second-demo/` | Tessel | Studio landing page | HTML/CSS/JS, Lenis | Original |
| `third-demo/` | Laocoön | WebGL scroll story | Three.js | Rebuilt from spec |
| `fourth-demo/` | Vitrea | WebGL scroll story | Three.js, Lenis | Original |
| `fifth-demo/` | Loopstack | Single-screen hero | HTML/CSS/JS, video | Rebuilt from spec |
| `sixth-demo/` | Driftnote | Waitlist page | Canvas 2D | Original |
| `seventh-demo/` | Fjordhus | Booking site | Astro, Tailwind | Original |
| `eighth-demo/` | Ledgerly | Finance dashboard | React, TypeScript, Recharts | Original |
| `ninth-demo/` | Tempo | Installable PWA | Svelte 5 | Original |
| `tenth-demo/` | Understory | Editorial long read | HTML/CSS/JS | Original |
| `eleventh-demo/` | Sprout | Mobile app (iOS, Android, web) | Expo, React Native | Original |
| `twelfth-demo/` | Jot | Desktop app (macOS, Windows, Linux; x64 + ARM64) | Electron | Original |

Built projects keep their `dist/` output in the repo so the hub works without a build step. The Jot desktop builds are produced with `npm run dist:all` in `twelfth-demo/` and are not committed.
