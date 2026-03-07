export const NODE_W = 210;
export const NODE_H = 76;

let _uid = 500;
export const uid = () => `id${++_uid}`;

export function initUidFrom(boards) {
  // Ensure uid counter stays above any numeric IDs already saved
  boards.forEach(b => {
    [...(b.nodes || []), ...(b.edges || []), ...(b.groups || [])].forEach(item => {
      const m = String(item.id).match(/^id(\d+)$/);
      if (m) _uid = Math.max(_uid, Number(m[1]));
    });
    _uid = Math.max(_uid, Number(String(b.id).match(/^id(\d+)$/)?.[1] || 0));
  });
}

export const COLOR_PRESETS = [
  "#22d3a5","#60a5fa","#a78bfa","#fbbf24","#fb923c",
  "#2dd4bf","#38bdf8","#818cf8","#f472b6","#34d399",
  "#f87171","#e879f9","#facc15","#4ade80","#fb7185",
];

export const STATUS = {
  none:       { label: "—",           dot: "#1e2a3a" },
  todo:       { label: "To Watch",    dot: "#64748b" },
  inprogress: { label: "In Progress", dot: "#0ea5e9" },
  done:       { label: "Done",        dot: "#22c55e" },
};

// Shared inline style tokens
export const makeFI = (theme) => ({
  padding: "6px 8px",
  border: `1px solid ${theme.borderMid}`,
  borderRadius: 5,
  fontSize: 10,
  color: theme.textMuted,
  background: theme.inputBg,
  fontFamily: "'IBM Plex Mono',monospace",
});

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
});

export const DEFAULT_NODE_TYPES = [
  { id: "default",   name: "Default",   icon: "",   shape: "default",   builtin: true },
  { id: "task",      name: "Task",      icon: "",   shape: "task",      builtin: true },
  { id: "milestone", name: "Milestone", icon: "",   shape: "milestone", builtin: true },
  { id: "note",      name: "Note",      icon: "",   shape: "note",      builtin: true },
  { id: "resource",  name: "Resource",  icon: "",   shape: "resource",  builtin: true },
];

export const DEFAULT_FEATURES = { assignees: true, nodeTypes: true, subtasks: true };
