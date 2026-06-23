export function LoginPage() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "100vh", background: "var(--bg)", gap: 32, padding: 20,
    }}>
      <div style={{ textAlign: "center", animation: "fadeIn 0.5s ease" }}>
        <div style={{ fontSize: 72, marginBottom: 16, animation: "float 3s ease-in-out infinite", display: "inline-block" }}>🐱</div>
        <h1 style={{
          fontSize: 42, fontWeight: 700, color: "var(--text)", marginBottom: 6,
          fontFamily: "'Rajdhani', sans-serif", letterSpacing: 2,
        }}>
          NEURO<span style={{ color: "var(--accent)", textShadow: "0 0 20px rgba(0,212,255,0.7)" }}>JETTON</span>
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 13, letterSpacing: 2, textTransform: "uppercase" }}>
          Plushie Cat (PLSH) · Нейронное Управление · TON
        </p>
      </div>

      <div style={{
        background: "var(--card)", border: "1px solid var(--border-bright)",
        borderRadius: 16, padding: "40px 48px", textAlign: "center", maxWidth: 420, width: "100%",
        boxShadow: "0 0 40px rgba(0,212,255,0.08), 0 0 80px rgba(0,212,255,0.04)",
        position: "relative", overflow: "hidden",
        animation: "fadeIn 0.5s ease 0.15s both",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg, transparent, var(--accent), var(--purple), transparent)",
        }} />

        <div style={{ marginBottom: 28 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.2)",
            borderRadius: 20, padding: "6px 14px", marginBottom: 20,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", display: "inline-block", animation: "glow-pulse 2s infinite" }} />
            <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 600, letterSpacing: 1 }}>МЕЙННЕТ АКТИВЕН</span>
          </div>
          <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.7 }}>
            Войдите через Replit для доступа<br />к панели нейронного управления
          </p>
        </div>

        <a href="/api/login" style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          background: "linear-gradient(135deg, var(--accent), #0099cc)",
          color: "#07070f", fontWeight: 700, padding: "14px 32px",
          borderRadius: 10, textDecoration: "none", fontSize: 15,
          boxShadow: "0 0 24px rgba(0,212,255,0.4)",
          transition: "all 0.2s", letterSpacing: 0.5,
        }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 40px rgba(0,212,255,0.7)")}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 24px rgba(0,212,255,0.4)")}
        >
          🔐 Войти через Replit
        </a>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 20 }}>
          {[["🧠","ИИ Анализ"],["⚡","Автономия"],["🔒","Безопасность"]].map(([icon, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ color: "var(--muted)", fontSize: 11, letterSpacing: 1, animation: "fadeIn 0.5s ease 0.3s both" }}>
        КОНТРАКТ: EQAGzgBowc6gDuj4CjqkqmhUS8RH06QEQjjJcAGw9pLX_IJE
      </div>
    </div>
  );
}
