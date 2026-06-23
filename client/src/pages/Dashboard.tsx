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

interface DashboardProps { user: any; onLogout: () => void; }
type Tab = "overview" | "neural" | "ai" | "control" | "history";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "Обзор", icon: "📊" },
  { id: "neural",   label: "Нейронный Мозг", icon: "🧬" },
  { id: "ai",       label: "ИИ Анализ", icon: "🧠" },
  { id: "control",  label: "Управление", icon: "⚙️" },
  { id: "history",  label: "История", icon: "📜" },
];

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [stats, setStats]           = useState<any>(null);
  const [neural, setNeural]         = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [neuralLoading, setNeuralLoading] = useState(false);
  const [logs, setLogs]             = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab]   = useState<Tab>("overview");

  const addLog = (msg: string) => {
    const ts = new Date().toLocaleTimeString("ru-RU");
    setLogs(prev => [`[${ts}] ${msg}`, ...prev].slice(0, 100));
  };

  const fetchStats = useCallback(async () => {
    setRefreshing(true);
    try {
      const r = await fetch("/api/admin/stats", { credentials: "include" });
      const data = await r.json();
      setStats(data);
      addLog("📊 Данные обновлены");
    } catch (e: any) {
      addLog(`❌ Ошибка загрузки данных: ${e.message}`);
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  const fetchNeural = useCallback(async () => {
    setNeuralLoading(true);
    try {
      const r = await fetch("/api/admin/neural-profile", { credentials: "include" });
      if (r.ok) {
        const data = await r.json();
        setNeural(data);
        addLog(`🧬 Нейропрофиль: ${data.evolution_cycles} цикл(ов), угроза ${data.threat_level}`);
      }
    } catch (e: any) {
      addLog(`⚠️ Нейропрофиль недоступен: ${e.message}`);
    } finally { setNeuralLoading(false); }
  }, []);

  useEffect(() => {
    fetchStats(); fetchNeural();
    const si = setInterval(fetchStats, 60000);
    const ni = setInterval(fetchNeural, 90000);
    return () => { clearInterval(si); clearInterval(ni); };
  }, [fetchStats, fetchNeural]);

  const handleNeuralCmd = async (cmd: { freeze: boolean; entropyAdj: number; biasAdj: number }) => {
    addLog(`🧠 Отправка нейронной команды: заморозка=${cmd.freeze}, энтропия=${cmd.entropyAdj}…`);
    try {
      const r = await fetch("/api/admin/neural-command", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cmd),
      });
      const data = await r.json();
      if (data.success) { addLog(`✅ ${data.message}`); setTimeout(() => { fetchStats(); fetchNeural(); }, 3000); }
      else { addLog(`❌ Ошибка: ${data.error}`); }
    } catch (e: any) { addLog(`❌ ${e.message}`); }
  };

  const handleTelegramTest = async () => {
    addLog("📨 Отправка тестового сообщения в Telegram…");
    try {
      const r = await fetch("/api/admin/telegram-test", { method: "POST", credentials: "include" });
      const data = await r.json();
      if (data.success) addLog("✅ Telegram сообщение отправлено!");
      else addLog(`❌ Telegram ошибка: ${data.error}`);
    } catch (e: any) { addLog(`❌ ${e.message}`); }
  };

  const cs = stats?.contractStats || {};
  const isActive = !cs.error;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* HEADER */}
      <header style={{
        background: "rgba(12,12,26,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 60, position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ position: "relative" }}>
            <span style={{ fontSize: 26, filter: "drop-shadow(0 0 8px rgba(0,212,255,0.6))" }}>🐱</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1.5, lineHeight: 1.2 }}>
              NEURO<span style={{ color: "var(--accent)", textShadow: "0 0 12px rgba(0,212,255,0.7)" }}>JETTON</span>
            </div>
            <div style={{ color: "var(--muted)", fontSize: 10, letterSpacing: 1 }}>PLSH · НЕЙРОННОЕ УПРАВЛЕНИЕ · TON</div>
          </div>
          {isActive && (
            <div style={{
              marginLeft: 8, display: "flex", alignItems: "center", gap: 6,
              background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.25)",
              borderRadius: 20, padding: "4px 12px",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block", animation: "glow-pulse 2s infinite" }} />
              <span style={{ fontSize: 10, color: "var(--green)", fontWeight: 700, letterSpacing: 1 }}>В СЕТИ</span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={fetchStats} disabled={refreshing} style={{
            background: "rgba(0,212,255,0.06)", border: "1px solid var(--border)",
            color: refreshing ? "var(--muted)" : "var(--accent)", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
          }}>
            {refreshing ? "⟳ …" : "⟳ Обновить"}
          </button>
          <div style={{ color: "var(--muted)", fontSize: 12, padding: "4px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid var(--border)" }}>
            👤 {user?.firstName || user?.email || "Администратор"}
          </div>
          <button onClick={onLogout} style={{
            background: "transparent", border: "1px solid rgba(255,34,68,0.3)",
            color: "var(--red)", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
          }}>
            Выйти
          </button>
        </div>
      </header>

      {/* TABS */}
      <div style={{ borderBottom: "1px solid var(--border)", background: "rgba(12,12,26,0.8)", backdropFilter: "blur(8px)", padding: "0 24px" }}>
        <div style={{ display: "flex", gap: 0 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              background: "transparent", border: "none",
              borderBottom: activeTab === tab.id ? "2px solid var(--accent)" : "2px solid transparent",
              color: activeTab === tab.id ? "var(--accent)" : "var(--muted)",
              padding: "14px 18px", fontSize: 13,
              fontWeight: activeTab === tab.id ? 700 : 400,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
              transition: "all 0.15s", letterSpacing: 0.3,
              textShadow: activeTab === tab.id ? "0 0 10px rgba(0,212,255,0.5)" : "none",
              fontFamily: activeTab === tab.id ? "'Rajdhani', sans-serif" : "inherit",
            }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <main style={{ padding: "24px", maxWidth: 1320, margin: "0 auto" }}>

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 64, color: "var(--muted)", fontSize: 14 }}>
            <div style={{ width: 40, height: 40, border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            Загрузка данных контракта...
          </div>
        )}

        {/* OVERVIEW */}
        {!loading && activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeIn 0.35s ease" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12 }}>
              <StatCard label="Сеть" value={stats?.network?.toUpperCase() || "—"} icon="🌐" color="var(--accent)" />
              <StatCard label="Баланс" value={stats?.balance ? `${parseFloat(stats.balance).toFixed(3)} TON` : "—"} icon="💎" color="var(--green)" glow />
              {isActive && <StatCard label="Доходность" value={cs.apr !== undefined ? `${cs.apr}%` : "—"} icon="📈" color="var(--purple)" glow />}
              {isActive && <StatCard label="Заблокировано" value={cs.total_locked ? `${parseFloat(cs.total_locked).toFixed(2)} TON` : "—"} icon="🔒" color="var(--accent)" />}
              {isActive && <StatCard label="Глубина Синапсов" value={cs.synapse_depth ?? "—"} icon="⚡" color="var(--yellow)" />}
              {isActive && <StatCard label="Коэф. Ликвидности" value={cs.liquidity_ratio ?? "—"} icon="💧" color="var(--green)" />}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 14, alignItems: "start" }}>
              {isActive ? <HealthGauge health={cs.health ?? 0} /> : (
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, textAlign: "center" }}>
                  <div style={{ color: "var(--yellow)", fontSize: 28, marginBottom: 8 }}>⏳</div>
                  <div style={{ color: "var(--muted)", fontSize: 12 }}>Контракт ещё не активен</div>
                </div>
              )}
              <ContractInfoPanel masterAddress={stats?.masterAddress || null} network={stats?.network || "mainnet"} config={stats?.config} tonscanUrl={stats?.tonscanUrl || null} />
            </div>

            <AiInsightPanel onLog={addLog} />
            <LogPanel logs={logs} />
          </div>
        )}

        {/* NEURAL BRAIN */}
        {!loading && activeTab === "neural" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeIn 0.35s ease" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignItems: "start" }}>
              <NeuralProfilePanel neural={neural} loading={neuralLoading} />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {isActive && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { label: "ИНДЕКС ЗДОРОВЬЯ", value: cs.health ?? "—", suffix: "/1000", color: cs.health >= 700 ? "var(--green)" : cs.health >= 400 ? "var(--yellow)" : "var(--red)" },
                      { label: "ТЕКУЩАЯ ДОХОДНОСТЬ", value: cs.apr !== undefined ? `${cs.apr}%` : "—", suffix: "годовых", color: "var(--purple)" },
                      { label: "ВСЕГО ЗАБЛОКИРОВАНО", value: cs.total_locked ? `${parseFloat(cs.total_locked).toFixed(3)} TON` : "—", suffix: "", color: "var(--accent)" },
                      { label: "ЦИКЛЫ ЭВОЛЮЦИИ", value: neural?.evolution_cycles ?? "—", suffix: "", color: "var(--accent)" },
                    ].map(({ label, value, suffix, color }) => (
                      <div key={label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px" }}>
                        <div style={{ color: "var(--muted)", fontSize: 10, marginBottom: 7, letterSpacing: 1.5 }}>{label}</div>
                        <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "'Rajdhani', sans-serif", textShadow: `0 0 10px ${color}66` }}>
                          {value}
                        </div>
                        {suffix && <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 2 }}>{suffix}</div>}
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
                  <div style={{ color: "var(--muted)", fontSize: 10, marginBottom: 12, letterSpacing: 1.5 }}>КАК РАБОТАЕТ НЕЙРОННЫЙ ДВИЖОК</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {[
                      ["evolve()", "Вызывается при каждой транзакции — обновляет APR, риск и банк памяти"],
                      ["memory_bank", "Накапливает сигналы рыночного давления (шкала 0–100)"],
                      ["threat_level", "Растёт при высокой энтропии, падает при стабилизации рынков"],
                      ["policy_weight", "Множитель интеллекта — влияет на расчёт APR"],
                      ["mutation_seed", "Криптографическое зерно эволюции — обеспечивает непредсказуемость"],
                      ["history_hash", "Хэш прошлых состояний — отпечаток памяти организма"],
                    ].map(([term, desc]) => (
                      <div key={term} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <code style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", padding: "2px 8px", borderRadius: 5, fontSize: 11, color: "var(--accent)", flexShrink: 0, fontFamily: "'JetBrains Mono', monospace" }}>
                          {term}
                        </code>
                        <span style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <AiEventsLog />
          </div>
        )}

        {/* AI ANALYSIS */}
        {!loading && activeTab === "ai" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeIn 0.35s ease" }}>
            <AiInsightPanel onLog={addLog} />
            <AiEventsLog />
          </div>
        )}

        {/* CONTROL */}
        {!loading && activeTab === "control" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeIn 0.35s ease" }}>
            <div style={{ background: "rgba(255,34,68,0.05)", border: "1px solid rgba(255,34,68,0.2)", borderRadius: 10, padding: "12px 18px", fontSize: 12, color: "var(--muted)", lineHeight: 1.7 }}>
              ⚠️ Все действия отправляют реальные транзакции в блокчейн TON. Требуется настроенный секрет <code style={{ color: "var(--accent)" }}>OWNER_MNEMONIC</code>.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <NeuralCommandPanel onSend={handleNeuralCmd} onTelegramTest={handleTelegramTest} />
              <MintPanel onLog={addLog} />
            </div>

            <StakePanel onLog={addLog} totalLocked={cs.total_locked} />

            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 18 }}>📡</span>
                <h3 style={{ fontSize: 17, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1 }}>
                  Настройка Telegram Бота
                </h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.7, marginBottom: 4 }}>
                  Telegram бот предоставляет интерактивный доступ к статистике и ИИ анализу. Настройте секреты в Replit:
                </div>
                {[
                  ["TG_BOT_TOKEN", "Токен вашего бота от @BotFather в Telegram"],
                  ["TG_CHAT_ID", "Ваш личный ID пользователя от @userinfobot в Telegram"],
                  ["OWNER_MNEMONIC", "24-словная мнемоника TON кошелька (через пробел)"],
                  ["TONCENTER_API_KEY", "API ключ от toncenter.com для увеличения лимитов"],
                ].map(([key, desc]) => (
                  <div key={key} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid var(--border)" }}>
                    <code style={{ color: "var(--accent)", fontSize: 12, flexShrink: 0, fontFamily: "'JetBrains Mono', monospace" }}>{key}</code>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>{desc}</span>
                  </div>
                ))}
                <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)", lineHeight: 1.8 }}>
                  Команды бота: {["/status","/neural","/ai","/freeze","/unfreeze","/entropy"].map(c => (
                    <code key={c} style={{ color: "var(--accent)", background: "rgba(0,212,255,0.08)", padding: "1px 6px", borderRadius: 4, margin: "0 3px", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>{c}</code>
                  ))}
                </div>
              </div>
            </div>

            <LogPanel logs={logs} />
          </div>
        )}

        {/* HISTORY */}
        {!loading && activeTab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeIn 0.35s ease" }}>
            <MintHistory />
            <AiEventsLog />
          </div>
        )}

      </main>
    </div>
  );
}
