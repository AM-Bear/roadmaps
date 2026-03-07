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
        <button onClick={onClose} style={{ background: "none", border: "none", color: theme.textFaint, fontSize: 13, padding: 2, cursor: "pointer" }}>&#x2715;</button>
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
