import { useState, useEffect } from "react";

interface AiAnalysis {
  status: "CRITICAL" | "WARNING" | "STABLE" | "OPTIMAL";
  statusEmoji: string;
  score: number;
  summary: string;
  insights: string[];
  recommendations: string[];
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  predictedApr: number;
  trend: "RISING" | "STABLE" | "FALLING";
  autonomyIndex: number;
  timestamp: number;
}

interface Props { onLog: (msg: string) => void; }

const STATUS_RU: Record<string, string> = { OPTIMAL: "ОПТИМАЛЬНО", STABLE: "СТАБИЛЬНО", WARNING: "ПРЕДУПРЕЖДЕНИЕ", CRITICAL: "КРИТИЧНО" };
const RISK_RU: Record<string, string> = { LOW: "НИЗКИЙ", MEDIUM: "СРЕДНИЙ", HIGH: "ВЫСОКИЙ" };
const TREND_RU: Record<string, string> = { RISING: "↑ РОСТ", STABLE: "→ СТАБИЛЬНО", FALLING: "↓ ПАДЕНИЕ" };

const statusColors: Record<string, string> = { OPTIMAL: "var(--green)", STABLE: "var(--accent)", WARNING: "var(--yellow)", CRITICAL: "var(--red)" };
const riskColors: Record<string, string> = { LOW: "var(--green)", MEDIUM: "var(--yellow)", HIGH: "var(--red)" };

export function AiInsightPanel({ onLog }: Props) {
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/ai-analysis", { credentials: "include" });
      const data = await r.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
        setLastFetched(new Date());
        onLog(`🧠 ИИ: ${STATUS_RU[data.analysis.status] || data.analysis.status} — ${data.analysis.summary.slice(0, 60)}…`);
      } else {
        onLog(`❌ Ошибка ИИ анализа: ${data.error}`);
      }
    } catch (e: any) {
      onLog(`❌ ИИ анализ недоступен: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
    const iv = setInterval(fetchAnalysis, 120000);
    return () => clearInterval(iv);
  }, []);

  const sc = analysis ? statusColors[analysis.status] : "var(--muted)";

  return (
    <div style={{
      background: "var(--card)", border: `1px solid ${sc}22`,
      borderRadius: 12, padding: 22,
      boxShadow: analysis ? `0 0 30px ${sc}12` : "none",
      transition: "all 0.4s",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🧠</span>
          <h3 style={{ fontSize: 17, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1 }}>
            ИИ Разведывательный Отчёт
          </h3>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {lastFetched && (
            <span style={{ color: "var(--muted)", fontSize: 11 }}>
              {lastFetched.toLocaleTimeString("ru-RU")}
            </span>
          )}
          <button onClick={fetchAnalysis} disabled={loading} style={{
            background: "rgba(0,212,255,0.08)", border: "1px solid var(--border-bright)",
            color: "var(--accent)", padding: "5px 12px", borderRadius: 8, fontSize: 12,
            cursor: loading ? "not-allowed" : "pointer", fontWeight: 600,
          }}>
            {loading ? "⏳" : "⟳ Анализ"}
          </button>
        </div>
      </div>

      {loading && !analysis ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 32, color: "var(--muted)", fontSize: 13 }}>
          <div style={{ width: 28, height: 28, border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          Нейросеть анализирует контракт...
        </div>
      ) : !analysis ? (
        <div style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: 32 }}>
          Нет данных — нажмите «Анализ»
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            {[
              { label: "СТАТУС", value: `${analysis.statusEmoji} ${STATUS_RU[analysis.status]}`, color: statusColors[analysis.status] },
              { label: "РИСК", value: RISK_RU[analysis.riskLevel], color: riskColors[analysis.riskLevel] },
              { label: "ТРЕНД APR", value: `${TREND_RU[analysis.trend]} ${analysis.predictedApr}%`, color: analysis.trend === "RISING" ? "var(--green)" : analysis.trend === "FALLING" ? "var(--red)" : "var(--muted)" },
              { label: "АВТОНОМИЯ", value: `${analysis.autonomyIndex}%`, color: "var(--purple)" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px 10px", textAlign: "center",
                border: `1px solid ${color}22`,
              }}>
                <div style={{ color: "var(--muted)", fontSize: 9, marginBottom: 6, letterSpacing: 1.5 }}>{label}</div>
                <div style={{ fontWeight: 700, fontSize: 12, color, fontFamily: "'Rajdhani', sans-serif", textShadow: `0 0 8px ${color}66` }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "14px 16px", border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--muted)", fontSize: 10, marginBottom: 7, letterSpacing: 1.5 }}>СВОДКА ИИ</div>
            <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.7 }}>{analysis.summary}</div>
          </div>

          {analysis.insights.length > 0 && (
            <div>
              <div style={{ color: "var(--muted)", fontSize: 10, marginBottom: 9, letterSpacing: 1.5 }}>ИНСАЙТЫ</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {analysis.insights.map((ins, i) => (
                  <div key={i} style={{
                    fontSize: 12, color: "var(--text)", padding: "7px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.04)", lineHeight: 1.6, display: "flex", gap: 8,
                  }}>
                    <span style={{ color: "var(--accent)", flexShrink: 0 }}>›</span>
                    <span>{ins}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.recommendations.length > 0 && (
            <div style={{
              background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.18)",
              borderRadius: 10, padding: "14px 16px",
            }}>
              <div style={{ color: "var(--accent)", fontSize: 10, fontWeight: 700, marginBottom: 9, letterSpacing: 1.5 }}>
                РЕКОМЕНДАЦИИ ИИ
              </div>
              {analysis.recommendations.map((rec, i) => (
                <div key={i} style={{ fontSize: 12, color: "var(--text)", display: "flex", gap: 8, lineHeight: 1.6, marginBottom: 5 }}>
                  <span style={{ color: "var(--accent)", fontWeight: 700 }}>{i + 1}.</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
