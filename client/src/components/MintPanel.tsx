import { useState } from "react";

interface Props { onLog: (msg: string) => void; }

export function MintPanel({ onLog }: Props) {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("100000000000");
  const [loading, setLoading] = useState(false);
  const [lastTx, setLastTx] = useState<string | null>(null);

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: "1px solid var(--border)", color: "var(--text)",
    padding: "10px 14px", borderRadius: 8, fontSize: 14,
    boxSizing: "border-box", transition: "border-color 0.2s",
  };

  const handleMint = async () => {
    const dest = destination.trim();
    const amt = amount.trim();
    if (!dest) { onLog("❌ Чеканка: укажите адрес назначения"); return; }
    if (!amt || isNaN(parseFloat(amt)) || parseFloat(amt) <= 0) { onLog("❌ Чеканка: введите корректное количество"); return; }

    setLoading(true); setLastTx(null);
    onLog(`🪙 Чеканка ${amt} PLSH → ${dest.slice(0, 12)}...`);

    try {
      const r = await fetch("/api/admin/mint", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: dest, amount: amt }),
      });
      const data = await r.json();
      if (data.success) {
        onLog(`✅ Чеканка отправлена! Кошелёк: ${data.walletAddress?.slice(0, 16)}...`);
        setLastTx(data.walletAddress); setDestination(""); setAmount("");
      } else { onLog(`❌ Ошибка чеканки: ${data.error}`); }
    } catch (e: any) { onLog(`❌ Чеканка не удалась: ${e.message}`); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 18 }}>🪙</span>
        <h3 style={{ fontSize: 17, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1 }}>
          Чеканка PLSH Токенов
        </h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ color: "var(--muted)", fontSize: 11, display: "block", marginBottom: 7, letterSpacing: 1, textTransform: "uppercase" }}>
            Адрес Назначения
          </label>
          <input type="text" placeholder="EQ... или UQ..." value={destination}
            onChange={e => setDestination(e.target.value)}
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = "var(--accent)")}
            onBlur={e => (e.target.style.borderColor = "var(--border)")}
          />
        </div>

        <div>
          <label style={{ color: "var(--muted)", fontSize: 11, display: "block", marginBottom: 7, letterSpacing: 1, textTransform: "uppercase" }}>
            Количество (PLSH)
          </label>
          <input type="number" placeholder="напр. 1000" value={amount} min="0"
            onChange={e => setAmount(e.target.value)}
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = "var(--accent)")}
            onBlur={e => (e.target.style.borderColor = "var(--border)")}
          />
        </div>

        <button onClick={handleMint} disabled={loading} style={{
          background: loading ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, var(--green), #00cc66)",
          color: loading ? "var(--muted)" : "#07070f",
          fontWeight: 700, padding: "12px", borderRadius: 10, fontSize: 14,
          border: "none", boxShadow: loading ? "none" : "0 0 18px rgba(0,255,136,0.3)",
          letterSpacing: 0.5,
        }}>
          {loading ? "⏳ Отправка..." : "🪙 Начать Чеканку"}
        </button>

        {lastTx && (
          <a href={`https://tonscan.org/address/${lastTx}`} target="_blank" rel="noopener noreferrer" style={{
            display: "block", textAlign: "center", fontSize: 12,
            color: "var(--accent)", textDecoration: "none", padding: "8px",
            background: "rgba(0,212,255,0.06)", border: "1px solid var(--border-bright)", borderRadius: 8,
          }}>
            🔗 Посмотреть кошелёк на TONScan
          </a>
        )}
      </div>
    </div>
  );
}
