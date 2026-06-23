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

interface Props {
  onLog: (msg: string) => void;
}

const statusColors: Record<string, string> = {
  OPTIMAL: "var(--green)",
  STABLE: "var(--accent)",
  WARNING: "var(--yellow)",
  CRITICAL: "var(--red)",
};

const riskColors: Record<string, string> = {
  LOW: "var(--green)",
  MEDIUM: "var(--yellow)",
  HIGH: "var(--red)",
};

const trendSymbols: Record<string, string> = {
  RISING: "↑",
  STABLE: "→",
  FALLING: "↓",
};

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
        onLog(`🧠 AI: ${data.analysis.status} — ${data.analysis.summary.slice(0, 60)}…`);
      } else {
        onLog(`❌ AI analysis error: ${data.error}`);
      }
    } catch (e: any) {
      onLog(`❌ AI analysis failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
    const interval = setInterval(fetchAnalysis, 120000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>🧠</span>
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>AI Intelligence Report</h3>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {lastFetched && (
            <span style={{ color: "var(--muted)", fontSize: 11 }}>
              {lastFetched.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchAnalysis}
            disabled={loading}
            style={{
              background: "transparent", border: "1px solid var(--border)",
              color: "var(--muted)", padding: "4px 10px", borderRadius: 6, fontSize: 12,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "⏳" : "⟳ Analyze"}
          </button>
        </div>
      </div>

      {loading && !analysis ? (
        <div style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: 24 }}>
          Running AI analysis...
        </div>
      ) : !analysis ? (
        <div style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: 24 }}>
          No analysis yet — click Analyze
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            <div style={{ background: "var(--bg)", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ color: "var(--muted)", fontSize: 10, marginBottom: 4 }}>STATUS</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: statusColors[analysis.status] }}>
                {analysis.statusEmoji} {analysis.status}
              </div>
            </div>
            <div style={{ background: "var(--bg)", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ color: "var(--muted)", fontSize: 10, marginBottom: 4 }}>RISK</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: riskColors[analysis.riskLevel] }}>
                {analysis.riskLevel}
              </div>
            </div>
            <div style={{ background: "var(--bg)", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ color: "var(--muted)", fontSize: 10, marginBottom: 4 }}>APR TREND</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: analysis.trend === "RISING" ? "var(--green)" : analysis.trend === "FALLING" ? "var(--red)" : "var(--muted)" }}>
                {trendSymbols[analysis.trend]} {analysis.predictedApr}%
              </div>
            </div>
            <div style={{ background: "var(--bg)", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ color: "var(--muted)", fontSize: 10, marginBottom: 4 }}>AUTONOMY</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "var(--purple)" }}>
                {analysis.autonomyIndex}%
              </div>
            </div>
          </div>

          <div style={{ background: "var(--bg)", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 6 }}>AI SUMMARY</div>
            <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>{analysis.summary}</div>
          </div>

          {analysis.insights.length > 0 && (
            <div>
              <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 8 }}>INSIGHTS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {analysis.insights.map((ins, i) => (
                  <div key={i} style={{ fontSize: 12, color: "var(--text)", padding: "5px 0", borderBottom: "1px solid var(--border)", lineHeight: 1.5 }}>
                    {ins}
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.recommendations.length > 0 && (
            <div style={{ background: "rgba(88,166,255,0.06)", border: "1px solid rgba(88,166,255,0.2)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ color: "var(--accent)", fontSize: 11, fontWeight: 600, marginBottom: 8 }}>RECOMMENDATIONS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {analysis.recommendations.map((rec, i) => (
                  <div key={i} style={{ fontSize: 12, color: "var(--text)", display: "flex", gap: 6, lineHeight: 1.5 }}>
                    <span style={{ color: "var(--accent)" }}>›</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
