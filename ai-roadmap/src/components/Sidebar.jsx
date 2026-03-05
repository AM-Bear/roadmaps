import { useState } from "react";
import { COLOR_PRESETS, STATUS, makeFI } from "../constants.js";
import { F, FL } from "./ui.jsx";
import { useTheme } from "../ThemeContext.jsx";

export default function Sidebar({ open, onToggle, categories, onUpdate }) {
  const { theme } = useTheme();
  const FI = makeFI(theme);
  const [tab, setTab] = useState("legend");
  const [editCat, setEditCat] = useState(null);

  const addCat = () => {
    const nc = { id: `cat_${Date.now()}`, label: "New Category", color: COLOR_PRESETS[categories.length % COLOR_PRESETS.length] };
    onUpdate(b => ({ ...b, categories: [...b.categories, nc] }));
    setEditCat({ ...nc });
  };

  const saveCat = () => {
    if (!editCat) return;
    onUpdate(b => ({ ...b, categories: b.categories.map(c => c.id === editCat.id ? { ...editCat } : c) }));
    setEditCat(null);
  };

  const delCat = id => {
    onUpdate(b => ({
      ...b,
      categories: b.categories.filter(c => c.id !== id),
      nodes: b.nodes.map(n => n.cat === id ? { ...n, cat: b.categories[0]?.id || "" } : n),
    }));
    if (editCat?.id === id) setEditCat(null);
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={onToggle}
        style={{
          position: "absolute", right: open ? 282 : 0, top: "50%", transform: "translateY(-50%)",
          width: 18, height: 54, background: theme.bgSecondary, border: `1px solid ${theme.border}`,
          borderRight: "none", borderRadius: "5px 0 0 5px", color: theme.textDim,
          fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", transition: "right .2s", zIndex: 20,
        }}
      >
        {open ? "›" : "‹"}
      </button>

      {/* Panel */}
      <div style={{
        width: 282, background: theme.bgSecondary, borderLeft: `1px solid ${theme.border}`,
        display: "flex", flexDirection: "column",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform .2s",
        position: "absolute", right: 0, top: 0, bottom: 0, zIndex: 15, overflow: "hidden",
      }}>
        <div style={{ display: "flex", borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
          {[{ id: "legend", l: "Legend" }, { id: "categories", l: "Categories" }].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: "9px 0", background: "transparent", border: "none", cursor: "pointer",
                borderBottom: tab === t.id ? "2px solid #818cf8" : "2px solid transparent",
                color: tab === t.id ? theme.textMuted : theme.textFaint,
                fontSize: 9, fontWeight: 700, letterSpacing: 1, fontFamily: "'IBM Plex Mono',monospace",
              }}
            >
              {t.l.toUpperCase()}
            </button>
          ))}
        </div>

        {tab === "legend" && (
          <div style={{ flex: 1, overflowY: "auto", padding: 13 }}>
            {categories.map(c => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                <div style={{ width: 9, height: 9, borderRadius: 2, background: c.color, flexShrink: 0 }} />
                <span style={{ color: theme.textMuted, fontSize: 10.5 }}>{c.label}</span>
              </div>
            ))}
            <div style={{ marginTop: 14, background: theme.bg, borderRadius: 7, padding: 11 }}>
              <div style={{ color: theme.borderMid, fontSize: 8, fontWeight: 700, letterSpacing: 1, marginBottom: 7 }}>CONTROLS</div>
              {[
                ["Hold Space", "Pan canvas"],
                ["Scroll", "Zoom"],
                ["Double-click node", "Edit"],
                ["Right-click", "Context menu"],
                ["Shift+click", "Multi-select"],
                ["Drag empty area", "Selection box"],
                ["Hover arrow", "✕ button appears"],
                ["Del key", "Remove selected"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ color: theme.textDim, fontSize: 9, fontWeight: 600 }}>{k}</span>
                  <span style={{ color: theme.textFaint, fontSize: 9 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 11, background: theme.bg, borderRadius: 7, padding: 11 }}>
              <div style={{ color: theme.borderMid, fontSize: 8, fontWeight: 700, letterSpacing: 1, marginBottom: 7 }}>STATUS</div>
              {Object.entries(STATUS).filter(([k]) => k !== "none").map(([k, v]) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: v.dot }} />
                  <span style={{ color: theme.textDim, fontSize: 9 }}>{v.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "categories" && (
          <div style={{ flex: 1, overflowY: "auto", padding: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 11 }}>
              <span style={{ color: theme.textFaint, fontSize: 8, fontWeight: 700, letterSpacing: 1 }}>CATEGORIES</span>
              <button
                onClick={addCat}
                style={{
                  padding: "3px 8px", borderRadius: 4, border: "1px solid #22d3a530",
                  background: "#22d3a510", color: "#22d3a5", fontSize: 9, cursor: "pointer",
                  fontFamily: "'IBM Plex Mono',monospace",
                }}
              >
                + New
              </button>
            </div>
            {categories.map(cat => {
              const isE = editCat?.id === cat.id;
              return (
                <div key={cat.id} style={{
                  marginBottom: 5, background: theme.bg, borderRadius: 6,
                  overflow: "hidden", border: `1px solid ${theme.border}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", padding: "7px 9px", gap: 7 }}>
                    <div style={{ width: 9, height: 9, borderRadius: 2, background: isE ? editCat.color : cat.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, color: theme.textMuted, fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {isE ? editCat.label : cat.label}
                    </span>
                    <button
                      onClick={() => isE ? setEditCat(null) : setEditCat({ ...cat })}
                      style={{ background: "none", border: "none", color: isE ? "#818cf8" : theme.textFaint, fontSize: 9, padding: "1px 3px", cursor: "pointer" }}
                    >
                      {isE ? "↑" : "✎"}
                    </button>
                    <button
                      onClick={() => delCat(cat.id)}
                      style={{ background: "none", border: "none", color: theme.textFaint, fontSize: 9, padding: "1px 3px", cursor: "pointer" }}
                    >
                      ✕
                    </button>
                  </div>
                  {isE && (
                    <div style={{ padding: "0 9px 10px", borderTop: `1px solid ${theme.border}` }}>
                      <div style={{ paddingTop: 8, marginBottom: 7 }}>
                        <FL>Name</FL>
                        <input value={editCat.label} onChange={e => setEditCat(p => ({ ...p, label: e.target.value }))} style={{ ...FI, width: "100%" }} />
                      </div>
                      <FL>Color</FL>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
                        {COLOR_PRESETS.map(c => (
                          <div
                            key={c}
                            onClick={() => setEditCat(p => ({ ...p, color: c }))}
                            style={{
                              width: 15, height: 15, borderRadius: 3, background: c, cursor: "pointer",
                              outline: editCat.color === c ? "2px solid #fff" : "none", outlineOffset: 1,
                            }}
                          />
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 5, marginBottom: 7 }}>
                        <input
                          type="color" value={editCat.color}
                          onChange={e => setEditCat(p => ({ ...p, color: e.target.value }))}
                          style={{ width: 27, height: 23, border: `1px solid ${theme.borderMid}`, borderRadius: 3, background: theme.bg, padding: 1, cursor: "pointer" }}
                        />
                        <input
                          value={editCat.color}
                          onChange={e => setEditCat(p => ({ ...p, color: e.target.value }))}
                          style={{ ...FI, flex: 1 }}
                          placeholder="#hex"
                        />
                      </div>
                      <button
                        onClick={saveCat}
                        style={{
                          width: "100%", padding: "6px", border: "none", borderRadius: 5,
                          background: "#818cf8", color: "#fff", fontWeight: 700, fontSize: 10, cursor: "pointer",
                          fontFamily: "'IBM Plex Mono',monospace",
                        }}
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
