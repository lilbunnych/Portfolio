# Ninth Demo — Tempo

A focus timer as an installable Progressive Web App. One codebase runs on iOS, Android, macOS, Windows and Linux, on both ARM and x86, because it runs in the browser engine of each device.

## Stack

- Svelte 5 (runes) + TypeScript + Vite 8
- Web App Manifest + a hand-written service worker (`public/sw.js`) for offline use
- No UI libraries; Web Audio for the chime

## Features

- Focus / short break / long break with automatic cycling (long break every 4 sessions)
- Accurate timing based on timestamps (keeps correct time in background tabs)
- Tasks: add, complete, delete, pick the active task; sessions are credited to it
- Stats: minutes and sessions today, day streak, 7-day chart
- Settings for every duration and the chime, all saved in `localStorage`
- Keyboard: Space to start or pause, R to reset
- "Install app" button where the browser supports it, and an iOS "Add to Home Screen" hint
- Light and dark theme from the system setting

## Install on a device

- **Android / Chrome / Edge (desktop):** open the site, press "Install app" (or the install icon in the address bar).
- **iPhone / iPad:** open in Safari, tap Share, then "Add to Home Screen".

The service worker needs `https://` or `localhost`.

## Run

```bash
npm install
npm run dev
npm run build   # output in dist/
```
