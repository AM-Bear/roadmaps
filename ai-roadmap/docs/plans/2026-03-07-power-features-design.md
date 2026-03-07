# Power Features + Rich Nodes Design

**Date:** 2026-03-07

**Goal:** Add per-board feature toggles, assignable people, custom node types with icons/shapes, subtasks (checklist + steps), and a templates gallery.

**Architecture:** All new data lives on the board object (no backend required). Per-board `features` flags control visibility. New UI surfaces: Board Settings panel (gear icon in toolbar), updated NodePanel sections, and a template gallery modal on new board creation.

**Tech Stack:** React 18, existing codebase — no new dependencies.

---

## Data Model

### Board-level additions

```js
{
  // existing: id, name, nodes, edges, categories, groups, pan, zoom
  features: {
    assignees: true,   // show/hide people system
    nodeTypes: true,   // show/hide node type system
    subtasks: true,    // show/hide checklist/steps
  },
  people: [
    { id: "pid1", name: "Asher", initials: "AS", color: "#22d3a5" }
  ],
  nodeTypes: [
    // Built-in (builtin: true = cannot delete, can rename/re-icon)
    { id: "default",   name: "Default",   icon: "",   shape: "default",   builtin: true },
    { id: "task",      name: "Task",      icon: "",   shape: "task",      builtin: true },
    { id: "milestone", name: "Milestone", icon: "",   shape: "milestone", builtin: true },
    { id: "note",      name: "Note",      icon: "",   shape: "note",      builtin: true },
    { id: "resource",  name: "Resource",  icon: "",   shape: "resource",  builtin: true },
    // Custom types added by user
    { id: "uid123",    name: "Bug",       icon: "🐛", shape: "task",      builtin: false },
  ],
}
```

### Node-level additions

```js
{
  // existing: id, x, y, cat, rank, status, title, url, notes
  nodeType: "task",             // id from board.nodeTypes (default: "default")
  assignees: ["pid1", "pid2"],  // ids from board.people
  checklist: [
    { id: "cid1", text: "Write tests", done: false }
  ],
  steps: [
    { id: "sid1", title: "Research", assigneeId: "pid1", status: "todo" }
  ],
  subtaskMode: "checklist",     // "checklist" | "steps"
}
```

### Templates (localStorage)

- Built-in templates: defined in `src/data/templates.js`
- User templates: stored in `localStorage` under key `roadmaps_templates` as array of board objects

---

## Node Shapes

| Shape | Visual |
|-------|--------|
| `default` | Current rectangle (unchanged) |
| `task` | Rectangle with checkbox icon top-left, checklist progress bottom-right |
| `milestone` | Diamond shape, bold centered title |
| `note` | Rectangle with folded top-right corner |
| `resource` | Rectangle with link icon accent on left edge |

Node card always shows:
- Node type emoji icon (top-left, next to title) if icon is set
- Assignee avatar circles (bottom-left, max 3 + overflow `+N`)
- Checklist progress `2/5 ✓` (bottom-right, task shape only)

---

## UI Components

### Toolbar additions
- `⚙` Board Settings button (right side, next to `?`)
- Opens/closes BoardSettings panel

### BoardSettings panel
Slides in from the right, width 310px. Three sections:

1. **Features** — toggle switches for Assignees, Node Types, Subtasks
2. **People** (visible when assignees on) — list with add/rename/delete, auto color+initials
3. **Node Types** (visible when nodeTypes on) — list with icon picker (emoji keyboard + upload), shape selector, add custom, delete custom

### NodePanel additions (behind feature flags)
- **Node Type row** — chip picker showing all board node types
- **Assignees row** — colored chips + `+` button to add from people list
- **Subtasks section** — tab toggle between Checklist and Steps
  - Checklist: tickable list, add with Enter, delete empty with Backspace, progress count
  - Steps: rows with title input, assignee dropdown, status pill

### Templates gallery (new board modal)
Replaces the simple "new board" prompt. Two tabs:
- **Built-in** — grid of preset template cards (Blank, Project Plan, Sprint Board, Learning Roadmap, Content Calendar, Team Onboarding)
- **My Templates** — user-saved templates, "Save as Template" lives in BoardSettings

---

## New Files

- `src/components/BoardSettings.jsx` — settings/people/node types panel
- `src/components/TemplateGallery.jsx` — new board template picker modal
- `src/data/templates.js` — built-in template definitions

## Modified Files

- `src/Canvas.jsx` — showSettings state, pass BoardSettings, updated node rendering for shapes
- `src/components/Toolbar.jsx` — add `⚙` button
- `src/components/NodePanel.jsx` — add nodeType picker, assignees, subtasks sections
- `src/constants.js` — add default features/nodeTypes helpers
- `src/ai-roadmap.jsx` — replace "new board" prompt with TemplateGallery modal
- `src/data/seeds.js` — add default `features` and `nodeTypes` to seed board

---

## Migration

Old boards without `features`/`people`/`nodeTypes` fields default to:
- `features`: all `true` (opt-out rather than opt-in, so existing users see new features)
- `people`: `[]`
- `nodeTypes`: the 5 built-in types
- Node fields `nodeType`, `assignees`, `checklist`, `steps`, `subtaskMode`: all default to empty/none

---

## Out of Scope

- Drag-to-reorder checklist items (can add later)
- Image upload for node type icons (emoji only for now, upload in future)
- People avatars/photos
- Cross-board people/type libraries
