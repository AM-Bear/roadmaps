# Power Features + Rich Nodes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add per-board feature toggles, assignable people, custom node types with emoji icons and shapes, subtasks (checklist + steps mode), and a templates gallery.

**Architecture:** All new data lives on the board object in localStorage — no backend. Per-board `features` flags control UI visibility. Three new components: `BoardSettings.jsx`, `TemplateGallery.jsx`. Existing `NodePanel.jsx`, `Canvas.jsx`, `Toolbar.jsx`, `utils.js`, and `ai-roadmap.jsx` get targeted additions.

**Tech Stack:** React 18, Vite 5, Electron — no new dependencies.

---

### Task 1: Add default data helpers to constants.js and utils.js

**Context:** Every board needs default `features`, `people`, `nodeTypes` fields. We define these once and reuse them in migration, makeBoard, and new board creation.

**Files:**
- Modify: `src/constants.js`
- Modify: `src/utils.js`

**Step 1: Add DEFAULT_NODE_TYPES and DEFAULT_FEATURES to constants.js**

At the bottom of `src/constants.js`, add:

```js
export const DEFAULT_NODE_TYPES = [
  { id: "default",   name: "Default",   icon: "",   shape: "default",   builtin: true },
  { id: "task",      name: "Task",      icon: "",   shape: "task",      builtin: true },
  { id: "milestone", name: "Milestone", icon: "",   shape: "milestone", builtin: true },
  { id: "note",      name: "Note",      icon: "",   shape: "note",      builtin: true },
  { id: "resource",  name: "Resource",  icon: "",   shape: "resource",  builtin: true },
];

export const DEFAULT_FEATURES = { assignees: true, nodeTypes: true, subtasks: true };
```

**Step 2: Update makeBoard in utils.js to include new fields**

Find `makeBoard` (line 22). Replace with:

```js
export function makeBoard(name, seed = false) {
  return {
    id: uid(),
    name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    nodes:      seed ? SEED_NODES.map(n => ({ ...n })) : [],
    edges:      seed ? SEED_EDGES.map(e => ({ ...e })) : [],
    categories: DEFAULT_CATS.map(c => ({ ...c })),
    groups:     [],
    pan:        { x: 40, y: 40 },
    zoom:       0.55,
    features:   { ...DEFAULT_FEATURES },
    people:     [],
    nodeTypes:  DEFAULT_NODE_TYPES.map(t => ({ ...t })),
  };
}
```

Also add the import at top of `utils.js` (it already imports from seeds.js — add DEFAULT_NODE_TYPES and DEFAULT_FEATURES):

```js
import { DEFAULT_NODE_TYPES, DEFAULT_FEATURES } from "./constants.js";
```

**Step 3: Update loadBoards migration in ai-roadmap.jsx**

Find the `loadBoards` hydration block (line 31–35). Replace with:

```js
return boards.map(b => ({
  groups:    [],
  features:  { ...DEFAULT_FEATURES },
  people:    [],
  nodeTypes: DEFAULT_NODE_TYPES.map(t => ({ ...t })),
  ...b,
  categories: b.categories?.length ? b.categories : DEFAULT_CATS.map(c => ({ ...c })),
}));
```

Add to imports at top of `ai-roadmap.jsx`:
```js
import { DEFAULT_NODE_TYPES, DEFAULT_FEATURES } from "./constants.js";
```

**Step 4: Verify in dev server**

```bash
npm run dev
```

Open the app, open DevTools console, run:
```js
JSON.parse(localStorage.getItem('ai-roadmap-boards'))[0]
```
Expected: board object with `features`, `people`, `nodeTypes` fields populated.

**Step 5: Commit**

```bash
git add src/constants.js src/utils.js src/ai-roadmap.jsx
git commit -m "feat: add default features/people/nodeTypes to board data model"
```

---

### Task 2: BoardSettings panel — feature toggles

**Context:** A `⚙` button in the toolbar opens/closes a `BoardSettings` panel (right side, width 310px). This task builds the panel shell and the feature toggle switches only. People manager and node types manager come in later tasks.

**Files:**
- Create: `src/components/BoardSettings.jsx`
- Modify: `src/components/Toolbar.jsx`
- Modify: `src/Canvas.jsx`

**Step 1: Create BoardSettings.jsx with feature toggles**

```jsx
// src/components/BoardSettings.jsx
import { useTheme } from "../ThemeContext.jsx";

function Toggle({ label, value, onChange }) {
  const { theme } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
      <span style={{ color: theme.textMuted, fontSize: 10 }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer",
          background: value ? "#22d3a5" : theme.borderMid,
          position: "relative", transition: "background 0.15s",
        }}
      >
        <span style={{
          position: "absolute", top: 3, left: value ? 18 : 3,
          width: 14, height: 14, borderRadius: 7,
          background: "#fff", transition: "left 0.15s",
        }} />
      </button>
    </div>
  );
}

export default function BoardSettings({ board, onUpdateBoard, onClose }) {
  const { theme } = useTheme();
  const features = board.features || {};
  const setFeature = (key, val) =>
    onUpdateBoard(b => ({ ...b, features: { ...b.features, [key]: val } }));

  return (
    <div style={{
      position: "absolute", right: 0, top: 0, bottom: 0, width: 310,
      background: theme.bgSecondary, borderLeft: `1px solid ${theme.border}`,
      display: "flex", flexDirection: "column", zIndex: 20,
      boxShadow: "-4px 0 24px rgba(0,0,0,.5)",
    }}>
      {/* Header */}
      <div style={{
        padding: "11px 13px 9px", borderBottom: `1px solid ${theme.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
      }}>
        <span style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, letterSpacing: ".1em" }}>BOARD SETTINGS</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: theme.textFaint, fontSize: 13, padding: 2, cursor: "pointer" }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 13 }}>
        {/* Feature Toggles */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: theme.textFaint, letterSpacing: ".1em", marginBottom: 10 }}>FEATURES</div>
          <Toggle label="Assignees" value={!!features.assignees} onChange={v => setFeature("assignees", v)} />
          <Toggle label="Node Types" value={!!features.nodeTypes} onChange={v => setFeature("nodeTypes", v)} />
          <Toggle label="Subtasks" value={!!features.subtasks} onChange={v => setFeature("subtasks", v)} />
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Add ⚙ button to Toolbar.jsx**

In `src/components/Toolbar.jsx`, add `showSettings` and `setShowSettings` to props destructuring:

```js
export default function Toolbar({
  boardName, canvasMode, setMode, setConnecting,
  categories, onAddNode, groupMode, setGroupMode,
  search, setSearch,
  zoom, setZoom, setPan, fitScreen, onBack,
  searchRef, showHelp, setShowHelp, showSettings, setShowSettings,
}) {
```

After the `?` button, add a separator and `⚙` button:

```jsx
      <div style={{ width: 1, height: 18, background: theme.borderMid }} />
      <button
        onClick={() => setShowSettings(v => !v)}
        title="Board settings (⚙)"
        style={{
          ...TB, cursor: "pointer",
          borderColor: showSettings ? "#22d3a5" : theme.borderMid,
          background: showSettings ? "#22d3a512" : "transparent",
          color: showSettings ? "#22d3a5" : theme.textDim,
        }}
      >⚙</button>
```

**Step 3: Wire BoardSettings into Canvas.jsx**

Add import at top of `src/Canvas.jsx`:
```js
import BoardSettings from "./components/BoardSettings.jsx";
```

Add state near the other panel states (around line 35):
```js
const [showSettings, setShowSettings] = useState(false);
```

Pass props to Toolbar (add alongside `showHelp`):
```jsx
showSettings={showSettings} setShowSettings={setShowSettings}
```

In the return JSX, after the help panel block and before the modals block, add:
```jsx
{/* Board settings panel */}
{showSettings && (
  <BoardSettings
    board={board}
    onUpdateBoard={onUpdate}
    onClose={() => setShowSettings(false)}
  />
)}
```

**Step 4: Verify in dev server**

Open a board. Click `⚙` in toolbar — settings panel should slide in on the right. Toggle switches should update board features. Click `✕` to close.

**Step 5: Commit**

```bash
git add src/components/BoardSettings.jsx src/components/Toolbar.jsx src/Canvas.jsx
git commit -m "feat: add BoardSettings panel with feature toggles"
```

---

### Task 3: BoardSettings — People manager

**Context:** When `features.assignees` is on, show a people list in BoardSettings. People have name, auto-generated color from a palette, and auto-generated initials. Add/rename/delete.

**Files:**
- Modify: `src/components/BoardSettings.jsx`

**Step 1: Add People section to BoardSettings.jsx**

Add this helper above the component:

```js
const PERSON_COLORS = [
  "#22d3a5","#60a5fa","#a78bfa","#fbbf24","#fb923c",
  "#f472b6","#34d399","#38bdf8","#818cf8","#f87171",
];

function initials(name) {
  return name.trim().split(/\s+/).map(w => w[0]?.toUpperCase() || "").slice(0, 2).join("");
}
```

Add this inside the `BoardSettings` component body, after the features section div:

```jsx
{/* People manager */}
{features.assignees && (
  <div style={{ marginBottom: 20 }}>
    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textFaint, letterSpacing: ".1em", marginBottom: 10 }}>PEOPLE</div>
    {(board.people || []).map((person, i) => (
      <div key={person.id} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
        <div style={{
          width: 22, height: 22, borderRadius: "50%", background: person.color,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 8, fontWeight: 700, color: "#fff", flexShrink: 0,
        }}>
          {initials(person.name)}
        </div>
        <input
          value={person.name}
          onChange={e => {
            const name = e.target.value;
            onUpdateBoard(b => ({ ...b, people: b.people.map(p => p.id === person.id ? { ...p, name, initials: initials(name) } : p) }));
          }}
          style={{
            flex: 1, background: theme.inputBg, border: `1px solid ${theme.borderMid}`,
            borderRadius: 4, padding: "4px 7px", color: theme.textMuted, fontSize: 10,
            fontFamily: "'IBM Plex Mono',monospace", outline: "none",
          }}
        />
        <button
          onClick={() => onUpdateBoard(b => ({ ...b, people: b.people.filter(p => p.id !== person.id) }))}
          style={{ background: "none", border: "none", color: theme.textFaint, fontSize: 11, cursor: "pointer", padding: "0 2px" }}
        >✕</button>
      </div>
    ))}
    <button
      onClick={() => {
        const id = `p${Date.now()}`;
        const color = PERSON_COLORS[(board.people || []).length % PERSON_COLORS.length];
        onUpdateBoard(b => ({ ...b, people: [...(b.people || []), { id, name: "New Person", initials: "NP", color }] }));
      }}
      style={{
        width: "100%", padding: "5px", border: `1px dashed ${theme.borderMid}`,
        borderRadius: 5, background: "transparent", color: theme.textFaint,
        fontSize: 9, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace",
      }}
    >+ Add Person</button>
  </div>
)}
```

Also add the `uid` import at top of BoardSettings.jsx:
```js
import { uid } from "../constants.js";
```

**Step 2: Verify**

Open BoardSettings, enable Assignees. Add a person — should appear with initials avatar. Edit name — initials should update. Delete — should remove. Toggle Assignees off — people section hides.

**Step 3: Commit**

```bash
git add src/components/BoardSettings.jsx
git commit -m "feat: add people manager to BoardSettings"
```

---

### Task 4: BoardSettings — Node Types manager

**Context:** When `features.nodeTypes` is on, show the node types list. Built-in types can be renamed and re-iconned but not deleted. Custom types can be fully deleted. Icon is an emoji (text input, user can use OS emoji keyboard with Ctrl+Cmd+Space on mac).

**Files:**
- Modify: `src/components/BoardSettings.jsx`

**Step 1: Add Node Types section**

After the People section, add:

```jsx
{/* Node Types manager */}
{features.nodeTypes && (
  <div style={{ marginBottom: 20 }}>
    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textFaint, letterSpacing: ".1em", marginBottom: 10 }}>NODE TYPES</div>
    {(board.nodeTypes || []).map(nt => (
      <div key={nt.id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <input
          value={nt.icon}
          onChange={e => onUpdateBoard(b => ({ ...b, nodeTypes: b.nodeTypes.map(t => t.id === nt.id ? { ...t, icon: e.target.value } : t) }))}
          placeholder="emoji"
          style={{
            width: 32, textAlign: "center", background: theme.inputBg,
            border: `1px solid ${theme.borderMid}`, borderRadius: 4,
            padding: "4px 2px", color: theme.textMuted, fontSize: 14, outline: "none",
          }}
        />
        <input
          value={nt.name}
          onChange={e => onUpdateBoard(b => ({ ...b, nodeTypes: b.nodeTypes.map(t => t.id === nt.id ? { ...t, name: e.target.value } : t) }))}
          style={{
            flex: 1, background: theme.inputBg, border: `1px solid ${theme.borderMid}`,
            borderRadius: 4, padding: "4px 7px", color: theme.textMuted, fontSize: 10,
            fontFamily: "'IBM Plex Mono',monospace", outline: "none",
          }}
        />
        <select
          value={nt.shape}
          onChange={e => onUpdateBoard(b => ({ ...b, nodeTypes: b.nodeTypes.map(t => t.id === nt.id ? { ...t, shape: e.target.value } : t) }))}
          style={{
            background: theme.inputBg, border: `1px solid ${theme.borderMid}`,
            borderRadius: 4, padding: "4px 4px", color: theme.textMuted, fontSize: 9,
            fontFamily: "'IBM Plex Mono',monospace", outline: "none",
          }}
        >
          {["default","task","milestone","note","resource"].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {!nt.builtin && (
          <button
            onClick={() => onUpdateBoard(b => ({ ...b, nodeTypes: b.nodeTypes.filter(t => t.id !== nt.id) }))}
            style={{ background: "none", border: "none", color: theme.textFaint, fontSize: 11, cursor: "pointer", padding: "0 2px" }}
          >✕</button>
        )}
        {nt.builtin && <div style={{ width: 18 }} />}
      </div>
    ))}
    <button
      onClick={() => onUpdateBoard(b => ({ ...b, nodeTypes: [...(b.nodeTypes || []), { id: `nt${Date.now()}`, name: "Custom", icon: "", shape: "default", builtin: false }] }))}
      style={{
        width: "100%", padding: "5px", border: `1px dashed ${theme.borderMid}`,
        borderRadius: 5, background: "transparent", color: theme.textFaint,
        fontSize: 9, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace",
      }}
    >+ Add Type</button>
  </div>
)}
```

**Step 2: Verify**

Enable Node Types in settings. Should see 5 built-in types with icon/name/shape fields. Built-ins: no delete button. Add custom type — appears with delete button. Edit emoji — on mac, click the emoji field and press Ctrl+Cmd+Space to open emoji picker.

**Step 3: Commit**

```bash
git add src/components/BoardSettings.jsx
git commit -m "feat: add node types manager to BoardSettings"
```

---

### Task 5: NodePanel — Node Type picker and Assignees

**Context:** NodePanel needs two new sections at the top (below Status): a node type chip row and an assignees row. Both are gated behind `board.features`.

**Files:**
- Modify: `src/components/NodePanel.jsx`
- Modify: `src/Canvas.jsx` (pass board to NodePanel)

**Step 1: Pass `board` prop to NodePanel in Canvas.jsx**

Find the NodePanel usage in `src/Canvas.jsx` (search for `<NodePanel`). Add `board={board}` to its props.

**Step 2: Add node type and assignees to NodePanel.jsx**

Update the props signature:
```js
export default function NodePanel({ panel, board, categories, edges, nmap, onUpdate, onClose, onDelete, onDuplicate, onDelEdge }) {
```

After the Status `<F>` block and before the URL `<F>` block, add:

```jsx
{/* Node Type picker */}
{board?.features?.nodeTypes && (board?.nodeTypes || []).length > 0 && (
  <F label="Node Type">
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
      {(board.nodeTypes || []).map(nt => (
        <button
          key={nt.id}
          onClick={() => updNode("nodeType", nt.id)}
          style={{
            padding: "3px 9px", borderRadius: 4, border: "1px solid", cursor: "pointer", fontSize: 9,
            fontFamily: "'IBM Plex Mono',monospace",
            borderColor: panel.nodeType === nt.id ? "#818cf8" : theme.borderMid,
            background: panel.nodeType === nt.id ? "#818cf812" : "transparent",
            color: panel.nodeType === nt.id ? "#818cf8" : theme.textFaint,
          }}
        >
          {nt.icon ? `${nt.icon} ` : ""}{nt.name}
        </button>
      ))}
    </div>
  </F>
)}

{/* Assignees */}
{board?.features?.assignees && (board?.people || []).length > 0 && (
  <F label="Assignees">
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center" }}>
      {(panel.assignees || []).map(pid => {
        const person = (board.people || []).find(p => p.id === pid);
        if (!person) return null;
        return (
          <button
            key={pid}
            onClick={() => updNode("assignees", (panel.assignees || []).filter(id => id !== pid))}
            title={`Remove ${person.name}`}
            style={{
              display: "flex", alignItems: "center", gap: 4, padding: "3px 7px",
              borderRadius: 12, border: `1px solid ${person.color}40`,
              background: person.color + "20", color: person.color,
              fontSize: 9, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace",
            }}
          >
            {person.initials} {person.name} ✕
          </button>
        );
      })}
      {(board.people || []).filter(p => !(panel.assignees || []).includes(p.id)).length > 0 && (
        <select
          value=""
          onChange={e => {
            if (!e.target.value) return;
            updNode("assignees", [...(panel.assignees || []), e.target.value]);
          }}
          style={{
            background: theme.inputBg, border: `1px solid ${theme.borderMid}`,
            borderRadius: 4, padding: "3px 6px", color: theme.textFaint, fontSize: 9,
            fontFamily: "'IBM Plex Mono',monospace", outline: "none", cursor: "pointer",
          }}
        >
          <option value="">+ Assign</option>
          {(board.people || []).filter(p => !(panel.assignees || []).includes(p.id)).map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      )}
    </div>
  </F>
)}
```

**Step 3: Verify**

Add a person in BoardSettings. Open a node panel — should see "+ Assign" dropdown. Select a person — chip appears. Click chip — removes assignment. Select a node type — chip highlights.

**Step 4: Commit**

```bash
git add src/components/NodePanel.jsx src/Canvas.jsx
git commit -m "feat: add node type picker and assignees to NodePanel"
```

---

### Task 6: NodePanel — Subtasks (checklist + steps)

**Context:** When `features.subtasks` is on, NodePanel shows a Subtasks section with two modes: Checklist (simple tick list) and Steps (title + assignee + status per item). Mode is stored per-node as `subtaskMode`. Tab toggle switches modes.

**Files:**
- Modify: `src/components/NodePanel.jsx`

**Step 1: Add uid import to NodePanel.jsx**

At top of file:
```js
import { STATUS, makeFI, uid } from "../constants.js";
```

**Step 2: Add Subtasks section to NodePanel.jsx**

After the Connections `<F>` block and before the Duplicate/Delete button row, add:

```jsx
{/* Subtasks */}
{board?.features?.subtasks && (
  <F label="Subtasks">
    {/* Mode tabs */}
    <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
      {["checklist", "steps"].map(mode => (
        <button
          key={mode}
          onClick={() => updNode("subtaskMode", mode)}
          style={{
            flex: 1, padding: "3px 0", borderRadius: 4, border: "1px solid", cursor: "pointer",
            fontSize: 8, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700,
            borderColor: (panel.subtaskMode || "checklist") === mode ? "#22d3a5" : theme.borderMid,
            background: (panel.subtaskMode || "checklist") === mode ? "#22d3a510" : "transparent",
            color: (panel.subtaskMode || "checklist") === mode ? "#22d3a5" : theme.textFaint,
          }}
        >
          {mode === "checklist" ? "Checklist" : "Steps"}
        </button>
      ))}
    </div>

    {/* Checklist mode */}
    {(panel.subtaskMode || "checklist") === "checklist" && (
      <div>
        {(panel.checklist || []).map((item, i) => (
          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
            <input
              type="checkbox"
              checked={item.done}
              onChange={e => {
                const updated = (panel.checklist || []).map(c => c.id === item.id ? { ...c, done: e.target.checked } : c);
                updNode("checklist", updated);
              }}
              style={{ cursor: "pointer", accentColor: "#22d3a5" }}
            />
            <input
              value={item.text}
              onChange={e => {
                const updated = (panel.checklist || []).map(c => c.id === item.id ? { ...c, text: e.target.value } : c);
                updNode("checklist", updated);
              }}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  updNode("checklist", [...(panel.checklist || []), { id: uid(), text: "", done: false }]);
                }
                if (e.key === "Backspace" && item.text === "") {
                  e.preventDefault();
                  updNode("checklist", (panel.checklist || []).filter(c => c.id !== item.id));
                }
              }}
              placeholder="Item…"
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: item.done ? theme.textFaint : theme.textMuted, fontSize: 10, fontFamily: "'IBM Plex Mono',monospace", textDecoration: item.done ? "line-through" : "none" }}
            />
            <button
              onClick={() => updNode("checklist", (panel.checklist || []).filter(c => c.id !== item.id))}
              style={{ background: "none", border: "none", color: theme.textFaint, fontSize: 10, cursor: "pointer", padding: "0 2px" }}
            >✕</button>
          </div>
        ))}
        <button
          onClick={() => updNode("checklist", [...(panel.checklist || []), { id: uid(), text: "", done: false }])}
          style={{
            width: "100%", padding: "4px", border: `1px dashed ${theme.borderMid}`,
            borderRadius: 4, background: "transparent", color: theme.textFaint,
            fontSize: 9, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace",
          }}
        >+ Add item</button>
        {(panel.checklist || []).length > 0 && (
          <div style={{ fontSize: 9, color: theme.textFaint, marginTop: 6, textAlign: "right" }}>
            {(panel.checklist || []).filter(c => c.done).length}/{(panel.checklist || []).length} done
          </div>
        )}
      </div>
    )}

    {/* Steps mode */}
    {panel.subtaskMode === "steps" && (
      <div>
        {(panel.steps || []).map(step => (
          <div key={step.id} style={{ marginBottom: 8, padding: "7px 9px", background: theme.bg, borderRadius: 5, border: `1px solid ${theme.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
              <input
                value={step.title}
                onChange={e => {
                  const updated = (panel.steps || []).map(s => s.id === step.id ? { ...s, title: e.target.value } : s);
                  updNode("steps", updated);
                }}
                placeholder="Step title…"
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: theme.textMuted, fontSize: 10, fontFamily: "'IBM Plex Mono',monospace" }}
              />
              <button
                onClick={() => updNode("steps", (panel.steps || []).filter(s => s.id !== step.id))}
                style={{ background: "none", border: "none", color: theme.textFaint, fontSize: 10, cursor: "pointer" }}
              >✕</button>
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              {board?.features?.assignees && (board?.people || []).length > 0 && (
                <select
                  value={step.assigneeId || ""}
                  onChange={e => {
                    const updated = (panel.steps || []).map(s => s.id === step.id ? { ...s, assigneeId: e.target.value || null } : s);
                    updNode("steps", updated);
                  }}
                  style={{ flex: 1, background: theme.inputBg, border: `1px solid ${theme.borderMid}`, borderRadius: 4, padding: "3px 5px", color: theme.textFaint, fontSize: 9, fontFamily: "'IBM Plex Mono',monospace", outline: "none" }}
                >
                  <option value="">Unassigned</option>
                  {(board.people || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              )}
              <select
                value={step.status || "todo"}
                onChange={e => {
                  const updated = (panel.steps || []).map(s => s.id === step.id ? { ...s, status: e.target.value } : s);
                  updNode("steps", updated);
                }}
                style={{ background: theme.inputBg, border: `1px solid ${theme.borderMid}`, borderRadius: 4, padding: "3px 5px", color: theme.textFaint, fontSize: 9, fontFamily: "'IBM Plex Mono',monospace", outline: "none" }}
              >
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
        ))}
        <button
          onClick={() => updNode("steps", [...(panel.steps || []), { id: uid(), title: "", assigneeId: null, status: "todo" }])}
          style={{
            width: "100%", padding: "4px", border: `1px dashed ${theme.borderMid}`,
            borderRadius: 4, background: "transparent", color: theme.textFaint,
            fontSize: 9, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace",
          }}
        >+ Add step</button>
      </div>
    )}
  </F>
)}
```

**Step 3: Verify**

Enable Subtasks in settings. Open node panel — see Checklist/Steps tabs. Add checklist items, tick them off, progress count updates. Switch to Steps, add a step, assign a person, set status.

**Step 4: Commit**

```bash
git add src/components/NodePanel.jsx
git commit -m "feat: add subtasks section (checklist + steps) to NodePanel"
```

---

### Task 7: Canvas — node card visual enhancements

**Context:** Node cards on the canvas need to show: type icon (top-left), assignee avatars (bottom-left), checklist progress (bottom-right for task shape). The milestone shape needs diamond rendering; note and resource shapes need visual accents. This touches the node rendering logic in Canvas.jsx.

**Files:**
- Modify: `src/Canvas.jsx`

**Step 1: Find the node card rendering**

Search for where nodes are rendered — look for `NODE_W`, `NODE_H`, and `foreignObject` or `rect` in the SVG rendering section. It will be in the large return block.

**Step 2: Update the node rendering**

Find where each node `n` is rendered in the SVG map. The current node card renders as a `<foreignObject>` or as SVG shapes. Add these enhancements:

For each node, compute these values before rendering:

```jsx
{nodes.map(n => {
  const nt = (board.nodeTypes || []).find(t => t.id === n.nodeType) || { shape: "default", icon: "" };
  const assignedPeople = (board.people || []).filter(p => (n.assignees || []).includes(p.id));
  const checkDone = (n.checklist || []).filter(c => c.done).length;
  const checkTotal = (n.checklist || []).length;
  const isMilestone = nt.shape === "milestone";
  // ... existing rendering
})}
```

For the node card `<foreignObject>` content (the inner div), add at the top-left of the title area:

```jsx
{/* Type icon */}
{board?.features?.nodeTypes && nt.icon && (
  <span style={{ marginRight: 4, fontSize: 13 }}>{nt.icon}</span>
)}
```

For the note shape, add a CSS `clip-path` or border-radius tweak on the card div:
```jsx
style={{
  // ... existing styles
  ...(nt.shape === "note" ? { borderTopRightRadius: 0 } : {}),
}}
```

For the resource shape, add a left border accent:
```jsx
style={{
  // ... existing styles
  ...(nt.shape === "resource" ? { borderLeft: `3px solid #60a5fa` } : {}),
}}
```

Add a bottom row inside the card for assignees and checklist progress:

```jsx
{/* Bottom row: assignees + checklist progress */}
{(assignedPeople.length > 0 || checkTotal > 0) && board?.features && (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
    {/* Assignee avatars */}
    {board?.features?.assignees && assignedPeople.length > 0 && (
      <div style={{ display: "flex", gap: -3 }}>
        {assignedPeople.slice(0, 3).map(p => (
          <div key={p.id} style={{
            width: 14, height: 14, borderRadius: "50%", background: p.color,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 6, fontWeight: 700, color: "#fff",
            border: `1px solid ${theme.bg}`,
          }}>
            {p.initials}
          </div>
        ))}
        {assignedPeople.length > 3 && (
          <div style={{ fontSize: 7, color: theme.textFaint, marginLeft: 4 }}>+{assignedPeople.length - 3}</div>
        )}
      </div>
    )}
    {/* Checklist progress */}
    {board?.features?.subtasks && checkTotal > 0 && (
      <div style={{ fontSize: 7, color: checkDone === checkTotal ? "#22c55e" : theme.textFaint, marginLeft: "auto" }}>
        {checkDone}/{checkTotal} ✓
      </div>
    )}
  </div>
)}
```

For milestone shape, add a diamond SVG overlay or use a CSS transform on the card. The simplest approach — add a rotated border to create a diamond effect by rendering a special SVG `polygon` instead of the foreignObject for milestone nodes:

```jsx
{isMilestone ? (
  // Diamond shape for milestone
  <>
    <polygon
      points={`${n.x + NODE_W/2},${n.y} ${n.x + NODE_W},${n.y + NODE_H/2} ${n.x + NODE_W/2},${n.y + NODE_H} ${n.x},${n.y + NODE_H/2}`}
      fill={cmap[n.cat] ? cmap[n.cat].color + "18" : theme.bg}
      stroke={cc(n.cat)}
      strokeWidth={selected.has(n.id) ? 2 : 1}
      style={{ cursor: "pointer" }}
      onPointerDown={e => onNodeDown(e, n.id)}
    />
    <text
      x={n.x + NODE_W / 2} y={n.y + NODE_H / 2}
      textAnchor="middle" dominantBaseline="middle"
      style={{ fontSize: 9, fill: theme.text, fontFamily: "'IBM Plex Mono',monospace", pointerEvents: "none" }}
    >
      {nt.icon}{n.title.length > 18 ? n.title.slice(0, 18) + "…" : n.title}
    </text>
  </>
) : (
  // Regular foreignObject rendering for all other shapes
  <foreignObject ...>
    ...
  </foreignObject>
)}
```

**Step 3: Verify**

Add a person, assign them to a node. Small avatar should appear on the node card. Add checklist items to a node — `2/3 ✓` should appear. Set a node to Milestone type — it should render as a diamond on the canvas. Set Resource type — left blue border accent.

**Step 4: Commit**

```bash
git add src/Canvas.jsx
git commit -m "feat: add node card visuals (type icon, assignee avatars, checklist progress, shapes)"
```

---

### Task 8: Templates data and TemplateGallery modal

**Context:** Built-in templates are defined in a new `src/data/templates.js`. The new board creation flow shows a `TemplateGallery` modal instead of immediately creating a board. User picks a template (or Blank), a board is created from it.

**Files:**
- Create: `src/data/templates.js`
- Create: `src/components/TemplateGallery.jsx`
- Modify: `src/ai-roadmap.jsx`

**Step 1: Create src/data/templates.js**

```js
import { DEFAULT_CATS } from "./seeds.js";
import { DEFAULT_NODE_TYPES, DEFAULT_FEATURES } from "../constants.js";

// Helper to build a template board structure (no id/timestamps — added on creation)
function tmpl(name, description, nodes, edges = [], categories = null, nodeTypes = null) {
  return {
    name,
    description,
    previewNodes: nodes.length,
    nodes,
    edges,
    categories: categories || DEFAULT_CATS.map(c => ({ ...c })),
    groups: [],
    pan: { x: 40, y: 40 },
    zoom: 0.55,
    features: { ...DEFAULT_FEATURES },
    people: [],
    nodeTypes: (nodeTypes || DEFAULT_NODE_TYPES).map(t => ({ ...t })),
  };
}

export const BUILTIN_TEMPLATES = [
  tmpl("Blank", "Empty board — start from scratch.", []),

  tmpl("Project Plan", "Phases, tasks, and milestones for a project.", [
    { id: "pp1", x: 100, y: 100, cat: "foundations", rank: 1, status: "none", title: "Define scope", url: "", notes: "", nodeType: "task" },
    { id: "pp2", x: 350, y: 100, cat: "foundations", rank: 2, status: "none", title: "Design", url: "", notes: "", nodeType: "task" },
    { id: "pp3", x: 600, y: 100, cat: "foundations", rank: 3, status: "none", title: "Build", url: "", notes: "", nodeType: "task" },
    { id: "pp4", x: 850, y: 100, cat: "foundations", rank: 4, status: "none", title: "Launch", url: "", notes: "", nodeType: "milestone" },
    { id: "pp5", x: 100, y: 260, cat: "chatgpt",     rank: 2, status: "none", title: "Requirements doc", url: "", notes: "", nodeType: "note" },
    { id: "pp6", x: 350, y: 260, cat: "chatgpt",     rank: 2, status: "none", title: "Wireframes", url: "", notes: "", nodeType: "resource" },
  ], [
    { id: "pe1", from: "pp1", to: "pp2", label: "" },
    { id: "pe2", from: "pp2", to: "pp3", label: "" },
    { id: "pe3", from: "pp3", to: "pp4", label: "" },
    { id: "pe4", from: "pp1", to: "pp5", label: "" },
    { id: "pe5", from: "pp2", to: "pp6", label: "" },
  ]),

  tmpl("Sprint Board", "Two-week sprint with backlog, in-progress, and done columns.", [
    { id: "sb1", x: 100, y: 100, cat: "foundations", rank: 1, status: "todo",       title: "Backlog item 1", url: "", notes: "", nodeType: "task" },
    { id: "sb2", x: 100, y: 220, cat: "foundations", rank: 1, status: "todo",       title: "Backlog item 2", url: "", notes: "", nodeType: "task" },
    { id: "sb3", x: 380, y: 100, cat: "chatgpt",     rank: 1, status: "inprogress", title: "In progress 1",  url: "", notes: "", nodeType: "task" },
    { id: "sb4", x: 380, y: 220, cat: "chatgpt",     rank: 1, status: "inprogress", title: "In progress 2",  url: "", notes: "", nodeType: "task" },
    { id: "sb5", x: 660, y: 100, cat: "n8n",         rank: 1, status: "done",       title: "Done item 1",    url: "", notes: "", nodeType: "task" },
    { id: "sb6", x: 660, y: 220, cat: "n8n",         rank: 1, status: "done",       title: "Done item 2",    url: "", notes: "", nodeType: "task" },
  ]),

  tmpl("Learning Roadmap", "Sequential learning path with resources and milestones.", [
    { id: "lr1", x: 100, y: 200, cat: "foundations", rank: 1, status: "none", title: "Fundamentals",    url: "", notes: "", nodeType: "default" },
    { id: "lr2", x: 360, y: 200, cat: "chatgpt",     rank: 2, status: "none", title: "Core concepts",   url: "", notes: "", nodeType: "resource" },
    { id: "lr3", x: 620, y: 200, cat: "claude",      rank: 3, status: "none", title: "Practice project",url: "", notes: "", nodeType: "task" },
    { id: "lr4", x: 880, y: 200, cat: "advanced",    rank: 4, status: "none", title: "Mastery check",   url: "", notes: "", nodeType: "milestone" },
  ], [
    { id: "le1", from: "lr1", to: "lr2", label: "" },
    { id: "le2", from: "lr2", to: "lr3", label: "" },
    { id: "le3", from: "lr3", to: "lr4", label: "" },
  ]),

  tmpl("Content Calendar", "Plan content by type and status.", [
    { id: "cc1", x: 100, y: 100, cat: "productivity", rank: 1, status: "none",       title: "Blog post idea",   url: "", notes: "", nodeType: "note" },
    { id: "cc2", x: 100, y: 240, cat: "productivity", rank: 1, status: "none",       title: "Video script",     url: "", notes: "", nodeType: "note" },
    { id: "cc3", x: 380, y: 100, cat: "chatgpt",      rank: 2, status: "inprogress", title: "Draft blog post",  url: "", notes: "", nodeType: "task" },
    { id: "cc4", x: 380, y: 240, cat: "chatgpt",      rank: 2, status: "inprogress", title: "Film video",       url: "", notes: "", nodeType: "task" },
    { id: "cc5", x: 660, y: 170, cat: "n8n",          rank: 3, status: "none",       title: "Publish",          url: "", notes: "", nodeType: "milestone" },
  ], [
    { id: "ce1", from: "cc1", to: "cc3", label: "" },
    { id: "ce2", from: "cc2", to: "cc4", label: "" },
    { id: "ce3", from: "cc3", to: "cc5", label: "" },
    { id: "ce4", from: "cc4", to: "cc5", label: "" },
  ]),

  tmpl("Team Onboarding", "Steps to onboard a new team member.", [
    { id: "to1", x: 100, y: 100, cat: "foundations", rank: 1, status: "none", title: "Send welcome email",  url: "", notes: "", nodeType: "task" },
    { id: "to2", x: 100, y: 240, cat: "foundations", rank: 1, status: "none", title: "Set up accounts",     url: "", notes: "", nodeType: "task" },
    { id: "to3", x: 380, y: 100, cat: "chatgpt",     rank: 2, status: "none", title: "Intro to team",       url: "", notes: "", nodeType: "task" },
    { id: "to4", x: 380, y: 240, cat: "chatgpt",     rank: 2, status: "none", title: "Tools walkthrough",   url: "", notes: "", nodeType: "resource" },
    { id: "to5", x: 660, y: 170, cat: "advanced",    rank: 3, status: "none", title: "First contribution",  url: "", notes: "", nodeType: "milestone" },
  ], [
    { id: "toe1", from: "to1", to: "to3", label: "" },
    { id: "toe2", from: "to2", to: "to4", label: "" },
    { id: "toe3", from: "to3", to: "to5", label: "" },
    { id: "toe4", from: "to4", to: "to5", label: "" },
  ]),
];
```

**Step 2: Create src/components/TemplateGallery.jsx**

```jsx
import { useState } from "react";
import { useTheme } from "../ThemeContext.jsx";
import { BUILTIN_TEMPLATES } from "../data/templates.js";

const TEMPLATES_KEY = "roadmaps_templates";

export function loadUserTemplates() {
  try { return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || "[]"); } catch { return []; }
}

export function saveUserTemplate(board) {
  const templates = loadUserTemplates();
  const tmpl = { ...JSON.parse(JSON.stringify(board)), savedAt: Date.now() };
  delete tmpl.id; delete tmpl.createdAt; delete tmpl.updatedAt;
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify([...templates, tmpl]));
}

export function deleteUserTemplate(index) {
  const templates = loadUserTemplates();
  templates.splice(index, 1);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

export default function TemplateGallery({ onSelect, onCancel }) {
  const { theme } = useTheme();
  const [tab, setTab] = useState("builtin");
  const [name, setName] = useState("New Board");
  const [selected, setSelected] = useState(0);
  const userTemplates = loadUserTemplates();

  const current = tab === "builtin" ? BUILTIN_TEMPLATES : userTemplates;

  return (
    <div
      onClick={onCancel}
      style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: theme.bgSecondary, border: `1px solid ${theme.border}`, borderRadius: 12,
          width: 600, maxHeight: "80vh", display: "flex", flexDirection: "column",
          boxShadow: "0 16px 64px #0009", fontFamily: "'IBM Plex Mono',monospace",
        }}
      >
        {/* Header */}
        <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 12 }}>New Board</div>
          <div style={{ display: "flex", gap: 6 }}>
            {["builtin", "mine"].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setSelected(0); }}
                style={{
                  padding: "4px 12px", borderRadius: 5, border: "1px solid", cursor: "pointer", fontSize: 9,
                  borderColor: tab === t ? "#818cf8" : theme.borderMid,
                  background: tab === t ? "#818cf812" : "transparent",
                  color: tab === t ? "#818cf8" : theme.textFaint,
                  fontFamily: "'IBM Plex Mono',monospace",
                }}
              >
                {t === "builtin" ? "Built-in" : "My Templates"}
              </button>
            ))}
          </div>
        </div>

        {/* Template grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          {current.length === 0 ? (
            <div style={{ color: theme.textFaint, fontSize: 10, textAlign: "center", padding: 40 }}>
              No saved templates yet. Save a board as a template from Board Settings (⚙).
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {current.map((tmpl, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  style={{
                    padding: "12px", borderRadius: 8, border: "2px solid", cursor: "pointer", textAlign: "left",
                    borderColor: selected === i ? "#818cf8" : theme.borderMid,
                    background: selected === i ? "#818cf808" : theme.bg,
                    color: theme.text,
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700, color: theme.text, marginBottom: 4, fontFamily: "'IBM Plex Mono',monospace" }}>
                    {tmpl.name}
                  </div>
                  <div style={{ fontSize: 8, color: theme.textFaint, lineHeight: 1.5, fontFamily: "'IBM Plex Mono',monospace" }}>
                    {tmpl.description || `${tmpl.nodes?.length || 0} nodes`}
                  </div>
                  {tab === "mine" && (
                    <div style={{ fontSize: 7, color: theme.textFaint, marginTop: 6 }}>
                      {tmpl.nodes?.length || 0} nodes
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Board name"
            style={{
              flex: 1, background: theme.inputBg, border: `1px solid ${theme.borderMid}`,
              borderRadius: 5, padding: "6px 10px", color: theme.textMuted, fontSize: 10,
              fontFamily: "'IBM Plex Mono',monospace", outline: "none",
            }}
          />
          <button onClick={onCancel} style={{ padding: "6px 14px", borderRadius: 5, border: `1px solid ${theme.borderMid}`, background: "transparent", color: theme.textFaint, fontSize: 10, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace" }}>
            Cancel
          </button>
          <button
            onClick={() => current.length > 0 ? onSelect(current[selected], name) : onSelect(BUILTIN_TEMPLATES[0], name)}
            style={{ padding: "6px 14px", borderRadius: 5, border: "1px solid #818cf8", background: "#818cf812", color: "#818cf8", fontSize: 10, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace" }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Wire TemplateGallery into ai-roadmap.jsx**

Add imports:
```js
import TemplateGallery, { saveUserTemplate, loadUserTemplates } from "./components/TemplateGallery.jsx";
```

Add state near the other state:
```js
const [showTemplates, setShowTemplates] = useState(false);
```

Replace the `create` call in the `+ New Board` button with `setShowTemplates(true)`:
```jsx
// Find the "New Board" button in the JSX and change onClick:
onClick={() => setShowTemplates(true)}
```

Add the TemplateGallery modal render (at the bottom of the return, before closing `</div>`):
```jsx
{showTemplates && (
  <TemplateGallery
    onSelect={(tmpl, name) => {
      const { uid } = await import("./constants.js"); // already imported at top
      const b = {
        ...JSON.parse(JSON.stringify(tmpl)),
        id: uid(),
        name,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setBoards(p => [...p, b]);
      setActiveId(b.id);
      setShowTemplates(false);
    }}
    onCancel={() => setShowTemplates(false)}
  />
)}
```

Note: `uid` is already imported at the top of `ai-roadmap.jsx`. The onSelect handler should use it directly, not via dynamic import. The code above shows the pattern — just call `uid()` directly since it's already in scope.

**Step 4: Verify**

Click `+ New Board`. Template gallery modal should appear with Built-in tab showing 6 templates. Select one, give it a name, click Create. Board should open pre-populated with nodes.

**Step 5: Commit**

```bash
git add src/data/templates.js src/components/TemplateGallery.jsx src/ai-roadmap.jsx
git commit -m "feat: add template gallery with 6 built-in templates"
```

---

### Task 9: Save as Template in BoardSettings

**Context:** Add a "Save as Template" button to BoardSettings that saves the current board structure to `localStorage` under `roadmaps_templates`.

**Files:**
- Modify: `src/components/BoardSettings.jsx`

**Step 1: Add import and Save as Template button**

Add import at top of `BoardSettings.jsx`:
```js
import { saveUserTemplate } from "./TemplateGallery.jsx";
```

At the bottom of the scrollable settings body (after the node types section), add:

```jsx
{/* Save as Template */}
<div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: 14, marginTop: 4 }}>
  <div style={{ fontSize: 8, fontWeight: 700, color: theme.textFaint, letterSpacing: ".1em", marginBottom: 10 }}>TEMPLATES</div>
  <button
    onClick={() => {
      saveUserTemplate(board);
      alert(`"${board.name}" saved as template.`);
    }}
    style={{
      width: "100%", padding: "7px", border: `1px solid ${theme.borderMid}`,
      borderRadius: 5, background: "transparent", color: theme.textDim,
      fontSize: 9, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace",
    }}
  >
    Save Board as Template
  </button>
</div>
```

**Step 2: Verify**

Open Board Settings on a board with some nodes. Click "Save Board as Template". Open new board flow — "My Templates" tab should show the saved template.

**Step 3: Commit**

```bash
git add src/components/BoardSettings.jsx
git commit -m "feat: add Save as Template to BoardSettings"
```

---

### Task 10: Smoke test, version bump, and release

**Step 1: Full smoke test in dev server**

```bash
npm run dev
```

Test checklist:
- [ ] New board flow shows template gallery
- [ ] All 6 built-in templates create correctly
- [ ] Board Settings opens/closes via ⚙
- [ ] Feature toggles hide/show people, types, subtasks sections in NodePanel
- [ ] Add person → assign to node → avatar appears on canvas card
- [ ] Add custom node type with emoji → select in NodePanel → icon shows on card
- [ ] Milestone type → diamond shape on canvas
- [ ] Resource type → left blue border accent
- [ ] Checklist: add items, tick off, progress count updates
- [ ] Steps: add step, assign person, set status
- [ ] Save as template → appears in My Templates
- [ ] Old boards (from localStorage) load without errors, get default features/people/nodeTypes
- [ ] Reload page → all data persists

**Step 2: Fix any issues found**

```bash
git add -A && git commit -m "fix: smoke test fixes for power features"
```

**Step 3: Bump version to 1.2.0 and release**

In `package.json`, change `"version": "1.1.7"` to `"version": "1.2.0"`.

```bash
git add package.json && git commit -m "chore: bump to 1.2.0 for power features release"
GH_TOKEN=<your-token> npm run release
```

**Step 4: Push to roadmaps remote**

```bash
python3 -m git_filter_repo --path ai-roadmap/node_modules --path ai-roadmap/release --path ai-roadmap/dist --path node_modules --path release --path dist --invert-paths --force
git remote add roadmaps https://<your-token>@github.com/AM-Bear/roadmaps.git
git push --force roadmaps HEAD:main
```

**Step 5: Install**

```bash
rm -rf /Applications/Roadmaps.app
hdiutil attach /Users/ashermills/claude-code/ai-roadmap/release/Roadmaps-1.2.0-arm64.dmg -nobrowse -quiet
ditto "/Volumes/Roadmaps 1.2.0-arm64/Roadmaps.app" /Applications/Roadmaps.app
codesign --force --deep --sign - /Applications/Roadmaps.app
xattr -dr com.apple.quarantine /Applications/Roadmaps.app
hdiutil detach "/Volumes/Roadmaps 1.2.0-arm64" -quiet
```
