# Roadmaps Auto-Update Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move Roadmaps to its own public GitHub repo and add seamless auto-update so users are never on a stale version.

**Architecture:** `electron-updater` checks GitHub Releases on each app launch, silently downloads updates in the background, and prompts the user to restart. Publishing a new version is a single `npm run release` command that builds the DMG and creates the GitHub Release automatically.

**Tech Stack:** electron-updater, electron-builder publish config, gh CLI, GitHub Releases

---

### Task 1: Extract ai-roadmap into its own GitHub repo

**Files:**
- No source file changes — git operations only

**Context:** The `ai-roadmap/` folder currently lives inside `AM-Bear/claude-code` (the Anthropic Claude Code fork). We need to extract its 21 commits into a clean new repo `AM-Bear/roadmaps`.

**Step 1: Split the ai-roadmap subtree into its own branch**

Run from `/Users/ashermills/claude-code` (the repo root, one level up from `ai-roadmap/`):
```bash
cd /Users/ashermills/claude-code
git subtree split --prefix=ai-roadmap -b roadmaps-main
```

Expected output: a long SHA printed, e.g. `7a3c9f2d...`. This creates a local branch `roadmaps-main` containing only the ai-roadmap commits with paths rewritten so the root is the ai-roadmap directory.

**Step 2: Verify the branch looks correct**
```bash
git log --oneline roadmaps-main | head -10
```

Expected: You should see the 21 Roadmaps commits (most recent: `docs: add auto-update design doc`) with NO claude-code commits mixed in.

**Step 3: Create the new public GitHub repo**
```bash
gh repo create AM-Bear/roadmaps --public --description "Visual roadmap builder — native macOS app"
```

Expected: `✓ Created repository AM-Bear/roadmaps on GitHub`

**Step 4: Push the extracted branch to the new repo as main**
```bash
git push https://github.com/AM-Bear/roadmaps.git roadmaps-main:main
```

Expected: objects counted, compressed, written — ends with `* [new branch] roadmaps-main -> main`

**Step 5: Verify on GitHub**
```bash
gh repo view AM-Bear/roadmaps --web
```

Opens browser. Confirm you see 21 commits and the src/ folder at root (not inside ai-roadmap/).

**Step 6: Add the new repo as a remote inside the ai-roadmap working directory**
```bash
cd /Users/ashermills/claude-code/ai-roadmap
git remote add roadmaps https://github.com/AM-Bear/roadmaps.git
```

This lets you push future commits directly to the new repo.

**Step 7: No commit needed** — this task is pure git operations.

---

### Task 2: Install electron-updater

**Files:**
- Modify: `package.json` (devDependencies)

**Context:** `electron-updater` is the auto-update client that pairs with electron-builder. It must be installed as a regular dependency (not devDependency) because it runs in the packaged app.

Working directory for all commands: `/Users/ashermills/claude-code/ai-roadmap`

**Step 1: Install electron-updater**
```bash
npm install electron-updater
```

Expected: `added 1 package` (or a few transitive deps). `package.json` gets `"electron-updater": "^X.X.X"` in `dependencies`.

**Step 2: Commit**
```bash
git add package.json package-lock.json
git commit -m "feat: add electron-updater dependency"
```

---

### Task 3: Add auto-update logic to main.js

**Files:**
- Modify: `electron/main.js`

**Context:** `electron-updater`'s `autoUpdater.checkForUpdatesAndNotify()` is the simplest integration — it checks GitHub Releases, downloads silently, and shows a system notification when ready. We want a proper dialog (Restart / Later) instead of a silent notification, so we'll use `autoUpdater` events directly. Auto-update only runs in the packaged app (not in dev mode), so guard with `!process.env.VITE_DEV_SERVER_URL`.

**Step 1: Replace the contents of `electron/main.js` with:**

```js
import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import { fileURLToPath } from 'url'
import path from 'path'
import { autoUpdater } from 'electron-updater'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Disable auto-download — we'll trigger it manually after user confirms
autoUpdater.autoDownload = false

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

  return win
}

app.whenReady().then(() => {
  const win = createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // Only check for updates in packaged app
  if (!process.env.VITE_DEV_SERVER_URL) {
    autoUpdater.checkForUpdates()
  }

  autoUpdater.on('update-available', info => {
    dialog.showMessageBox(win, {
      type: 'info',
      title: 'Update Available',
      message: `Roadmaps ${info.version} is available.`,
      detail: 'Downloading now — you\'ll be prompted to restart when it\'s ready.',
      buttons: ['OK'],
    })
    autoUpdater.downloadUpdate()
  })

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox(win, {
      type: 'info',
      title: 'Update Ready',
      message: 'Roadmaps has been updated.',
      detail: 'Restart now to apply the update.',
      buttons: ['Restart Now', 'Later'],
      defaultId: 0,
    }).then(({ response }) => {
      if (response === 0) autoUpdater.quitAndInstall()
    })
  })

  autoUpdater.on('error', err => {
    console.error('Auto-updater error:', err)
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
```

**Step 2: Commit**
```bash
git add electron/main.js
git commit -m "feat: add auto-update via electron-updater with restart dialog"
```

---

### Task 4: Update package.json with publish config and release script

**Files:**
- Modify: `package.json`

**Context:** electron-builder needs a `publish` config to know where to upload releases and where the app should check for updates. The `release` script uses `--publish always` to create the GitHub Release automatically.

**Step 1: Update `package.json`**

Replace the `"scripts"` and `"build"` sections so they look like this (keep everything else unchanged):

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "electron:dev": "concurrently \"vite\" \"wait-on http://localhost:5173 && VITE_DEV_SERVER_URL=http://localhost:5173 electron .\"",
  "electron:build": "vite build && electron-builder",
  "release": "vite build && electron-builder --publish always"
},
```

And add a `"publish"` key inside the `"build"` object:

```json
"build": {
  "appId": "com.roadmaps.app",
  "productName": "Roadmaps",
  "publish": {
    "provider": "github",
    "owner": "AM-Bear",
    "repo": "roadmaps"
  },
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

**Step 2: Commit**
```bash
git add package.json
git commit -m "feat: add publish config and release script for GitHub Releases auto-update"
```

---

### Task 5: Push commits to new roadmaps repo

**Files:**
- No source changes

**Context:** The new commits (Tasks 2–4) were made to the local branch which still lives inside `AM-Bear/claude-code`. We need to push them to `AM-Bear/roadmaps` so the new repo is the source of truth.

**Step 1: Push to roadmaps remote**
```bash
git push roadmaps HEAD:main
```

Expected: commits pushed, `main` branch on `AM-Bear/roadmaps` now has all 24 commits.

**Step 2: Verify**
```bash
gh repo view AM-Bear/roadmaps
```

Should show the latest commit message: `feat: add publish config and release script for GitHub Releases auto-update`

---

### Task 6: Do a test release

**Context:** This verifies the full release pipeline end-to-end. You need a `GH_TOKEN` environment variable with repo write permissions. The token should have `repo` scope.

**Step 1: Check if GH_TOKEN is set**
```bash
echo $GH_TOKEN
```

If empty, create one:
- Go to https://github.com/settings/tokens/new
- Scopes: `repo` (full)
- Copy the token value
- Then run: `export GH_TOKEN=your_token_here`

**Step 2: Bump the version to 1.1.0**

In `package.json`, change `"version": "1.0.0"` to `"version": "1.1.0"`.

```bash
git add package.json
git commit -m "chore: bump version to 1.1.0 for first auto-update release"
```

**Step 3: Run the release**
```bash
GH_TOKEN=$GH_TOKEN npm run release 2>&1 | tail -20
```

Expected output ends with:
```
• published   GitHub release=v1.1.0
```

**Step 4: Verify the GitHub Release was created**
```bash
gh release list --repo AM-Bear/roadmaps
```

Expected: `v1.1.0    Latest    ...`

**Step 5: Push version bump to roadmaps remote**
```bash
git push roadmaps HEAD:main
```

---

### Task 7: Verify auto-update works

**Context:** Install the v1.1.0 DMG, then do a v1.1.1 release and confirm the running app detects the update.

**Step 1: Install v1.1.0**
```bash
open /Users/ashermills/claude-code/ai-roadmap/release/
```

Open the DMG, drag Roadmaps.app to `/Applications`, launch it.

**Step 2: Bump to v1.1.1 and release**

In `package.json` change version to `"1.1.1"`.

```bash
git add package.json
git commit -m "chore: bump version to 1.1.1 for auto-update verification"
GH_TOKEN=$GH_TOKEN npm run release 2>&1 | tail -5
git push roadmaps HEAD:main
```

**Step 3: Quit and relaunch Roadmaps.app**

On next launch, the app should show: "Roadmaps 1.1.1 is available. Downloading now..."

Then after download: "Roadmaps has been updated. Restart now to apply the update." → click Restart Now.

**Step 4: Verify version (optional)**

In Roadmaps → right-click dock icon → the app should now be running 1.1.1.

---

### Future: Shipping updates

The day-to-day workflow after this is done:

```bash
# 1. Make your code changes and commit them
# 2. Bump version in package.json
# 3. Release:
GH_TOKEN=$GH_TOKEN npm run release
# 4. Push to roadmaps repo:
git push roadmaps HEAD:main
```

All running Roadmaps instances will auto-update on next launch.
