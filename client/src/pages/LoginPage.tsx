export function LoginPage() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "100vh", background: "var(--bg)", gap: 24
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🐱</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>NeuroJetton Admin</h1>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Plushie Cat (PLSH) — Smart Contract Dashboard</p>
      </div>
      <div style={{
        background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: 12, padding: "32px 40px", textAlign: "center", maxWidth: 360, width: "90%"
      }}>
        <p style={{ color: "var(--muted)", marginBottom: 24, fontSize: 13 }}>
          Sign in with your Replit account to access the admin panel.
        </p>
        <a href="/api/login" style={{
          display: "inline-block", background: "var(--accent)", color: "#0d1117",
          fontWeight: 600, padding: "10px 28px", borderRadius: 8, textDecoration: "none",
          fontSize: 15, transition: "opacity 0.2s"
        }}>
          Sign in with Replit
        </a>
      </div>
    </div>
  );
}
