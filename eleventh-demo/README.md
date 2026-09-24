# Eleventh Demo — Stackd

A block puzzle game for phones: drag pieces onto an 8×8 board, fill rows or columns to clear them, chain clears for combos. One TypeScript codebase for **iOS and Android** (and the web), built with Expo.

## Stack

- Expo SDK 57, React Native 0.86, TypeScript, Expo Router
- Game rules in `src/lib/game.ts` (pure functions), screen in `src/app/index.tsx`
- Drag and drop with `PanResponder`, animations with `Animated`, Expo Haptics, AsyncStorage for the best score

## Features

- 8×8 board, three pieces per round, 37 piece shapes in 7 colours
- Live placement preview and highlight of the lines a drop will clear
- Row and column clears, multi-line bonus and combo streaks with score pop-ups
- The piece floats above your finger while dragging, so it is never hidden
- Game over when no piece fits, best score saved on the device
- Haptic feedback on phones

## Platforms and CPU architectures

| Target | How | CPU |
|---|---|---|
| iPhone / iPad | Expo Go, or an EAS build | ARM64 (simulator builds: ARM64 + x86_64) |
| Android phones | Expo Go, or the APK from EAS | arm64-v8a, armeabi-v7a, x86, x86_64 |
| Web | `npm run build:web` | any |

## Run on your phone (no build needed)

```bash
npm install
npx expo start
```

Install **Expo Go** from the App Store or Google Play and scan the QR code.

## Build installable apps (cloud, no Xcode or Android Studio)

```bash
npx eas-cli@latest login
npx eas-cli@latest build --profile preview --platform android   # .apk for any Android phone
npx eas-cli@latest build --profile production --platform all    # store builds (needs Apple/Google accounts)
```

## Web build for the portfolio

```bash
EXPO_BASE_URL=/Portfolio/eleventh-demo/dist npx expo export --platform web   # path on GitHub Pages
```
