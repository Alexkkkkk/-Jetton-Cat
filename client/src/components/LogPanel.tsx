interface LogPanelProps {
  logs: string[];
}

export function LogPanel({ logs }: LogPanelProps) {
  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: 10, padding: 20,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>📋</span>
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>Activity Log</h3>
        </div>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>{logs.length} entries</span>
      </div>
      <div style={{
        height: 240, overflowY: "auto",
        display: "flex", flexDirection: "column", gap: 1,
        background: "var(--bg)", borderRadius: 8, padding: "8px 10px",
      }}>
        {logs.length === 0 ? (
          <div style={{ color: "var(--muted)", fontSize: 12, textAlign: "center", marginTop: 40 }}>
            No activity yet
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={i} style={{
              fontSize: 11,
              color: log.includes("❌") ? "var(--red)"
                   : log.includes("✅") ? "var(--green)"
                   : log.includes("⚠️") ? "var(--yellow)"
                   : "var(--muted)",
              padding: "2px 0",
              fontFamily: "monospace",
              lineHeight: 1.5,
            }}>
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
