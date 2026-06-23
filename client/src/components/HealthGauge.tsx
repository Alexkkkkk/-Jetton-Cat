interface Props {
  health: number;
  isFrozen?: boolean;
}

export function HealthGauge({ health, isFrozen }: Props) {
  const pct = Math.min(100, Math.round(health / 10));
  const color = isFrozen ? "#58a6ff" : health >= 700 ? "#3fb950" : health >= 400 ? "#d29922" : health >= 100 ? "#f0883e" : "#f85149";
  const label = isFrozen ? "FROZEN" : health >= 700 ? "OPTIMAL" : health >= 400 ? "STABLE" : health >= 100 ? "WARNING" : "CRITICAL";

  const r = 48;
  const cx = 60;
  const cy = 60;
  const circumference = 2 * Math.PI * r;
  const arc = circumference * 0.75;
  const offset = arc - (arc * pct) / 100;
  const startAngle = 135;

  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: 10, padding: 20, display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 10 }}>🩺 Health Score</div>
      <svg width={120} height={100} viewBox="0 0 120 100">
        <circle
          cx={cx} cy={cy} r={r}
          fill="none" stroke="var(--border)" strokeWidth={10}
          strokeDasharray={`${arc} ${circumference}`}
          strokeDashoffset={0}
          transform={`rotate(${startAngle}, ${cx}, ${cy})`}
          strokeLinecap="round"
        />
        <circle
          cx={cx} cy={cy} r={r}
          fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={`${arc} ${circumference}`}
          strokeDashoffset={offset}
          transform={`rotate(${startAngle}, ${cx}, ${cy})`}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.5s ease" }}
        />
        <text x={cx} y={cy - 4} textAnchor="middle" fill={color} fontSize={18} fontWeight="bold">
          {health}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="var(--muted)" fontSize={9}>
          / 1000
        </text>
      </svg>
      <div style={{
        marginTop: 4, fontSize: 11, fontWeight: 700, letterSpacing: "1px",
        color, padding: "2px 10px", borderRadius: 12,
        background: `${color}18`, border: `1px solid ${color}44`,
      }}>
        {label}
      </div>
    </div>
  );
}
