import { STATUS, COLOR_PRESETS, makeFI } from "../constants.js";
import { F } from "./ui.jsx";
import { useTheme } from "../ThemeContext.jsx";

export function AddNodeModal({ categories, newN, setNewN, onAdd, onClose }) {
  const { theme } = useTheme();
  const FI = makeFI(theme);
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.6)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: theme.bgSecondary, border: `1px solid ${theme.borderMid}`, borderRadius: 12,
        padding: 22, width: 400, boxShadow: "0 20px 60px rgba(0,0,0,.6)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ color: theme.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>ADD NODE</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: theme.textFaint, fontSize: 15, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <F label="Title *">
            <input
              value={newN.title}
              onChange={e => setNewN(p => ({ ...p, title: e.target.value }))}
              style={{ ...FI, width: "100%" }}
              placeholder="Video or resource title"
              autoFocus
            />
          </F>
          <div style={{ display: "flex", gap: 7 }}>
            <F label="Category" s={{ flex: 1 }}>
              <select value={newN.cat} onChange={e => setNewN(p => ({ ...p, cat: e.target.value }))} style={{ ...FI, width: "100%" }}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </F>
            <F label="Rank" s={{ width: 60 }}>
              <input
                type="number" min={1} max={10} value={newN.rank}
                onChange={e => setNewN(p => ({ ...p, rank: Number(e.target.value) }))}
                style={{ ...FI, width: "100%" }}
              />
            </F>
          </div>
          <F label="Status">
            <div style={{ display: "flex", gap: 5 }}>
              {Object.entries(STATUS).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setNewN(p => ({ ...p, status: k }))}
                  style={{
                    flex: 1, padding: "4px 0", borderRadius: 4, border: "1px solid", cursor: "pointer",
                    borderColor: newN.status === k ? v.dot : theme.borderMid,
                    background: newN.status === k ? v.dot + "1e" : "transparent",
                    color: newN.status === k ? v.dot : theme.textFaint,
                    fontSize: 8, fontFamily: "'IBM Plex Mono',monospace",
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </F>
          <F label="URL">
            <input
              value={newN.url}
              onChange={e => setNewN(p => ({ ...p, url: e.target.value }))}
              style={{ ...FI, width: "100%" }}
              placeholder="https://"
            />
          </F>
          <F label="Notes">
            <textarea
              value={newN.notes}
              onChange={e => setNewN(p => ({ ...p, notes: e.target.value }))}
              rows={3}
              style={{ ...FI, width: "100%", resize: "vertical" }}
            />
          </F>
          <div style={{ display: "flex", gap: 7, marginTop: 4 }}>
            <button
              onClick={onAdd}
              disabled={!newN.title.trim()}
              style={{
                flex: 1, padding: "9px", border: "none", borderRadius: 6,
                background: "#22d3a5", color: "#000", fontWeight: 700, fontSize: 11,
                opacity: newN.title.trim() ? 1 : 0.35, cursor: newN.title.trim() ? "pointer" : "not-allowed",
                fontFamily: "'IBM Plex Mono',monospace",
              }}
            >
              Add Node
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: "9px", border: `1px solid ${theme.borderMid}`, borderRadius: 6,
                background: "transparent", color: theme.textDim, fontSize: 11, cursor: "pointer",
                fontFamily: "'IBM Plex Mono',monospace",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EditGroupModal({ editGroup, setEditGroup, onSave }) {
  const { theme } = useTheme();
  const FI = makeFI(theme);
  if (!editGroup) return null;
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.55)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
      }}
      onClick={e => e.target === e.currentTarget && setEditGroup(null)}
    >
      <div style={{
        background: theme.bgSecondary, border: `1px solid ${theme.borderMid}`, borderRadius: 10,
        padding: 22, width: 290, boxShadow: "0 20px 60px rgba(0,0,0,.6)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
          <span style={{ color: theme.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>EDIT GROUP</span>
          <button onClick={() => setEditGroup(null)} style={{ background: "none", border: "none", color: theme.textFaint, fontSize: 13, cursor: "pointer" }}>✕</button>
        </div>
        <F label="Label">
          <input
            value={editGroup.label}
            onChange={e => setEditGroup(p => ({ ...p, label: e.target.value }))}
            style={{ ...FI, width: "100%" }}
            autoFocus
          />
        </F>
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: theme.textFaint, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 4 }}>Color</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 5 }}>
            {COLOR_PRESETS.map(c => (
              <div
                key={c}
                onClick={() => setEditGroup(p => ({ ...p, color: c }))}
                style={{
                  width: 18, height: 18, borderRadius: 3, background: c, cursor: "pointer",
                  outline: editGroup.color === c ? "2px solid #fff" : "none", outlineOffset: 1,
                }}
              />
            ))}
          </div>
        </div>
        <button
          onClick={onSave}
          style={{
            width: "100%", padding: "8px", border: "none", borderRadius: 6,
            background: "#818cf8", color: "#fff", fontWeight: 700, fontSize: 11, marginTop: 12, cursor: "pointer",
            fontFamily: "'IBM Plex Mono',monospace",
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
