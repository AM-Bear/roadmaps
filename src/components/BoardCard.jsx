import { useState } from "react";
import { NODE_W, NODE_H } from "../constants.js";
import { useTheme } from "../ThemeContext.jsx";

export default function BoardCard({ board, onOpen, onRename, onDuplicate, onExport, onDelete }) {
  const { theme } = useTheme();
  const [hovering, setHovering] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameVal, setRenameVal] = useState(board.name);

  const fmt = ts => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const commitRename = () => {
    onRename(renameVal);
    setRenaming(false);
  };

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={() => !renaming && onOpen()}
      style={{
        background: theme.bgTertiary,
        border: `1px solid ${hovering ? theme.borderLight : theme.borderMid}`,
        borderRadius: 11, overflow: "hidden", cursor: "pointer", position: "relative",
        transform: hovering ? "translateY(-2px)" : "none",
        transition: "transform .15s, border-color .15s",
      }}
    >
      {/* Preview thumbnail */}
      <div style={{ height: 130, background: theme.bg, position: "relative", overflow: "hidden" }}>
        <svg width="100%" height="100%" style={{ opacity: 0.45 }}>
          <pattern id={`dp${board.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#1a2535" />
          </pattern>
          <rect width="100%" height="100%" fill={`url(#dp${board.id})`} />
          {board.nodes.slice(0, 24).map(n => {
            const sc = 0.12;
            const cat = board.categories.find(c => c.id === n.cat);
            return (
              <rect
                key={n.id}
                x={8 + n.x * sc} y={8 + n.y * sc}
                width={20} height={9} rx={2}
                fill={cat?.color || theme.textDim} opacity={0.65}
              />
            );
          })}
        </svg>
      </div>

      {/* Info */}
      <div style={{ padding: "13px 15px 15px" }}>
        {renaming ? (
          <input
            autoFocus
            value={renameVal}
            onChange={e => setRenameVal(e.target.value)}
            onBlur={commitRename}
            onKeyDown={e => {
              if (e.key === "Enter") e.target.blur();
              if (e.key === "Escape") { setRenameVal(board.name); setRenaming(false); }
            }}
            onClick={e => e.stopPropagation()}
            style={{
              background: theme.borderMid, border: `1px solid ${theme.borderLight}`, borderRadius: 4,
              padding: "3px 7px", color: theme.text, fontSize: 13, fontWeight: 700, width: "100%",
              fontFamily: "'IBM Plex Mono',monospace", outline: "none",
            }}
          />
        ) : (
          <div style={{
            color: theme.text, fontSize: 13, fontWeight: 700, marginBottom: 3,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {board.name}
          </div>
        )}
        <div style={{ color: theme.textFaint, fontSize: 10, marginBottom: 11 }}>
          {board.nodes.length} nodes · {fmt(board.updatedAt)}
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {board.categories.slice(0, 5).map(c => (
            <div key={c.id} style={{
              display: "flex", alignItems: "center", gap: 4,
              background: theme.bg, padding: "2px 6px", borderRadius: 20,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: c.color }} />
              <span style={{ color: theme.textDim, fontSize: 9 }}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons — appear on hover */}
      <div
        style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 4, opacity: hovering ? 1 : 0, transition: "opacity .15s" }}
        onClick={e => e.stopPropagation()}
      >
        {[
          { i: "✎", t: "Rename",    f: () => { setRenaming(true); setRenameVal(board.name); } },
          { i: "⧉", t: "Duplicate", f: onDuplicate },
          { i: "↓", t: "Export",    f: onExport },
          { i: "✕", t: "Delete",    f: onDelete },
        ].map(a => (
          <button
            key={a.t}
            title={a.t}
            onClick={a.f}
            style={{
              width: 25, height: 25, borderRadius: 5, border: `1px solid ${theme.textFaint}`,
              background: theme.bgTertiary + "ee", color: theme.textMuted, fontSize: 10,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}
          >
            {a.i}
          </button>
        ))}
      </div>
    </div>
  );
}
