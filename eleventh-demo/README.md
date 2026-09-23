# Eleventh Demo — Sprout

A habit tracker mobile app. One TypeScript codebase for **iOS and Android** (and the web), built with Expo.

## Stack

- Expo SDK 57, React Native 0.86, TypeScript
- Expo Router (tabs + modal), AsyncStorage for persistence
- react-native-svg (progress ring), Expo Haptics, Ionicons

## Features

- Today: week strip to browse past days, daily progress ring, habits with streaks
- Tap to check off (with haptic feedback on phones), long press to delete
- New habit modal with name validation, icon and colour pickers
- Progress: 12-week heatmap, 30-day completion per habit, best streak
- Light and dark mode from the system setting
- Ships with sample history; "Reset to sample data" restores it

## Platforms and CPU architectures

| Target | How | CPU |
|---|---|---|
| iPhone / iPad | Expo Go, or an EAS build | ARM64 (simulator builds: ARM64 + x86_64) |
| Android phones | Expo Go, or the APK from EAS | arm64-v8a, armeabi-v7a, x86, x86_64 (React Native default ABIs) |
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
npx eas-cli@latest build --profile preview --platform ios       # iOS simulator build
npx eas-cli@latest build --profile production --platform all    # store builds (needs Apple/Google accounts)
```

## Web build for the portfolio hub

```bash
EXPO_BASE_URL=/eleventh-demo/dist npx expo export --platform web
```

## Note

On web production builds, `<Link asChild>` around a `Pressable` with an array style crashed rendering, so navigation uses `router.push` instead.
