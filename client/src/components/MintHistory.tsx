import { useEffect, useState } from "react";

interface MintRecord {
  id: string;
  destination: string;
  walletAddress: string;
  amount: string;
  initiatedBy: string | null;
  createdAt: string;
}

export function MintHistory() {
  const [records, setRecords] = useState<MintRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/mint-history", { credentials: "include" });
      if (r.ok) setRecords(await r.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const fmt = (iso: string) => new Date(iso).toLocaleString();
  const short = (addr: string) => `${addr.slice(0, 8)}…${addr.slice(-6)}`;

  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: 10, padding: 20,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600 }}>📜 Mint History</h3>
        <button onClick={load} style={{
          background: "transparent", border: "1px solid var(--border)",
          color: "var(--muted)", padding: "4px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer",
        }}>⟳ Refresh</button>
      </div>

      {loading ? (
        <div style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: 24 }}>Loading...</div>
      ) : records.length === 0 ? (
        <div style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: 24 }}>No mint transactions yet.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Time", "Amount (PLSH)", "Recipient", "Wallet", "By"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "6px 10px", color: "var(--muted)", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                  <td style={{ padding: "8px 10px", color: "var(--muted)", whiteSpace: "nowrap" }}>{fmt(r.createdAt)}</td>
                  <td style={{ padding: "8px 10px", color: "var(--green)", fontWeight: 600 }}>{parseFloat(r.amount).toLocaleString()}</td>
                  <td style={{ padding: "8px 10px" }}>
                    <a href={`https://tonscan.org/address/${r.destination}`} target="_blank" rel="noopener noreferrer"
                      style={{ color: "var(--accent)", textDecoration: "none" }}>{short(r.destination)}</a>
                  </td>
                  <td style={{ padding: "8px 10px" }}>
                    <a href={`https://tonscan.org/address/${r.walletAddress}`} target="_blank" rel="noopener noreferrer"
                      style={{ color: "var(--accent)", textDecoration: "none" }}>{short(r.walletAddress)}</a>
                  </td>
                  <td style={{ padding: "8px 10px", color: "var(--muted)" }}>{r.initiatedBy || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
