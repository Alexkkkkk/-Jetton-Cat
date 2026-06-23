interface Props {
  masterAddress: string | null;
  network: string;
  config: any;
  tonscanUrl: string | null;
}

export function ContractInfoPanel({ masterAddress, network, config, tonscanUrl }: Props) {
  const copy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 18 }}>📋</span>
        <h3 style={{ fontSize: 15, fontWeight: 600 }}>Contract Info</h3>
        {tonscanUrl && (
          <a
            href={tonscanUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginLeft: "auto", fontSize: 12, color: "var(--accent)",
              background: "var(--bg)", border: "1px solid var(--border)",
              padding: "3px 10px", borderRadius: 6, textDecoration: "none",
            }}
          >
            🔗 TONScan
          </a>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ background: "var(--bg)", borderRadius: 8, padding: "10px 14px" }}>
          <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 4 }}>MASTER CONTRACT ADDRESS</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <code style={{ fontSize: 11, color: "var(--accent)", flex: 1, wordBreak: "break-all" }}>
              {masterAddress || "Not deployed yet"}
            </code>
            {masterAddress && (
              <button
                onClick={() => copy(masterAddress)}
                style={{
                  background: "transparent", border: "1px solid var(--border)",
                  color: "var(--muted)", padding: "2px 8px", borderRadius: 4, fontSize: 11,
                  cursor: "pointer", flexShrink: 0,
                }}
              >
                Copy
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          <div style={{ background: "var(--bg)", borderRadius: 8, padding: "8px 12px" }}>
            <div style={{ color: "var(--muted)", fontSize: 10, marginBottom: 2 }}>NETWORK</div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--accent)" }}>{network?.toUpperCase() || "—"}</div>
          </div>
          <div style={{ background: "var(--bg)", borderRadius: 8, padding: "8px 12px" }}>
            <div style={{ color: "var(--muted)", fontSize: 10, marginBottom: 2 }}>VERSION</div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{config?.project_info?.version || "—"}</div>
          </div>
          <div style={{ background: "var(--bg)", borderRadius: 8, padding: "8px 12px" }}>
            <div style={{ color: "var(--muted)", fontSize: 10, marginBottom: 2 }}>STATUS</div>
            <div style={{ fontWeight: 600, fontSize: 13, color: config?.deployed ? "var(--green)" : "var(--yellow)" }}>
              {config?.deployed ? "✅ Deployed" : "⏳ Pending"}
            </div>
          </div>
        </div>

        {config?.deployment?.metadata_url && (
          <div style={{ background: "var(--bg)", borderRadius: 8, padding: "8px 14px" }}>
            <div style={{ color: "var(--muted)", fontSize: 10, marginBottom: 3 }}>METADATA URL</div>
            <a href={config.deployment.metadata_url} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 11, color: "var(--accent)", textDecoration: "none", wordBreak: "break-all" }}>
              {config.deployment.metadata_url}
            </a>
          </div>
        )}

        {config?.monitoring && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ background: "var(--bg)", borderRadius: 8, padding: "8px 12px" }}>
              <div style={{ color: "var(--muted)", fontSize: 10, marginBottom: 2 }}>MONITOR INTERVAL</div>
              <div style={{ fontWeight: 600, fontSize: 12, color: "var(--text)" }}>
                {Math.floor(config.monitoring.check_interval_ms / 1000)}s
              </div>
            </div>
            <div style={{ background: "var(--bg)", borderRadius: 8, padding: "8px 12px" }}>
              <div style={{ color: "var(--muted)", fontSize: 10, marginBottom: 2 }}>AUTO-FREEZE</div>
              <div style={{ fontWeight: 600, fontSize: 12, color: config.monitoring.emergency_freeze_enabled ? "var(--green)" : "var(--muted)" }}>
                {config.monitoring.emergency_freeze_enabled ? "Enabled" : "Disabled"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
