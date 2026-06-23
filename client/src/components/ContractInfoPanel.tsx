import { useState } from "react";

interface Props {
  masterAddress: string | null;
  network: string;
  config: any;
  tonscanUrl: string | null;
}

export function ContractInfoPanel({ masterAddress, network, config, tonscanUrl }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  };

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
        <span style={{ fontSize: 18 }}>📋</span>
        <h3 style={{ fontSize: 17, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1 }}>
          Информация о Контракте
        </h3>
        {tonscanUrl && (
          <a href={tonscanUrl} target="_blank" rel="noopener noreferrer" style={{
            marginLeft: "auto", fontSize: 12, color: "var(--accent)",
            background: "rgba(0,212,255,0.08)", border: "1px solid var(--border-bright)",
            padding: "4px 12px", borderRadius: 8, textDecoration: "none", fontWeight: 600,
          }}>
            🔗 TONScan
          </a>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
          <div style={{ color: "var(--muted)", fontSize: 10, marginBottom: 6, letterSpacing: 1.5 }}>АДРЕС МАСТЕР-КОНТРАКТА</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <code style={{ fontSize: 11, color: "var(--accent)", flex: 1, wordBreak: "break-all", fontFamily: "'JetBrains Mono', monospace" }}>
              {masterAddress || "Контракт не развёрнут"}
            </code>
            {masterAddress && (
              <button onClick={() => copy(masterAddress)} style={{
                background: copied ? "rgba(0,255,136,0.15)" : "rgba(0,212,255,0.08)",
                border: `1px solid ${copied ? "rgba(0,255,136,0.4)" : "var(--border-bright)"}`,
                color: copied ? "var(--green)" : "var(--accent)",
                padding: "4px 10px", borderRadius: 6, fontSize: 11, flexShrink: 0, fontWeight: 600,
              }}>
                {copied ? "✓" : "Копировать"}
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {[
            { label: "СЕТЬ", value: network?.toUpperCase() || "—", color: "var(--accent)" },
            { label: "ВЕРСИЯ", value: config?.project_info?.version || "—", color: "var(--text)" },
            { label: "СТАТУС", value: config?.deployed ? "✅ Активен" : "⏳ Ожидание", color: config?.deployed ? "var(--green)" : "var(--yellow)" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 12px", border: "1px solid var(--border)" }}>
              <div style={{ color: "var(--muted)", fontSize: 10, marginBottom: 4, letterSpacing: 1 }}>{label}</div>
              <div style={{ fontWeight: 700, fontSize: 13, color, fontFamily: "'Rajdhani', sans-serif" }}>{value}</div>
            </div>
          ))}
        </div>

        {config?.monitoring && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 12px", border: "1px solid var(--border)" }}>
              <div style={{ color: "var(--muted)", fontSize: 10, marginBottom: 4, letterSpacing: 1 }}>ИНТЕРВАЛ МОНИТОРА</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", fontFamily: "'Rajdhani', sans-serif" }}>
                {Math.floor(config.monitoring.check_interval_ms / 1000)}с
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 12px", border: "1px solid var(--border)" }}>
              <div style={{ color: "var(--muted)", fontSize: 10, marginBottom: 4, letterSpacing: 1 }}>АВТО-ЗАМОРОЗКА</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: config.monitoring.emergency_freeze_enabled ? "var(--green)" : "var(--muted)", fontFamily: "'Rajdhani', sans-serif" }}>
                {config.monitoring.emergency_freeze_enabled ? "Включена" : "Отключена"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
