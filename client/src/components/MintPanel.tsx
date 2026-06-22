import { useState } from "react";

interface MintPanelProps {
  onLog: (msg: string) => void;
}

export function MintPanel({ onLog }: MintPanelProps) {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("100000000000");
  const [loading, setLoading] = useState(false);
  const [lastTx, setLastTx] = useState<string | null>(null);

  const inputStyle = {
    width: "100%", background: "var(--bg)", border: "1px solid var(--border)",
    color: "var(--text)", padding: "8px 12px", borderRadius: 6, fontSize: 14,
    boxSizing: "border-box" as const,
  };

  const handleMint = async () => {
    const dest = destination.trim();
    const amt = amount.trim();

    if (!dest) { onLog("❌ Mint: destination address is required"); return; }
    if (!amt || isNaN(parseFloat(amt)) || parseFloat(amt) <= 0) {
      onLog("❌ Mint: enter a valid amount"); return;
    }

    setLoading(true);
    setLastTx(null);
    onLog(`🪙 Minting ${amt} PLSH → ${dest.slice(0, 12)}...`);

    try {
      const r = await fetch("/api/admin/mint", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: dest, amount: amt }),
      });
      const data = await r.json();
      if (data.success) {
        onLog(`✅ Mint sent! Wallet: ${data.walletAddress?.slice(0, 16)}...`);
        setLastTx(data.walletAddress);
        setDestination("");
        setAmount("");
      } else {
        onLog(`❌ Mint error: ${data.error}`);
      }
    } catch (e: any) {
      onLog(`❌ Mint failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: 10, padding: 20,
    }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>🪙 Mint PLSH Tokens</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ color: "var(--muted)", fontSize: 12, display: "block", marginBottom: 6 }}>
            Destination Address
          </label>
          <input
            type="text"
            placeholder="EQ... or UQ..."
            value={destination}
            onChange={e => setDestination(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ color: "var(--muted)", fontSize: 12, display: "block", marginBottom: 6 }}>
            Amount (PLSH)
          </label>
          <input
            type="number"
            placeholder="e.g. 1000"
            value={amount}
            min="0"
            onChange={e => setAmount(e.target.value)}
            style={inputStyle}
          />
        </div>

        <button
          onClick={handleMint}
          disabled={loading}
          style={{
            background: loading ? "var(--border)" : "var(--green)",
            color: loading ? "var(--muted)" : "#0d1117",
            fontWeight: 700, padding: "10px", borderRadius: 8,
            fontSize: 14, marginTop: 4, cursor: loading ? "not-allowed" : "pointer",
            border: "none",
          }}
        >
          {loading ? "⏳ Sending..." : "🪙 Mint Tokens"}
        </button>

        {lastTx && (
          <a
            href={`https://tonscan.org/address/${lastTx}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block", textAlign: "center", fontSize: 12,
              color: "var(--accent)", textDecoration: "none",
            }}
          >
            🔗 View wallet on TONScan
          </a>
        )}
      </div>
    </div>
  );
}
