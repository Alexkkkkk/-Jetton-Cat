import { useState } from "react";

interface Props { onLog: (msg: string) => void; totalLocked?: string; }

export function StakePanel({ onLog, totalLocked }: Props) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState<"stake" | "unstake" | null>(null);

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: "1px solid var(--border)", color: "var(--text)",
    padding: "10px 14px", borderRadius: 8, fontSize: 14,
    boxSizing: "border-box", transition: "border-color 0.2s",
  };

  const handleAction = async (action: "stake" | "unstake") => {
    const amt = amount.trim();
    if (!amt || isNaN(parseFloat(amt)) || parseFloat(amt) <= 0) { onLog("❌ Стейк: введите корректную сумму"); return; }
    if (action === "stake" && parseFloat(amt) < 0.5) { onLog("❌ Стейк: минимум 0.5 TON"); return; }

    setLoading(action);
    onLog(`${action === "stake" ? "🔒" : "🔓"} ${action === "stake" ? "Стейкинг" : "Вывод"} ${amt} TON...`);

    try {
      const r = await fetch(`/api/admin/${action}`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt }),
      });
      const data = await r.json();
      if (data.success) { onLog(`✅ ${data.message}`); setAmount(""); }
      else { onLog(`❌ Ошибка ${action}: ${data.error}`); }
    } catch (e: any) {
      onLog(`❌ ${action} не удался: ${e.message}`);
    } finally { setLoading(null); }
  };

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>💎</span>
          <h3 style={{ fontSize: 17, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1 }}>
            Стейкинг / Вывод
          </h3>
        </div>
        {totalLocked !== undefined && (
          <span style={{
            fontSize: 12, color: "var(--accent)", background: "rgba(0,212,255,0.08)",
            padding: "5px 12px", borderRadius: 20, border: "1px solid var(--border-bright)", fontWeight: 600,
          }}>
            Заблокировано: {parseFloat(totalLocked || "0").toFixed(3)} TON
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ color: "var(--muted)", fontSize: 11, display: "block", marginBottom: 7, letterSpacing: 1, textTransform: "uppercase" }}>
            Сумма (TON) — минимум 0.5 для стейка
          </label>
          <input type="number" placeholder="напр. 1.0" value={amount}
            min="0" step="0.1"
            onChange={e => setAmount(e.target.value)}
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = "var(--accent)")}
            onBlur={e => (e.target.style.borderColor = "var(--border)")}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button onClick={() => handleAction("stake")} disabled={loading !== null} style={{
            background: loading === "stake" ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, var(--green), #00cc66)",
            color: loading === "stake" ? "var(--muted)" : "#07070f",
            fontWeight: 700, padding: "12px", borderRadius: 10, fontSize: 14,
            border: "none", boxShadow: loading ? "none" : "0 0 18px rgba(0,255,136,0.3)",
          }}>
            {loading === "stake" ? "⏳ Стейкинг..." : "🔒 Стейкинг"}
          </button>
          <button onClick={() => handleAction("unstake")} disabled={loading !== null} style={{
            background: loading === "unstake" ? "rgba(255,255,255,0.06)" : "rgba(255,34,68,0.1)",
            color: loading === "unstake" ? "var(--muted)" : "var(--red)",
            fontWeight: 700, padding: "12px", borderRadius: 10, fontSize: 14,
            border: `1px solid ${loading === "unstake" ? "var(--border)" : "rgba(255,34,68,0.4)"}`,
          }}>
            {loading === "unstake" ? "⏳ Вывод..." : "🔓 Вывод"}
          </button>
        </div>

        <div style={{ fontSize: 11, color: "var(--muted)", background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 14px", lineHeight: 1.7, border: "1px solid var(--border)" }}>
          ⚠️ Вывод требует <strong style={{ color: "var(--yellow)" }}>Здоровья &gt; 60</strong>. Контракт не должен быть заморожен.
        </div>
      </div>
    </div>
  );
}
