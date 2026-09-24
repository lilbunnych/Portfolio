# Twelfth Demo — Nocturne

A desktop music player with a 3D audio visualiser and synced lyrics. Built with Electron and packaged for **macOS, Windows and Linux** on both **x64 and ARM64**. The same interface also runs in a browser.

## Features

- 3D visualiser (Three.js): a circular equaliser that hugs the cover, a scrolling neon floor, a live waveform and particles that rush on the beat; two visual styles
- Colours adapt to each track's cover art
- Synced, scrolling lyrics from `.lrc` files; click a line to jump to it; unsynced lyrics from ID3 tags are shown too
- Add music from your computer: file picker, whole folders, or drag and drop. Title, artist and cover art are read from ID3 tags
- Shuffle, repeat all / one, seek, volume, keyboard shortcuts (Space, arrows, L), media keys
- Cover tilts toward the cursor and pulses with the bass

## Default track

"Falls Through Walls (80s edit)" by **dotjot**, vocals and lyrics by **Kaer Trouz**, licensed under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/).
Sources: [remix](https://ccmixter.org/files/dotjot/67669), [a cappella and lyrics](https://ccmixter.org/files/Kaer_Trouz/14388).
Lyric timings were aligned for this demo. Cover art is original.

## Stack

- Electron 44 (sandboxed renderer, `contextBridge` preload, strict CSP)
- Plain JavaScript modules, Three.js r160 (vendored), Web Audio `AnalyserNode`
- A small built-in ID3v2 and LRC parser (`src/id3.js`)
- electron-builder for packaging

## Builds

| Platform | x64 | ARM64 |
|---|---|---|
| macOS | `Nocturne-1.0.0-mac-x64.zip` (Intel) | `Nocturne-1.0.0-mac-arm64.zip` (Apple silicon) |
| Windows | `Nocturne-1.0.0-win-x64.zip` | `Nocturne-1.0.0-win-arm64.zip` |
| Linux | `Nocturne-1.0.0-linux-x86_64.AppImage`, `.tar.gz` | `Nocturne-1.0.0-linux-arm64.AppImage`, `.tar.gz` |

Unsigned demo builds. On macOS, right-click the app and choose **Open** the first time. On Windows, choose **More info → Run anyway**.

## Run and build

```bash
npm install
npm start               # run the desktop app
npm run dist:all        # all platforms and architectures, output in release/
```

To try it in a browser, serve the `src/` folder with any static server.
