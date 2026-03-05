// Small reusable UI primitives shared across the app
import { useTheme } from '../ThemeContext.jsx'

export function F({ label, children, s }) {
  const { theme } = useTheme()
  return (
    <div style={s}>
      <div style={{ fontSize: 8, fontWeight: 700, color: theme.textFaint, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 4 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

export function FL({ children }) {
  const { theme } = useTheme()
  return (
    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textFaint, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 4 }}>
      {children}
    </div>
  );
}

export function GB({ primary, children, ...rest }) {
  const { theme } = useTheme()
  return (
    <button
      style={{
        padding: "7px 14px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
        border: primary ? "none" : `1px solid ${theme.borderMid}`,
        background: primary ? "#22d3a5" : "transparent",
        color: primary ? "#080c12" : theme.textDim,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

export function CMI({ icon, label, danger, onClick }) {
  const { theme } = useTheme()
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", padding: "6px 11px", background: "transparent", border: "none",
        borderRadius: 4, color: danger ? "#ef4444" : theme.textMuted, fontSize: 10,
        textAlign: "left", display: "flex", gap: 9, alignItems: "center", cursor: "pointer",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = theme.borderMid)}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      <span style={{ width: 13 }}>{icon}</span>
      {label}
    </button>
  );
}
