interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  sub?: string;
  glow?: boolean;
}

export function StatCard({ label, value, icon, color, sub, glow }: StatCardProps) {
  const glowColor = color.includes("green") ? "rgba(0,255,136,0.12)"
    : color.includes("red") ? "rgba(255,34,68,0.12)"
    : color.includes("purple") ? "rgba(155,95,255,0.12)"
    : color.includes("yellow") ? "rgba(255,215,0,0.12)"
    : "rgba(0,212,255,0.12)";

  return (
    <div style={{
      background: "var(--card)",
      border: `1px solid ${glow ? color + "44" : "var(--border)"}`,
      borderRadius: 12,
      padding: "18px 20px",
      position: "relative",
      overflow: "hidden",
      transition: "all 0.25s",
      boxShadow: glow ? `0 0 20px ${glowColor}` : "none",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = color + "55";
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${glowColor}`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = glow ? color + "44" : "var(--border)";
        (e.currentTarget as HTMLElement).style.boxShadow = glow ? `0 0 20px ${glowColor}` : "none";
      }}
    >
      <div style={{
        position: "absolute", top: 0, right: 0, width: 60, height: 60,
        background: `radial-gradient(circle at top right, ${color}18, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 17 }}>{icon}</span>
        <span style={{ color: "var(--muted)", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 500 }}>
          {label}
        </span>
      </div>
      <div style={{
        fontSize: 22, fontWeight: 700, color,
        fontFamily: "'Rajdhani', sans-serif", letterSpacing: 0.5,
        textShadow: glow ? `0 0 12px ${color}88` : "none",
      }}>
        {value}
      </div>
      {sub && <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 5 }}>{sub}</div>}
    </div>
  );
}
