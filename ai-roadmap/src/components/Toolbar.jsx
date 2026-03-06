import { makeTB } from "../constants.js";
import { useTheme } from '../ThemeContext.jsx';

export default function Toolbar({
  boardName, canvasMode, setMode, setConnecting,
  categories, onAddNode, groupMode, setGroupMode,
  search, setSearch,
  zoom, setZoom, setPan, fitScreen, onBack,
  searchRef,
}) {
  const { theme } = useTheme();
  const TB = makeTB(theme);

  return (
    <div style={{
      height: 46, background: theme.bgSecondary, borderBottom: `1px solid ${theme.border}`,
      display: "flex", alignItems: "center", padding: "0 12px",
      gap: 7, flexShrink: 0, zIndex: 10,
    }}>
      <button
        onClick={onBack}
        style={{
          padding: "3px 9px", borderRadius: 5, border: `1px solid ${theme.borderMid}`,
          background: "transparent", color: theme.textDim, fontSize: 10,
          display: "flex", alignItems: "center", gap: 4, cursor: "pointer",
        }}
      >
        ← Boards
      </button>

      <div style={{ width: 1, height: 18, background: theme.borderMid }} />

      <span style={{
        color: theme.textDim, fontSize: 11, fontWeight: 600,
        maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {boardName}
      </span>

      <div style={{ width: 1, height: 18, background: theme.borderMid }} />

      {[
        { id: "select",  icon: "↖", label: "Select"  },
        { id: "connect", icon: "→", label: "Connect" },
        { id: "delete",  icon: "✕", label: "Delete"  },
      ].map(m => (
        <button
          key={m.id}
          onClick={() => { setMode(m.id); setConnecting(null); }}
          style={{
            padding: "3px 10px", borderRadius: 5, border: "1px solid", cursor: "pointer",
            borderColor: canvasMode === m.id ? "#818cf8" : theme.borderMid,
            background: canvasMode === m.id ? "#818cf812" : "transparent",
            color: canvasMode === m.id ? "#818cf8" : theme.textDim,
            fontSize: 10,
          }}
        >
          {m.icon} {m.label}
        </button>
      ))}

      <div style={{ width: 1, height: 18, background: theme.borderMid }} />

      <button
        onClick={() => onAddNode()}
        style={{
          padding: "3px 10px", borderRadius: 5, border: "1px solid #22d3a530",
          background: "#22d3a510", color: "#22d3a5", fontSize: 10, cursor: "pointer",
        }}
      >
        + Node
      </button>

      <button
        onClick={() => setGroupMode(a => !a)}
        style={{
          padding: "3px 10px", borderRadius: 5, border: "1px solid", cursor: "pointer",
          borderColor: groupMode ? "#fbbf24" : theme.borderMid,
          background: groupMode ? "#fbbf2412" : "transparent",
          color: groupMode ? "#fbbf24" : theme.textDim,
          fontSize: 10,
        }}
      >
        ▭ Group
      </button>

      <div style={{ flex: 1 }} />

      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <span style={{ position: "absolute", left: 7, color: theme.textFaint, fontSize: 11, pointerEvents: "none" }}>⌕</span>
        <input
          ref={searchRef}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter…"
          style={{
            background: theme.inputBg, border: `1px solid ${theme.borderMid}`, borderRadius: 5,
            padding: "3px 24px 3px 22px", color: theme.textMuted, fontSize: 10, width: 130,
            fontFamily: "'IBM Plex Mono',monospace", outline: "none",
          }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            style={{ position: "absolute", right: 5, background: "none", border: "none", color: theme.textDim, fontSize: 11, cursor: "pointer" }}
          >
            ✕
          </button>
        )}
      </div>

      <button onClick={fitScreen} title="Fit all nodes" style={{ ...TB, cursor: "pointer" }}>⊞</button>
      <button onClick={() => setZoom(z => Math.min(3, z * 1.15))} style={{ ...TB, cursor: "pointer" }}>+</button>
      <span style={{ color: theme.textFaint, fontSize: 9, minWidth: 32, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
      <button onClick={() => setZoom(z => Math.max(0.12, z * 0.87))} style={{ ...TB, cursor: "pointer" }}>−</button>
      <button onClick={() => { setZoom(0.55); setPan({ x: 40, y: 40 }); }} title="Reset" style={{ ...TB, cursor: "pointer" }}>⌂</button>
    </div>
  );
}
