import { useState } from "react";

interface StakePanelProps {
  onLog: (msg: string) => void;
  totalLocked?: string;
}

export function StakePanel({ onLog, totalLocked }: StakePanelProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState<"stake" | "unstake" | null>(null);

  const inputStyle = {
    width: "100%", background: "var(--bg)", border: "1px solid var(--border)",
    color: "var(--text)", padding: "8px 12px", borderRadius: 6, fontSize: 14,
    boxSizing: "border-box" as const,
  };

  const handleAction = async (action: "stake" | "unstake") => {
    const amt = amount.trim();
    if (!amt || isNaN(parseFloat(amt)) || parseFloat(amt) <= 0) {
      onLog("❌ Stake: enter a valid amount"); return;
    }
    if (action === "stake" && parseFloat(amt) < 0.5) {
      onLog("❌ Stake: minimum is 0.5 TON"); return;
    }

    setLoading(action);
    onLog(`${action === "stake" ? "🔒" : "🔓"} ${action === "stake" ? "Staking" : "Unstaking"} ${amt} TON...`);

    try {
      const r = await fetch(`/api/admin/${action}`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt }),
      });
      const data = await r.json();
      if (data.success) {
        onLog(`✅ ${data.message}`);
        setAmount("");
      } else {
        onLog(`❌ ${action} error: ${data.error}`);
      }
    } catch (e: any) {
      onLog(`❌ ${action} failed: ${e.message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: 10, padding: 20,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600 }}>💎 Stake / Unstake</h3>
        {totalLocked !== undefined && (
          <span style={{
            fontSize: 12, color: "var(--accent)",
            background: "var(--bg)", padding: "3px 10px",
            borderRadius: 20, border: "1px solid var(--border)"
          }}>
            Locked: {parseFloat(totalLocked || "0").toFixed(3)} TON
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ color: "var(--muted)", fontSize: 12, display: "block", marginBottom: 6 }}>
            Amount (TON) — min 0.5 to stake
          </label>
          <input
            type="number"
            placeholder="e.g. 1.0"
            value={amount}
            min="0"
            step="0.1"
            onChange={e => setAmount(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button
            onClick={() => handleAction("stake")}
            disabled={loading !== null}
            style={{
              background: loading === "stake" ? "var(--border)" : "var(--green)",
              color: loading === "stake" ? "var(--muted)" : "#0d1117",
              fontWeight: 700, padding: "10px", borderRadius: 8,
              fontSize: 14, cursor: loading !== null ? "not-allowed" : "pointer",
              border: "none",
            }}
          >
            {loading === "stake" ? "⏳ Staking..." : "🔒 Stake"}
          </button>

          <button
            onClick={() => handleAction("unstake")}
            disabled={loading !== null}
            style={{
              background: loading === "unstake" ? "var(--border)" : "transparent",
              color: loading === "unstake" ? "var(--muted)" : "var(--red)",
              fontWeight: 700, padding: "10px", borderRadius: 8,
              fontSize: 14, cursor: loading !== null ? "not-allowed" : "pointer",
              border: `1px solid ${loading === "unstake" ? "var(--border)" : "var(--red)"}`,
            }}
          >
            {loading === "unstake" ? "⏳ Unstaking..." : "🔓 Unstake"}
          </button>
        </div>

        <div style={{
          fontSize: 11, color: "var(--muted)", background: "var(--bg)",
          borderRadius: 6, padding: "8px 12px", lineHeight: 1.6,
        }}>
          ⚠️ Unstake requires <strong>Health &gt; 60</strong>. Contract must not be frozen.
        </div>
      </div>
    </div>
  );
}
