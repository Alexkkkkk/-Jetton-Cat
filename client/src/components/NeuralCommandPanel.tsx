import { useState } from "react";

interface NeuralCommandPanelProps {
  onSend: (cmd: { freeze: boolean; entropyAdj: number; biasAdj: number }) => void;
  onTelegramTest: () => void;
}

export function NeuralCommandPanel({ onSend, onTelegramTest }: NeuralCommandPanelProps) {
  const [freeze, setFreeze] = useState(false);
  const [entropyAdj, setEntropyAdj] = useState(0);
  const [biasAdj, setBiasAdj] = useState(0);

  const inputStyle = {
    width: "100%", background: "var(--bg)", border: "1px solid var(--border)",
    color: "var(--text)", padding: "8px 12px", borderRadius: 6, fontSize: 14,
    boxSizing: "border-box" as const,
  };

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
          <label style={{ color: "var(--muted)", fontSize: 12, display: "block", marginBottom: 6 }}>
            Entropy Adjustment (market_entropy_adj)
          </label>
          <input
            type="number"
            value={entropyAdj}
            onChange={e => setEntropyAdj(Number(e.target.value))}
            placeholder="e.g. -50 to calm, +50 to heat"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ color: "var(--muted)", fontSize: 12, display: "block", marginBottom: 6 }}>
            Bias Adjustment (ai_bias_adjustment)
          </label>
          <input
            type="number"
            value={biasAdj}
            onChange={e => setBiasAdj(Number(e.target.value))}
            placeholder="e.g. 0"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ color: "var(--muted)", fontSize: 12, display: "block", marginBottom: 6 }}>
            Emergency Freeze
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setFreeze(true)} style={btnStyle(freeze)}>🔴 ON</button>
            <button onClick={() => setFreeze(false)} style={btnStyle(!freeze)}>🟢 OFF</button>
          </div>
        </div>

        <div style={{
          fontSize: 11, color: "var(--muted)", background: "var(--bg)",
          borderRadius: 6, padding: "8px 12px", lineHeight: 1.6,
        }}>
          ⚠️ Freeze=ON halts staking. Set Freeze=OFF to unfreeze the contract.
        </div>

        <button
          onClick={() => onSend({ freeze, entropyAdj, biasAdj })}
          style={{
            background: freeze ? "var(--red)" : "var(--accent)",
            color: "#0d1117", fontWeight: 700,
            padding: "10px", borderRadius: 8, fontSize: 14, marginTop: 4,
            border: "none", cursor: "pointer",
          }}
        >
          {freeze ? "🔴 Send Freeze Command" : "Send Neural Command"}
        </button>

        <button onClick={onTelegramTest} style={{
          background: "transparent", border: "1px solid var(--border)",
          color: "var(--muted)", padding: "8px", borderRadius: 8, fontSize: 13,
          cursor: "pointer",
        }}>
          📨 Test Telegram Alert
        </button>
      </div>
    </div>
  );
}
