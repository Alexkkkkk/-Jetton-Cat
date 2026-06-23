import { useEffect, useState, useCallback } from "react";
import { StatCard } from "../components/StatCard";
import { NeuralCommandPanel } from "../components/NeuralCommandPanel";
import { MintPanel } from "../components/MintPanel";
import { StakePanel } from "../components/StakePanel";
import { MintHistory } from "../components/MintHistory";
import { LogPanel } from "../components/LogPanel";
import { NeuralProfilePanel } from "../components/NeuralProfilePanel";
import { AiInsightPanel } from "../components/AiInsightPanel";
import { AiEventsLog } from "../components/AiEventsLog";
import { HealthGauge } from "../components/HealthGauge";
import { ContractInfoPanel } from "../components/ContractInfoPanel";

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

type Tab = "overview" | "neural" | "ai" | "control" | "history";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "neural", label: "Neural Brain", icon: "🧬" },
  { id: "ai", label: "AI Analysis", icon: "🧠" },
  { id: "control", label: "Control", icon: "⚙️" },
  { id: "history", label: "History", icon: "📜" },
];

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [neural, setNeural] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [neuralLoading, setNeuralLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const addLog = (msg: string) => {
    const ts = new Date().toLocaleTimeString();
    setLogs(prev => [`[${ts}] ${msg}`, ...prev].slice(0, 100));
  };

  const fetchStats = useCallback(async () => {
    setRefreshing(true);
    try {
      const r = await fetch("/api/admin/stats", { credentials: "include" });
      const data = await r.json();
      setStats(data);
      addLog("📊 Stats refreshed");
    } catch (e: any) {
      addLog(`❌ Failed to fetch stats: ${e.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchNeural = useCallback(async () => {
    setNeuralLoading(true);
    try {
      const r = await fetch("/api/admin/neural-profile", { credentials: "include" });
      if (r.ok) {
        const data = await r.json();
        setNeural(data);
        addLog(`🧬 Neural profile: ${data.evolution_cycles} cycles, threat ${data.threat_level}`);
      }
    } catch (e: any) {
      addLog(`⚠️ Neural profile unavailable: ${e.message}`);
    } finally {
      setNeuralLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchNeural();
    const statsInterval = setInterval(fetchStats, 60000);
    const neuralInterval = setInterval(fetchNeural, 90000);
    return () => {
      clearInterval(statsInterval);
      clearInterval(neuralInterval);
    };
  }, [fetchStats, fetchNeural]);

  const handleNeuralCmd = async (cmd: { freeze: boolean; entropyAdj: number; biasAdj: number }) => {
    addLog(`🧠 Sending neural command: freeze=${cmd.freeze}, entropy=${cmd.entropyAdj}, bias=${cmd.biasAdj}…`);
    try {
      const r = await fetch("/api/admin/neural-command", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cmd),
      });
      const data = await r.json();
      if (data.success) {
        addLog(`✅ ${data.message}`);
        setTimeout(() => { fetchStats(); fetchNeural(); }, 3000);
      } else {
        addLog(`❌ Error: ${data.error}`);
      }
    } catch (e: any) {
      addLog(`❌ ${e.message}`);
    }
  };

  const handleTelegramTest = async () => {
    addLog("📨 Sending Telegram test message…");
    try {
      const r = await fetch("/api/admin/telegram-test", { method: "POST", credentials: "include" });
      const data = await r.json();
      if (data.success) addLog("✅ Telegram message sent!");
      else addLog(`❌ Telegram error: ${data.error}`);
    } catch (e: any) {
      addLog(`❌ ${e.message}`);
    }
  };

  const cs = stats?.contractStats || {};
  const isActive = !cs.error;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{
        background: "var(--card)", borderBottom: "1px solid var(--border)",
        padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 56, position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>🐱</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>NeuroJetton Admin</div>
            <div style={{ color: "var(--muted)", fontSize: 11 }}>Plushie Cat (PLSH) · Neural Governance</div>
          </div>
          {isActive && (
            <div style={{
              marginLeft: 12, display: "flex", alignItems: "center", gap: 6,
              background: "rgba(63,185,80,0.1)", border: "1px solid rgba(63,185,80,0.3)",
              borderRadius: 20, padding: "3px 10px",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block", animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 600 }}>LIVE</span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={fetchStats} disabled={refreshing} style={{
            background: "transparent", border: "1px solid var(--border)",
            color: "var(--muted)", padding: "5px 12px", borderRadius: 6, fontSize: 12,
          }}>
            {refreshing ? "⟳ …" : "⟳ Refresh"}
          </button>
          <span style={{ color: "var(--muted)", fontSize: 12 }}>
            {user?.firstName || user?.email || "Admin"}
          </span>
          <button onClick={onLogout} style={{
            background: "transparent", border: "1px solid var(--border)",
            color: "var(--muted)", padding: "5px 12px", borderRadius: 6, fontSize: 12,
          }}>
            Logout
          </button>
        </div>
      </header>

      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--card)", padding: "0 24px" }}>
        <div style={{ display: "flex", gap: 2 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: activeTab === tab.id ? "2px solid var(--accent)" : "2px solid transparent",
                color: activeTab === tab.id ? "var(--text)" : "var(--muted)",
                padding: "12px 16px",
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 600 : 400,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "color 0.15s",
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main style={{ padding: "24px", maxWidth: 1280, margin: "0 auto" }}>

        {loading && (
          <div style={{ color: "var(--muted)", padding: 48, textAlign: "center", fontSize: 14 }}>
            Loading contract data…
          </div>
        )}

        {!loading && activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
              <StatCard label="Network" value={stats?.network?.toUpperCase() || "—"} icon="🌐" color="var(--accent)" />
              <StatCard label="Balance" value={stats?.balance ? `${parseFloat(stats.balance).toFixed(3)} TON` : "—"} icon="💎" color="var(--green)" />
              {isActive && <StatCard label="APR" value={cs.apr !== undefined ? `${cs.apr}%` : "—"} icon="📈" color="var(--purple)" />}
              {isActive && <StatCard label="Locked" value={cs.total_locked ? `${parseFloat(cs.total_locked).toFixed(2)} TON` : "—"} icon="🔒" color="var(--accent)" />}
              {isActive && <StatCard label="Synapse Depth" value={cs.synapse_depth ?? "—"} icon="⚡" color="var(--yellow)" />}
              {isActive && <StatCard label="Liquidity Ratio" value={cs.liquidity_ratio ?? "—"} icon="💧" color="var(--green)" />}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 14, alignItems: "start" }}>
              {isActive ? (
                <HealthGauge health={cs.health ?? 0} />
              ) : (
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 20, textAlign: "center" }}>
                  <div style={{ color: "var(--yellow)", fontSize: 24, marginBottom: 8 }}>⏳</div>
                  <div style={{ color: "var(--muted)", fontSize: 12 }}>Contract not yet active</div>
                </div>
              )}
              <ContractInfoPanel
                masterAddress={stats?.masterAddress || null}
                network={stats?.network || "mainnet"}
                config={stats?.config}
                tonscanUrl={stats?.tonscanUrl || null}
              />
            </div>

            <AiInsightPanel onLog={addLog} />
            <LogPanel logs={logs} />
          </div>
        )}

        {!loading && activeTab === "neural" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignItems: "start" }}>
              <NeuralProfilePanel neural={neural} loading={neuralLoading} />
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {isActive && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 18px" }}>
                      <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 6 }}>HEALTH SCORE</div>
                      <div style={{ fontSize: 32, fontWeight: 800, color: cs.health >= 700 ? "var(--green)" : cs.health >= 400 ? "var(--yellow)" : "var(--red)" }}>
                        {cs.health ?? "—"}
                      </div>
                      <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 2 }}>/ 1000</div>
                    </div>
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 18px" }}>
                      <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 6 }}>CURRENT APR</div>
                      <div style={{ fontSize: 32, fontWeight: 800, color: "var(--purple)" }}>
                        {cs.apr !== undefined ? `${cs.apr}%` : "—"}
                      </div>
                      <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 2 }}>Annual</div>
                    </div>
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 18px" }}>
                      <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 6 }}>TOTAL LOCKED</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)" }}>
                        {cs.total_locked ? `${parseFloat(cs.total_locked).toFixed(3)} TON` : "—"}
                      </div>
                    </div>
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 18px" }}>
                      <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 6 }}>EVO CYCLES</div>
                      <div style={{ fontSize: 32, fontWeight: 800, color: "var(--accent)" }}>
                        {neural?.evolution_cycles ?? "—"}
                      </div>
                    </div>
                  </div>
                )}
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 18 }}>
                  <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 10 }}>HOW THE NEURAL ENGINE WORKS</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      ["evolve()", "Called on every transaction — updates APR, risk score, and memory bank"],
                      ["memory_bank", "Accumulates market pressure signals (0–100 scale)"],
                      ["threat_level", "Rises with high entropy, falls when markets stabilize"],
                      ["policy_weight", "Intelligence multiplier — influences APR calculation"],
                      ["mutation_seed", "Cryptographic evolution seed — ensures unpredictability"],
                      ["history_hash", "Rolling hash of past states — organism's memory fingerprint"],
                    ].map(([term, desc]) => (
                      <div key={term} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <code style={{ background: "var(--bg)", padding: "2px 8px", borderRadius: 4, fontSize: 11, color: "var(--accent)", flexShrink: 0 }}>
                          {term}
                        </code>
                        <span style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.4 }}>{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <AiEventsLog />
          </div>
        )}

        {!loading && activeTab === "ai" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <AiInsightPanel onLog={addLog} />
            <AiEventsLog />
          </div>
        )}

        {!loading && activeTab === "control" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: "rgba(248,81,73,0.06)", border: "1px solid rgba(248,81,73,0.2)", borderRadius: 10, padding: "12px 16px", fontSize: 12, color: "var(--muted)" }}>
              ⚠️ All control actions send real transactions to the TON blockchain. Requires <code style={{ color: "var(--accent)" }}>OWNER_MNEMONIC</code> secret to be configured.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <NeuralCommandPanel onSend={handleNeuralCmd} onTelegramTest={handleTelegramTest} />
              <MintPanel onLog={addLog} />
            </div>

            <StakePanel onLog={addLog} totalLocked={cs.total_locked} />

            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 18 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>📡 Telegram Bot Setup</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
                  The Telegram bot provides interactive access to contract stats and AI analysis. Configure these secrets in Replit:
                </div>
                {[
                  ["TG_BOT_TOKEN", "Your bot token from @BotFather on Telegram"],
                  ["TG_CHAT_ID", "Your personal user ID from @userinfobot on Telegram"],
                  ["OWNER_MNEMONIC", "24-word TON wallet mnemonic (space-separated)"],
                  ["TONCENTER_API_KEY", "API key from toncenter.com for higher rate limits"],
                ].map(([key, desc]) => (
                  <div key={key} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "8px 12px", background: "var(--bg)", borderRadius: 8 }}>
                    <code style={{ color: "var(--accent)", fontSize: 12, flexShrink: 0 }}>{key}</code>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>{desc}</span>
                  </div>
                ))}
                <div style={{ marginTop: 4, fontSize: 12, color: "var(--muted)" }}>
                  Bot commands: <code style={{ color: "var(--accent)" }}>/status</code> · <code style={{ color: "var(--accent)" }}>/neural</code> · <code style={{ color: "var(--accent)" }}>/ai</code> · <code style={{ color: "var(--accent)" }}>/freeze</code> · <code style={{ color: "var(--accent)" }}>/unfreeze</code> · <code style={{ color: "var(--accent)" }}>/entropy [±N]</code>
                </div>
              </div>
            </div>

            <LogPanel logs={logs} />
          </div>
        )}

        {!loading && activeTab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <MintHistory />
            <AiEventsLog />
          </div>
        )}

      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
