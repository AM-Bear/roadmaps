# Roadmaps — Electron + Theming + Icon Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the AI Learning Roadmap web app into a native macOS desktop app called "Roadmaps" with light/dark mode toggle and a custom app icon.

**Architecture:** Keep the existing React/Vite renderer intact. Add an Electron main process in `electron/main.js` that loads the Vite dev server in dev mode and the built `dist/index.html` in production. Use `electron-builder` for packaging to a `.app`. Theme system uses a React context with two color maps (dark/light); all hardcoded hex values in inline styles are replaced with theme values from `useTheme()`.

**Tech Stack:** React 18, Vite 5, Electron (latest), electron-builder, concurrently, wait-on, sharp (icon generation)

---

### Task 1: Rename app to "Roadmaps"

**Files:**
- Modify: `package.json`
- Modify: `src/ai-roadmap.jsx:161-227`
- Modify: `src/utils.js`

**Step 1: Update package.json name**

Change `"name": "ai-roadmap"` to `"name": "roadmaps"`.

**Step 2: Update header text in ai-roadmap.jsx**

On line 186, change:
```jsx
<span style={{ color: "#e2e8f0", fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>ROADMAP</span>
```
to:
```jsx
<span style={{ color: "#e2e8f0", fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>ROADMAPS</span>
```

**Step 3: Update default board name in utils.js**

Read `src/utils.js` first. Find where `"AI Learning Roadmap"` appears and change it to `"My Roadmap"`.

Also update `src/ai-roadmap.jsx` line 68:
```jsx
return [makeBoard("My Roadmap", true)];
```

**Step 4: Commit**
```bash
git add package.json src/ai-roadmap.jsx src/utils.js
git commit -m "feat: rename app to Roadmaps"
```

---

### Task 2: Install Electron dependencies

**Files:**
- Modify: `package.json` (auto-updated by npm)

**Step 1: Install dependencies**
```bash
cd /Users/ashermills/claude-code/ai-roadmap
npm install --save-dev electron electron-builder concurrently wait-on
npm install --save-dev sharp
```

Expected: packages installed, package.json devDependencies updated.

**Step 2: Verify install**
```bash
npx electron --version
```
Expected: prints a version like `v33.x.x`

**Step 3: Commit**
```bash
git add package.json package-lock.json
git commit -m "chore: add electron and build dependencies"
```

---

### Task 3: Create Electron main process

**Files:**
- Create: `electron/main.js`

**Step 1: Create `electron/` directory and `main.js`**

```js
import { app, BrowserWindow } from 'electron'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Roadmaps',
    icon: path.join(__dirname, '../build/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#080c12',
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
```

**Step 2: Add `"main"` field to package.json**

Add `"main": "electron/main.js"` to package.json (top level, next to `"name"`).

**Step 3: Commit**
```bash
git add electron/main.js package.json
git commit -m "feat: add electron main process"
```

---

### Task 4: Add npm scripts for Electron

**Files:**
- Modify: `package.json`

**Step 1: Update scripts in package.json**

Replace the `"scripts"` block with:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "electron:dev": "concurrently \"vite\" \"wait-on http://localhost:5173 && VITE_DEV_SERVER_URL=http://localhost:5173 electron .\"",
  "electron:build": "vite build && electron-builder"
}
```

**Step 2: Add electron-builder config to package.json**

Add this top-level key to package.json:
```json
"build": {
  "appId": "com.roadmaps.app",
  "productName": "Roadmaps",
  "mac": {
    "icon": "build/icon.png",
    "category": "public.app-category.productivity",
    "target": "dmg"
  },
  "files": [
    "dist/**/*",
    "electron/**/*",
    "build/icon.png"
  ],
  "directories": {
    "output": "release"
  }
}
```

**Step 3: Commit**
```bash
git add package.json
git commit -m "chore: add electron dev and build scripts"
```

---

### Task 5: Generate app icon

**Files:**
- Create: `scripts/generate-icon.js`
- Create: `build/icon.png` (generated)

**Step 1: Create `build/` directory**
```bash
mkdir -p /Users/ashermills/claude-code/ai-roadmap/build
```

**Step 2: Create icon generation script**

Create `scripts/generate-icon.js`:
```js
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SIZE = 1024
const PAD = 80
const GAP = 40
const SQUARE = (SIZE - PAD * 2 - GAP) / 2

const svg = `<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${SIZE}" height="${SIZE}" rx="220" fill="#0d1117"/>
  <!-- Top-left: teal -->
  <rect x="${PAD}" y="${PAD}" width="${SQUARE}" height="${SQUARE}" rx="60" fill="#22d3a5"/>
  <!-- Top-right: purple -->
  <rect x="${PAD + SQUARE + GAP}" y="${PAD}" width="${SQUARE}" height="${SQUARE}" rx="60" fill="#818cf8"/>
  <!-- Bottom-left: pink -->
  <rect x="${PAD}" y="${PAD + SQUARE + GAP}" width="${SQUARE}" height="${SQUARE}" rx="60" fill="#f472b6"/>
  <!-- Bottom-right: blue -->
  <rect x="${PAD + SQUARE + GAP}" y="${PAD + SQUARE + GAP}" width="${SQUARE}" height="${SQUARE}" rx="60" fill="#60a5fa"/>
</svg>`

const outPath = path.join(__dirname, '../build/icon.png')

await sharp(Buffer.from(svg))
  .resize(SIZE, SIZE)
  .png()
  .toFile(outPath)

console.log(`Icon written to ${outPath}`)
```

**Step 3: Run the script to generate the icon**
```bash
cd /Users/ashermills/claude-code/ai-roadmap && node scripts/generate-icon.js
```
Expected: `Icon written to .../build/icon.png`

**Step 4: Verify the icon was created**
```bash
ls -lh /Users/ashermills/claude-code/ai-roadmap/build/icon.png
```
Expected: file exists, size > 10KB

**Step 5: Commit**
```bash
git add scripts/generate-icon.js build/icon.png
git commit -m "feat: add app icon (4-square Roadmaps logo)"
```

---

### Task 6: Create theme system

**Files:**
- Create: `src/theme.js`
- Create: `src/ThemeContext.jsx`
- Modify: `src/main.jsx`

**Step 1: Create `src/theme.js`**

```js
export const darkTheme = {
  bg:           "#080c12",
  bgSecondary:  "#0a0e18",
  bgTertiary:   "#0d1520",
  border:       "#0f1520",
  borderMid:    "#111927",
  borderLight:  "#1e2a3a",
  text:         "#e2e8f0",
  textMuted:    "#64748b",
  textDim:      "#334155",
  textFaint:    "#1e2a3a",
  inputBg:      "#080c12",
  scrollThumb:  "#1e2a3a",
}

export const lightTheme = {
  bg:           "#f8fafc",
  bgSecondary:  "#f1f5f9",
  bgTertiary:   "#e8edf5",
  border:       "#e2e8f0",
  borderMid:    "#cbd5e1",
  borderLight:  "#94a3b8",
  text:         "#0f172a",
  textMuted:    "#475569",
  textDim:      "#64748b",
  textFaint:    "#94a3b8",
  inputBg:      "#ffffff",
  scrollThumb:  "#cbd5e1",
}
```

**Step 2: Create `src/ThemeContext.jsx`**

```jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { darkTheme, lightTheme } from './theme.js'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('roadmaps-theme') || 'light')
  const theme = mode === 'dark' ? darkTheme : lightTheme

  useEffect(() => {
    localStorage.setItem('roadmaps-theme', mode)
  }, [mode])

  const toggle = () => setMode(m => m === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, mode, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
```

**Step 3: Read `src/main.jsx` then wrap App with ThemeProvider**

After reading, wrap the `<App />` render with `<ThemeProvider>`:
```jsx
import { ThemeProvider } from './ThemeContext.jsx'
// ...
root.render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
)
```

**Step 4: Commit**
```bash
git add src/theme.js src/ThemeContext.jsx src/main.jsx
git commit -m "feat: add theme system with light/dark context"
```

---

### Task 7: Apply theme to ai-roadmap.jsx (home screen + toggle button)

**Files:**
- Modify: `src/ai-roadmap.jsx`

**Step 1: Read the full file first**

**Step 2: Add useTheme import and hook**

At the top of the file add:
```jsx
import { useTheme } from './ThemeContext.jsx'
```

Inside `App()`, add:
```jsx
const { theme, mode, toggle } = useTheme()
```

**Step 3: Replace hardcoded colors with theme values**

Replace the root `<div>` background:
- `background: "#080c12"` → `background: theme.bg`

In the header section, replace:
- `borderBottom: "1px solid #0f1520"` → `borderBottom: \`1px solid ${theme.border}\``
- `color: "#e2e8f0"` (ROADMAPS text) → `color: theme.text`
- `color: "#1e2a3a"` (subtitle) → `color: theme.textFaint`

Replace scrollbar style in `<style>` tag:
```jsx
::-webkit-scrollbar-thumb { background: ${theme.scrollThumb}; border-radius: 2px; }
```

**Step 4: Add theme toggle button to header**

In the header's button row (next to Import/Blank/Template buttons), add:
```jsx
<button
  onClick={toggle}
  style={{
    padding: "7px 14px", borderRadius: 6, fontSize: 11, fontWeight: 600,
    cursor: "pointer", border: `1px solid ${theme.borderMid}`,
    background: "transparent", color: theme.textMuted,
  }}
>
  {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
</button>
```

**Step 5: Update GB component usage colors**

In `ui.jsx`, the `GB` component has hardcoded colors. We'll fix that in Task 11. For now, confirm the home screen renders.

**Step 6: Run dev server and verify home screen**
```bash
cd /Users/ashermills/claude-code/ai-roadmap && npm run dev
```
Open http://localhost:5173 — verify toggle button appears and switching themes changes the background.

**Step 7: Commit**
```bash
git add src/ai-roadmap.jsx
git commit -m "feat: apply theme to home screen and add toggle button"
```

---

### Task 8: Apply theme to constants.js

**Files:**
- Modify: `src/constants.js`

**Step 1: Read the file**

**Step 2: Update FI and TB style tokens**

`FI` and `TB` are used as base styles in many components. They currently have hardcoded colors. Since they're static objects (not hooks), we need to convert them to functions:

Replace:
```js
export const FI = { ... }
export const TB = { ... }
```

With:
```js
export const makeFI = (theme) => ({
  padding: "6px 8px",
  border: `1px solid ${theme.borderMid}`,
  borderRadius: 5,
  fontSize: 10,
  color: theme.textMuted,
  background: theme.inputBg,
  fontFamily: "'IBM Plex Mono',monospace",
})

export const makeTB = (theme) => ({
  width: 24, height: 24,
  borderRadius: 4,
  border: `1px solid ${theme.borderMid}`,
  background: "transparent",
  color: theme.textDim,
  fontSize: 13,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
})
```

**Step 3: Find all usages of FI and TB**
```bash
grep -rn "import.*FI\|import.*TB" /Users/ashermills/claude-code/ai-roadmap/src/
```

Note all files that import FI or TB — they'll need updating in Task 9+.

**Step 4: Commit**
```bash
git add src/constants.js
git commit -m "refactor: convert FI/TB style tokens to theme-aware functions"
```

---

### Task 9: Apply theme to ui.jsx

**Files:**
- Modify: `src/components/ui.jsx`

**Step 1: Read the file**

**Step 2: Add useTheme and update all components**

```jsx
import { useTheme } from '../ThemeContext.jsx'

export function F({ label, children, s }) {
  const { theme } = useTheme()
  return (
    <div style={s}>
      <div style={{ fontSize: 8, fontWeight: 700, color: theme.textFaint, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 4 }}>
        {label}
      </div>
      {children}
    </div>
  )
}

export function FL({ children }) {
  const { theme } = useTheme()
  return (
    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textFaint, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 4 }}>
      {children}
    </div>
  )
}

export function GB({ primary, children, ...rest }) {
  const { theme } = useTheme()
  return (
    <button
      style={{
        padding: "7px 14px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
        border: primary ? "none" : `1px solid ${theme.borderMid}`,
        background: primary ? "#22d3a5" : "transparent",
        color: primary ? "#080c12" : theme.textDim,
      }}
      {...rest}
    >
      {children}
    </button>
  )
}

export function CMI({ icon, label, danger, onClick }) {
  const { theme } = useTheme()
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", padding: "6px 11px", background: "transparent", border: "none",
        borderRadius: 4, color: danger ? "#ef4444" : theme.textMuted, fontSize: 10,
        textAlign: "left", display: "flex", gap: 9, alignItems: "center", cursor: "pointer",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = theme.borderMid)}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      <span style={{ width: 13 }}>{icon}</span>
      {label}
    </button>
  )
}
```

**Step 3: Commit**
```bash
git add src/components/ui.jsx
git commit -m "feat: apply theme to ui primitives"
```

---

### Task 10: Apply theme to Toolbar.jsx

**Files:**
- Modify: `src/components/Toolbar.jsx`

**Step 1: Read the file**

**Step 2: Add useTheme, update makeTB import, apply theme**

Replace `import { TB } from "../constants.js"` with `import { makeTB } from "../constants.js"`.

Add `import { useTheme } from '../ThemeContext.jsx'` and `const { theme } = useTheme()` inside the component.

Add `const TB = makeTB(theme)` inside the component body.

Then replace all hardcoded colors:
- `background: "#0a0e18"` → `background: theme.bgSecondary`
- `borderBottom: "1px solid #0f1520"` → `borderBottom: \`1px solid ${theme.border}\``
- `border: "1px solid #111927"` → `border: \`1px solid ${theme.borderMid}\``
- `color: "#334155"` → `color: theme.textDim`
- `background: "#080c12"` (search input) → `background: theme.inputBg`
- `border: "1px solid #111927"` → `border: \`1px solid ${theme.borderMid}\``
- `color: "#64748b"` → `color: theme.textMuted`
- `color: "#1e2a3a"` (zoom %) → `color: theme.textFaint`
- Dividers `background: "#111927"` → `background: theme.borderMid`

**Step 3: Commit**
```bash
git add src/components/Toolbar.jsx
git commit -m "feat: apply theme to Toolbar"
```

---

### Task 11: Apply theme to BoardCard.jsx

**Files:**
- Modify: `src/components/BoardCard.jsx`

**Step 1: Read the file**

**Step 2: Add useTheme and replace all hardcoded colors** following the same pattern as previous tasks (bg → theme.bg, borders → theme.borderMid, text → theme.text/textMuted/textDim/textFaint).

**Step 3: Commit**
```bash
git add src/components/BoardCard.jsx
git commit -m "feat: apply theme to BoardCard"
```

---

### Task 12: Apply theme to Sidebar.jsx

**Files:**
- Modify: `src/components/Sidebar.jsx`

**Step 1: Read the file**

**Step 2: Add useTheme and replace all hardcoded colors**

**Step 3: Commit**
```bash
git add src/components/Sidebar.jsx
git commit -m "feat: apply theme to Sidebar"
```

---

### Task 13: Apply theme to NodePanel.jsx

**Files:**
- Modify: `src/components/NodePanel.jsx`

**Step 1: Read the file**

**Step 2: Add useTheme, update FI import to makeFI, replace all hardcoded colors**

Add `const FI = makeFI(theme)` inside the component body.

**Step 3: Commit**
```bash
git add src/components/NodePanel.jsx
git commit -m "feat: apply theme to NodePanel"
```

---

### Task 14: Apply theme to Modals.jsx

**Files:**
- Modify: `src/components/Modals.jsx`

**Step 1: Read the file**

**Step 2: Add useTheme, update FI import to makeFI, replace all hardcoded colors**

**Step 3: Commit**
```bash
git add src/components/Modals.jsx
git commit -m "feat: apply theme to Modals"
```

---

### Task 15: Apply theme to Minimap.jsx

**Files:**
- Modify: `src/components/Minimap.jsx`

**Step 1: Read the file**

**Step 2: Add useTheme and replace all hardcoded colors**

**Step 3: Commit**
```bash
git add src/components/Minimap.jsx
git commit -m "feat: apply theme to Minimap"
```

---

### Task 16: Apply theme to Canvas.jsx

**Files:**
- Modify: `src/Canvas.jsx`

**Step 1: Read the full file**

**Step 2: Add useTheme and replace hardcoded colors**

Canvas.jsx has the SVG canvas background and edge rendering with hardcoded colors. Pay particular attention to:
- SVG background fill
- Edge/arrow colors
- Selection box colors
- Group rectangle colors
- Context menu background

**Step 3: Commit**
```bash
git add src/Canvas.jsx
git commit -m "feat: apply theme to Canvas"
```

---

### Task 17: Smoke test themes in browser

**Step 1: Run dev server**
```bash
cd /Users/ashermills/claude-code/ai-roadmap && npm run dev
```

**Step 2: Verify**
- Open http://localhost:5173
- Click "Dark Mode" / "Light Mode" toggle on home screen
- Open a board — verify toolbar, canvas, sidebar, panels all switch correctly
- Refresh page — verify theme persists (localStorage)

**Step 3: Fix any missed hardcoded colors** by reading failing components and applying theme values.

---

### Task 18: Test Electron dev mode

**Step 1: Run electron dev**
```bash
cd /Users/ashermills/claude-code/ai-roadmap && npm run electron:dev
```

Expected: Vite server starts, then an Electron window opens showing the app at http://localhost:5173.

**Step 2: Verify**
- App window opens with title "Roadmaps"
- Theme toggle works
- Boards open and interact correctly
- Data persists after closing and reopening

**Step 3: Fix any electron-specific issues** (e.g. window sizing, font loading).

**Step 4: Commit any fixes**
```bash
git add -A
git commit -m "fix: electron dev mode adjustments"
```

---

### Task 19: Build the macOS .app

**Step 1: Build**
```bash
cd /Users/ashermills/claude-code/ai-roadmap && npm run electron:build
```

Expected: `release/` directory created containing `Roadmaps-1.0.0.dmg` and `mac/Roadmaps.app`.

**Step 2: Test the .app**
```bash
open /Users/ashermills/claude-code/ai-roadmap/release/mac/Roadmaps.app
```

Expected: App opens, icon visible in Dock, everything works.

**Step 3: Copy to Applications (optional)**
```bash
cp -r /Users/ashermills/claude-code/ai-roadmap/release/mac/Roadmaps.app /Applications/
```

**Step 4: Final commit**
```bash
git add -A
git commit -m "feat: complete Roadmaps native macOS app with theming and icon"
```
