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
                type="button"
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
              No saved templates yet. Save a board as a template from Board Settings (&#x2699;).
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {current.map((tmpl, i) => (
                <button
                  key={i}
                  type="button"
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
          <button
            type="button"
            onClick={onCancel}
            style={{ padding: "6px 14px", borderRadius: 5, border: `1px solid ${theme.borderMid}`, background: "transparent", color: theme.textFaint, fontSize: 10, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace" }}
          >
            Cancel
          </button>
          <button
            type="button"
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
