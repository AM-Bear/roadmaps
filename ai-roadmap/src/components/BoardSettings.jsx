import { useTheme } from "../ThemeContext.jsx";

const PERSON_COLORS = [
  "#22d3a5","#60a5fa","#a78bfa","#fbbf24","#fb923c",
  "#f472b6","#34d399","#38bdf8","#818cf8","#f87171",
];

function initials(name) {
  return name.trim().split(/\s+/).map(w => w[0]?.toUpperCase() || "").slice(0, 2).join("");
}

function Toggle({ label, value, onChange }) {
  const { theme } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
      <span style={{ color: theme.textMuted, fontSize: 10 }}>{label}</span>
      <button
        type="button"
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

        {/* People manager */}
        {features.assignees && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: theme.textFaint, letterSpacing: ".1em", marginBottom: 10 }}>PEOPLE</div>
            {(board.people || []).map((person) => (
              <div key={person.id} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", background: person.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 8, fontWeight: 700, color: "#fff", flexShrink: 0,
                }}>
                  {person.initials}
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
                  type="button"
                  onClick={() => onUpdateBoard(b => ({ ...b, people: b.people.filter(p => p.id !== person.id) }))}
                  style={{ background: "none", border: "none", color: theme.textFaint, fontSize: 11, cursor: "pointer", padding: "0 2px" }}
                >&#x2715;</button>
              </div>
            ))}
            <button
              type="button"
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
      </div>
    </div>
  );
}
