# Roadmaps — Polish & UX Design
Date: 2026-03-06

## Overview
Add undo/redo, a full keyboard shortcut set, and hover tooltips to make Roadmaps feel like a polished, professional tool.

## 1. Undo/Redo (Command Pattern)

- New `src/history.js` module — `HistoryManager` class with unlimited `undoStack` and `redoStack` arrays
- Every mutating board action becomes a command object with `apply()` and `inverse()` methods
- Actions covered: add node, delete node, move node, add edge, delete edge, rename node, add group, delete group, edit group
- History is per-board, lives in React state, resets on app close
- `Cmd+Z` — pops undoStack, calls inverse(), pushes to redoStack
- `Cmd+Shift+Z` — pops redoStack, re-applies, pushes to undoStack

## 2. Keyboard Shortcuts

Extended keyboard listener in `Canvas.jsx`:

| Shortcut | Action |
|---|---|
| `Cmd+Z` | Undo |
| `Cmd+Shift+Z` | Redo |
| `Cmd+D` | Duplicate selected node(s) |
| `Cmd+A` | Select all nodes |
| `Cmd+S` | Export current board as JSON |
| `Cmd+N` | Open Add Node modal |
| `Cmd+F` | Focus search/filter input |
| `1` | Select mode |
| `2` | Connect mode |
| `3` | Delete mode |
| `Escape` | Clear selection / close panels (existing) |
| `Delete/Backspace` | Delete selected (existing) |
| `Space+drag` | Pan canvas (existing) |

## 3. Hover Tooltips

- Native `title` attribute on all Toolbar buttons showing action + shortcut
- e.g. `title="Add Node (Cmd+N)"`, `title="Select (1)"`, `title="Undo (Cmd+Z)"`
- Extends existing pattern already used on zoom/fit buttons
- No extra library needed
