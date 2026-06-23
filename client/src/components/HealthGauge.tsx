interface Props {
  health: number;
  isFrozen?: boolean;
}

export function HealthGauge({ health, isFrozen }: Props) {
  const pct = Math.min(100, Math.round(health / 10));
  const color = isFrozen ? "#00d4ff"
    : health >= 700 ? "#00ff88"
    : health >= 400 ? "#ffd700"
    : health >= 100 ? "#ff8c00"
    : "#ff2244";

  const label = isFrozen ? "ЗАМОРОЖЕН"
    : health >= 700 ? "ОПТИМАЛЬНО"
    : health >= 400 ? "СТАБИЛЬНО"
    : health >= 100 ? "ПРЕДУПРЕЖДЕНИЕ"
    : "КРИТИЧНО";

  const r = 48; const cx = 62; const cy = 62;
  const circumference = 2 * Math.PI * r;
  const arc = circumference * 0.75;
  const offset = arc - (arc * pct) / 100;
  const startAngle = 135;

  return (
    <div style={{
      background: "var(--card)", border: `1px solid ${color}33`,
      borderRadius: 12, padding: "20px 16px",
      display: "flex", flexDirection: "column", alignItems: "center",
      boxShadow: `0 0 24px ${color}18`,
      transition: "all 0.5s",
    }}>
      <div style={{ color: "var(--muted)", fontSize: 10, marginBottom: 10, letterSpacing: 1.5, textTransform: "uppercase" }}>
        🩺 Индекс Здоровья
      </div>
      <svg width={124} height={104} viewBox="0 0 124 104">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth={10}
          strokeDasharray={`${arc} ${circumference}`}
          strokeDashoffset={0}
          transform={`rotate(${startAngle}, ${cx}, ${cy})`}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth={10}
          strokeDasharray={`${arc} ${circumference}`}
          strokeDashoffset={offset}
          transform={`rotate(${startAngle}, ${cx}, ${cy})`}
          strokeLinecap="round"
          filter="url(#glow)"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1), stroke 0.5s ease" }}
        />
        <text x={cx} y={cy - 5} textAnchor="middle" fill={color} fontSize={20} fontWeight="bold"
          fontFamily="'Rajdhani', sans-serif" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
          {health}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="var(--muted)" fontSize={9} letterSpacing={0.5}>
          / 1000
        </text>
      </svg>
      <div style={{
        marginTop: 6, fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
        color, padding: "4px 12px", borderRadius: 20,
        background: `${color}18`, border: `1px solid ${color}44`,
        fontFamily: "'Rajdhani', sans-serif",
        boxShadow: `0 0 10px ${color}33`,
      }}>
        {label}
      </div>
    </div>
  );
}
