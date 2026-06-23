import { useState } from "react";

interface Props {
  onSend: (cmd: { freeze: boolean; entropyAdj: number; biasAdj: number }) => void;
  onTelegramTest: () => void;
}

export function NeuralCommandPanel({ onSend, onTelegramTest }: Props) {
  const [freeze, setFreeze] = useState(false);
  const [entropyAdj, setEntropyAdj] = useState(0);
  const [biasAdj, setBiasAdj] = useState(0);

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: "1px solid var(--border)", color: "var(--text)",
    padding: "10px 14px", borderRadius: 8, fontSize: 14,
    boxSizing: "border-box", transition: "border-color 0.2s",
  };

  return (
    <div style={{ background: "var(--card)", border: `1px solid ${freeze ? "rgba(255,34,68,0.3)" : "var(--border)"}`, borderRadius: 12, padding: 22, transition: "all 0.3s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 18 }}>⚡</span>
        <h3 style={{ fontSize: 17, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1 }}>
          Нейронная Команда
        </h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ color: "var(--muted)", fontSize: 11, display: "block", marginBottom: 7, letterSpacing: 1, textTransform: "uppercase" }}>
            Коррекция Энтропии
          </label>
          <input type="number" value={entropyAdj}
            onChange={e => setEntropyAdj(Number(e.target.value))}
            placeholder="напр. -50 успокоить, +50 нагреть"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = "var(--accent)")}
            onBlur={e => (e.target.style.borderColor = "var(--border)")}
          />
        </div>

        <div>
          <label style={{ color: "var(--muted)", fontSize: 11, display: "block", marginBottom: 7, letterSpacing: 1, textTransform: "uppercase" }}>
            Корректировка Смещения ИИ
          </label>
          <input type="number" value={biasAdj}
            onChange={e => setBiasAdj(Number(e.target.value))}
            placeholder="напр. 0"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = "var(--accent)")}
            onBlur={e => (e.target.style.borderColor = "var(--border)")}
          />
        </div>

        <div>
          <label style={{ color: "var(--muted)", fontSize: 11, display: "block", marginBottom: 9, letterSpacing: 1, textTransform: "uppercase" }}>
            Экстренная Заморозка
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { val: true, label: "🔴 ВКЛЮЧИТЬ", active: freeze, dangerColor: "var(--red)" },
              { val: false, label: "🟢 ВЫКЛЮЧИТЬ", active: !freeze, dangerColor: "var(--green)" },
            ].map(({ val, label, active, dangerColor }) => (
              <button key={String(val)} onClick={() => setFreeze(val)} style={{
                flex: 1, padding: "9px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                background: active ? `${dangerColor}22` : "rgba(255,255,255,0.04)",
                color: active ? dangerColor : "var(--muted)",
                border: `1px solid ${active ? dangerColor + "55" : "var(--border)"}`,
                boxShadow: active ? `0 0 12px ${dangerColor}33` : "none",
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {freeze && (
          <div style={{ background: "rgba(255,34,68,0.08)", border: "1px solid rgba(255,34,68,0.25)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "var(--red)", lineHeight: 1.6 }}>
            ⚠️ Заморозка остановит стейкинг. Установите выключить для разморозки контракта.
          </div>
        )}

        <button onClick={() => onSend({ freeze, entropyAdj, biasAdj })} style={{
          background: freeze
            ? "linear-gradient(135deg, #ff2244, #cc0022)"
            : "linear-gradient(135deg, var(--accent), #0099cc)",
          color: "#07070f", fontWeight: 700,
          padding: "12px", borderRadius: 10, fontSize: 14,
          border: "none", boxShadow: freeze ? "0 0 20px rgba(255,34,68,0.4)" : "0 0 20px rgba(0,212,255,0.35)",
          letterSpacing: 0.5,
        }}>
          {freeze ? "🔴 Отправить Команду Заморозки" : "⚡ Отправить Нейронную Команду"}
        </button>

        <button onClick={onTelegramTest} style={{
          background: "rgba(0,212,255,0.05)", border: "1px solid var(--border)",
          color: "var(--muted)", padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 500,
        }}>
          📨 Тест Telegram Уведомления
        </button>
      </div>
    </div>
  );
}
