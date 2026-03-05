# Roadmaps App — Improvements Design
Date: 2026-03-05

## Overview
Transform the existing AI Learning Roadmap web app into a native macOS desktop app called **Roadmaps**, with light/dark mode theming and a proper app icon.

## 1. Electron Integration
- Add `electron` and `electron-vite` dependencies
- Create `src/main/index.js` (Electron main process) — opens a native window loading the React app
- Update `vite.config.js` to use the `electron-vite` plugin
- Existing `src/` React code stays untouched
- Scripts:
  - `npm run dev` — browser dev server (unchanged)
  - `npm run electron:dev` — launches native desktop app in dev mode
  - `npm run electron:build` — produces a `.app` in `dist/` ready for `/Applications`

## 2. Light/Dark Mode Toggle
- `theme` state defaults to `"light"`, persisted in `localStorage`
- Toggle button in the header: reads "Light Mode" / "Dark Mode", switches on click
- All hardcoded dark color values replaced with CSS variables
- Light theme: clean whites/light grays, same accent colors (teal, purple, pink, blue)
- Dark theme: existing dark palette preserved

## 3. App Icon
- macOS `icns` file generated from the existing 4-square logo (teal, purple, pink, blue on dark rounded background)
- PNG sizes: 16, 32, 64, 128, 256, 512, 1024px
- Referenced in Electron build config
- Appears in Dock, Applications folder, and title bar

## 4. App Rename
- App name changed from "AI Learning Roadmap" to **Roadmaps**
- Updated in: `package.json`, Electron window title, header UI, default board name
