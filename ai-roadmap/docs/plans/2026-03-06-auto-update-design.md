# Roadmaps — Auto-Update Design
Date: 2026-03-06

## Overview
Move Roadmaps to its own public GitHub repo and add seamless auto-update via `electron-updater` + GitHub Releases, so users never need to manually reinstall.

## 1. Repo Migration

- Create new public GitHub repo: `AM-Bear/roadmaps`
- Push all current commits from `ai-roadmap` directory to the new repo
- Existing `AM-Bear/claude-code` repo is unaffected

## 2. Auto-Update Architecture

- Add `electron-updater` package
- `main.js` calls `autoUpdater.checkForUpdatesAndNotify()` on app launch
- Update downloads silently in background
- Native dialog when ready: "A new version of Roadmaps is available. Restart to update?" (Restart / Later)
- `package.json` build config gets `publish` field pointing to `AM-Bear/roadmaps` on GitHub
- Build produces DMG + `.yml` update manifest (required by electron-updater)

## 3. Release Workflow

New `npm run release` script that:
1. Runs `vite build && electron-builder --publish always`
2. electron-builder automatically creates a GitHub Release and uploads DMG + manifest

To ship a new version:
1. Bump `version` in `package.json`
2. Run `npm run release`
3. Done — all running instances auto-update on next launch

## Tech Stack

- `electron-updater` — auto-update client (electron-builder ecosystem)
- `gh` CLI — already available for GitHub operations
- GitHub Releases — free hosting for DMG + update manifests
- `GH_TOKEN` environment variable — for authenticated release publishing
