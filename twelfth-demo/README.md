# Twelfth Demo — Jot

A small Markdown notes app for the desktop, built with Electron. One codebase, packaged for **macOS, Windows and Linux** on both **x64 and ARM64**.

## Stack

- Electron 44 (main process + sandboxed renderer with a `contextBridge` preload)
- Plain HTML, CSS and JavaScript in the renderer, no framework
- marked (Markdown) + DOMPurify (HTML sanitising)
- electron-builder for packaging

## Features

- Notes list with live search and highlighted matches
- Markdown editor with Editor / Split / Preview modes and a live preview
- Autosave to a JSON file in the user data folder (atomic writes)
- Export any note as a `.md` file through the native save dialog
- Native menu with shortcuts: Ctrl/Cmd+N new, Ctrl/Cmd+F search, Ctrl/Cmd+1/2/3 view mode, Ctrl/Cmd+E export
- Light and dark theme from the system; external links open in the browser
- Security: `contextIsolation`, `sandbox`, no `nodeIntegration`, strict Content Security Policy

## Builds

| Platform | x64 | ARM64 |
|---|---|---|
| macOS | `Jot-1.0.0-mac-x64.zip` (Intel) | `Jot-1.0.0-mac-arm64.zip` (Apple silicon) |
| Windows | `Jot-1.0.0-win-x64.zip` | `Jot-1.0.0-win-arm64.zip` |
| Linux | `Jot-1.0.0-linux-x86_64.AppImage`, `.tar.gz` | `Jot-1.0.0-linux-arm64.AppImage`, `.tar.gz` |

The builds are unsigned demo builds. On macOS, right-click the app and choose **Open** the first time. On Windows, choose **More info → Run anyway** in SmartScreen.

## Run and build

```bash
npm install
npm start               # run in development
npm run dist:mac        # macOS x64 + arm64
npm run dist:win        # Windows x64 + arm64 (zip)
npm run dist:linux      # Linux x64 + arm64 (AppImage, tar.gz)
npm run dist:all        # everything above
```

Output goes to `release/` (not committed).
