import { useEffect, useState, useCallback } from "react";
import { StatCard } from "../components/StatCard";
import { NeuralCommandPanel } from "../components/NeuralCommandPanel";
import { MintPanel } from "../components/MintPanel";
import { StakePanel } from "../components/StakePanel";
import { MintHistory } from "../components/MintHistory";
import { LogPanel } from "../components/LogPanel";

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const addLog = (msg: string) => {
    const ts = new Date().toLocaleTimeString();
    setLogs(prev => [`[${ts}] ${msg}`, ...prev].slice(0, 50));
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

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleNeuralCmd = async (cmd: { freeze: boolean; entropyAdj: number; biasAdj: number }) => {
    addLog(`🧠 Sending neural command: freeze=${cmd.freeze}, entropy=${cmd.entropyAdj}, bias=${cmd.biasAdj}...`);
    try {
      const r = await fetch("/api/admin/neural-command", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cmd),
      });
      const data = await r.json();
      if (data.success) addLog(`✅ ${data.message}`);
      else addLog(`❌ Error: ${data.error}`);
    } catch (e: any) {
      addLog(`❌ ${e.message}`);
    }
  };

  const handleTelegramTest = async () => {
    addLog("📨 Sending Telegram test message...");
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
        padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>🐱</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>NeuroJetton Admin</div>
            <div style={{ color: "var(--muted)", fontSize: 12 }}>Plushie Cat (PLSH) Dashboard</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "var(--muted)", fontSize: 13 }}>
            {user?.firstName || user?.email || "Admin"}
          </span>
          <button onClick={onLogout} style={{
            background: "transparent", border: "1px solid var(--border)",
            color: "var(--muted)", padding: "6px 14px", borderRadius: 6, fontSize: 13
          }}>Logout</button>
        </div>
      </header>

      <main style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Contract Overview</h2>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={fetchStats} disabled={refreshing} style={{
              background: "var(--card)", border: "1px solid var(--border)",
              color: "var(--text)", padding: "7px 16px", borderRadius: 6, fontSize: 13
            }}>
              {refreshing ? "⟳ Refreshing..." : "⟳ Refresh"}
            </button>
            {stats?.tonscanUrl && (
              <a href={stats.tonscanUrl} target="_blank" rel="noopener noreferrer" style={{
                background: "var(--card)", border: "1px solid var(--border)",
                color: "var(--accent)", padding: "7px 16px", borderRadius: 6, fontSize: 13,
                textDecoration: "none"
              }}>🔗 TONScan</a>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ color: "var(--muted)", padding: 32, textAlign: "center" }}>Loading contract data...</div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
              <StatCard label="Network" value={stats?.network?.toUpperCase() || "—"} icon="🌐" color="var(--accent)" />
              <StatCard label="Balance" value={stats?.balance ? `${parseFloat(stats.balance).toFixed(3)} TON` : "—"} icon="💎" color="var(--green)" />
              <StatCard label="Status" value={isActive ? "Active" : "Pending"} icon={isActive ? "✅" : "⏳"} color={isActive ? "var(--green)" : "var(--yellow)"} />
              {isActive && <StatCard label="Health Score" value={cs.health ?? "—"} icon="🧠" color={cs.health > 500 ? "var(--green)" : "var(--red)"} />}
              {isActive && <StatCard label="APR" value={cs.apr ? `${cs.apr}%` : "—"} icon="📈" color="var(--purple)" />}
              {isActive && <StatCard label="Locked" value={cs.total_locked ? `${parseFloat(cs.total_locked).toFixed(2)} TON` : "—"} icon="🔒" color="var(--accent)" />}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              <NeuralCommandPanel onSend={handleNeuralCmd} onTelegramTest={handleTelegramTest} />
              <MintPanel onLog={addLog} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <StakePanel onLog={addLog} totalLocked={cs.total_locked} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <LogPanel logs={logs} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <MintHistory />
            </div>

            <div style={{
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 10, padding: 20
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Contract Address</h3>
              <code style={{
                display: "block", background: "var(--bg)", padding: "10px 14px",
                borderRadius: 6, fontSize: 12, color: "var(--accent)", wordBreak: "break-all"
              }}>
                {stats?.masterAddress || "Not deployed yet"}
              </code>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
