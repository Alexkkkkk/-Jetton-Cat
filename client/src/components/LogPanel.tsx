interface LogPanelProps {
  logs: string[];
}

export function LogPanel({ logs }: LogPanelProps) {
  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: 10, padding: 20
    }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>📋 Activity Log</h3>
      <div style={{
        height: 280, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4
      }}>
        {logs.length === 0 && (
          <div style={{ color: "var(--muted)", fontSize: 12, textAlign: "center", marginTop: 40 }}>
            No activity yet
          </div>
        )}
        {logs.map((log, i) => (
          <div key={i} style={{
            fontSize: 12, color: log.includes("❌") ? "var(--red)" : log.includes("✅") ? "var(--green)" : "var(--muted)",
            padding: "3px 0", borderBottom: "1px solid var(--border)", fontFamily: "monospace"
          }}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
