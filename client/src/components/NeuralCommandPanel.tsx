import { useState } from "react";

interface NeuralCommandPanelProps {
  onSend: (cmd: any) => void;
  onTelegramTest: () => void;
}

export function NeuralCommandPanel({ onSend, onTelegramTest }: NeuralCommandPanelProps) {
  const [freeze, setFreeze] = useState(false);
  const [enableArbitrage, setEnableArbitrage] = useState(false);
  const [minMint, setMinMint] = useState("0.1");

  const btnStyle = (active: boolean) => ({
    padding: "6px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600,
    background: active ? "var(--accent)" : "var(--bg)",
    color: active ? "#0d1117" : "var(--muted)",
    border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
    cursor: "pointer",
  });

  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: 10, padding: 20
    }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>🧠 Neural Command</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ color: "var(--muted)", fontSize: 12, display: "block", marginBottom: 6 }}>Min Mint (TON)</label>
          <input
            type="number" value={minMint} onChange={e => setMinMint(e.target.value)}
            style={{
              width: "100%", background: "var(--bg)", border: "1px solid var(--border)",
              color: "var(--text)", padding: "8px 12px", borderRadius: 6, fontSize: 14
            }}
          />
        </div>

        <div>
          <label style={{ color: "var(--muted)", fontSize: 12, display: "block", marginBottom: 6 }}>Freeze Contract</label>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setFreeze(true)} style={btnStyle(freeze)}>ON</button>
            <button onClick={() => setFreeze(false)} style={btnStyle(!freeze)}>OFF</button>
          </div>
        </div>

        <div>
          <label style={{ color: "var(--muted)", fontSize: 12, display: "block", marginBottom: 6 }}>Enable Arbitrage</label>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setEnableArbitrage(true)} style={btnStyle(enableArbitrage)}>ON</button>
            <button onClick={() => setEnableArbitrage(false)} style={btnStyle(!enableArbitrage)}>OFF</button>
          </div>
        </div>

        <button onClick={() => onSend({ freeze, enableArbitrage, minMint })} style={{
          background: "var(--accent)", color: "#0d1117", fontWeight: 700,
          padding: "10px", borderRadius: 8, fontSize: 14, marginTop: 4
        }}>
          Send Neural Command
        </button>

        <button onClick={onTelegramTest} style={{
          background: "transparent", border: "1px solid var(--border)",
          color: "var(--muted)", padding: "8px", borderRadius: 8, fontSize: 13
        }}>
          📨 Test Telegram Alert
        </button>
      </div>
    </div>
  );
}
