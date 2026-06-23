import { useEffect, useState } from "react";

interface AiEvent { id: string; eventType: string; description: string; data: string; createdAt: string; }

const eventColors: Record<string, string> = {
  EMERGENCY_FREEZE: "var(--red)", EMERGENCY_FREEZE_AUTO: "var(--red)", MONITOR_ERROR: "var(--red)",
  WARNING: "var(--yellow)", TG_FREEZE: "var(--red)", MONITOR_CYCLE: "var(--muted)",
  MONITOR_IDLE: "var(--muted)", AI_ANALYSIS_RUN: "var(--purple)", NEURAL_COMMAND: "var(--accent)",
  TG_STATUS_CHECK: "var(--muted)", TG_AI_ANALYSIS: "var(--purple)", TG_UNFREEZE: "var(--green)",
  TG_ENTROPY_ADJ: "var(--accent)", TG_TEST: "var(--muted)", MINT: "var(--green)",
  STAKE: "var(--green)", UNSTAKE: "var(--yellow)",
};

const eventIcons: Record<string, string> = {
  EMERGENCY_FREEZE: "🔴", EMERGENCY_FREEZE_AUTO: "🔴", MONITOR_ERROR: "❌",
  MONITOR_CYCLE: "🔄", MONITOR_IDLE: "⏸", AI_ANALYSIS_RUN: "🧠",
  NEURAL_COMMAND: "⚡", TG_STATUS_CHECK: "📊", TG_AI_ANALYSIS: "🧠",
  TG_FREEZE: "🔴", TG_UNFREEZE: "🟢", TG_ENTROPY_ADJ: "⚙️",
  TG_TEST: "📨", MINT: "🪙", STAKE: "🔒", UNSTAKE: "🔓",
};

const typeLabels: Record<string, string> = {
  EMERGENCY_FREEZE: "ЭКСТР. ЗАМОРОЗКА", EMERGENCY_FREEZE_AUTO: "АВТО-ЗАМОРОЗКА",
  MONITOR_ERROR: "ОШИБКА МОНИТОРА", MONITOR_CYCLE: "ЦИКЛ МОНИТОРА",
  MONITOR_IDLE: "МОНИТОР В ПОКОЕ", AI_ANALYSIS_RUN: "ИИ АНАЛИЗ",
  NEURAL_COMMAND: "НЕЙРО-КОМАНДА", TG_STATUS_CHECK: "ТГ: СТАТУС",
  TG_AI_ANALYSIS: "ТГ: ИИ АНАЛИЗ", TG_FREEZE: "ТГ: ЗАМОРОЗКА",
  TG_UNFREEZE: "ТГ: РАЗМОРОЗКА", TG_ENTROPY_ADJ: "ТГ: ЭНТРОПИЯ",
  TG_TEST: "ТГ: ТЕСТ", MINT: "ЧЕКАНКА", STAKE: "СТЕЙКИНГ", UNSTAKE: "ВЫВОД",
};

export function AiEventsLog() {
  const [events, setEvents] = useState<AiEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/ai-events", { credentials: "include" });
      if (r.ok) setEvents(await r.json());
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); const iv = setInterval(load, 30000); return () => clearInterval(iv); }, []);

  const fmt = (iso: string) => new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>📡</span>
          <h3 style={{ fontSize: 17, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1 }}>
            Поток ИИ Событий
          </h3>
          <span style={{
            fontSize: 10, color: "var(--accent)", background: "rgba(0,212,255,0.1)",
            border: "1px solid rgba(0,212,255,0.25)", borderRadius: 10, padding: "2px 8px", fontWeight: 600,
          }}>
            {events.length}
          </span>
        </div>
        <button onClick={load} style={{
          background: "rgba(0,212,255,0.08)", border: "1px solid var(--border-bright)",
          color: "var(--accent)", padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
        }}>
          ⟳ Обновить
        </button>
      </div>

      <div style={{ height: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
        {loading ? (
          <div style={{ color: "var(--muted)", fontSize: 12, textAlign: "center", padding: 32 }}>
            Загрузка событий...
          </div>
        ) : events.length === 0 ? (
          <div style={{ color: "var(--muted)", fontSize: 12, textAlign: "center", padding: 32 }}>
            Событий пока нет. Они появятся по мере работы монитора.
          </div>
        ) : events.map((ev) => {
          const color = eventColors[ev.eventType] || "var(--muted)";
          return (
            <div key={ev.id} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "8px 10px", borderRadius: 8, marginBottom: 1,
              background: "rgba(255,255,255,0.015)",
              border: "1px solid transparent",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.015)";
                (e.currentTarget as HTMLElement).style.borderColor = "transparent";
              }}
            >
              <span style={{ fontSize: 13, flexShrink: 0, marginTop: 2 }}>
                {eventIcons[ev.eventType] || "•"}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color, fontFamily: "'JetBrains Mono', monospace" }}>
                    {typeLabels[ev.eventType] || ev.eventType}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--muted)", flexShrink: 0, marginLeft: 8, fontFamily: "'JetBrains Mono', monospace" }}>
                    {fmt(ev.createdAt)}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", opacity: 0.8 }}>
                  {ev.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
