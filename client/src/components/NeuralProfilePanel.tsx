interface NeuralProfile {
  history_hash: string;
  evolution_cycles: number;
  threat_level: number;
  policy_weight: number;
  last_tx_time: number;
  mutation_seed: number;
  memory_bank: number;
}

interface Props {
  neural: NeuralProfile | null;
  loading?: boolean;
}

function NeonBar({ value, max, color, label, sublabel }: {
  value: number; max: number; color: string; label: string; sublabel: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
        <span style={{ color: "var(--muted)", fontSize: 12 }}>{label}</span>
        <span style={{ color, fontSize: 12, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif" }}>{sublabel}</span>
      </div>
      <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 4, height: 7, overflow: "hidden", position: "relative" }}>
        <div style={{
          width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: 4, transition: "width 0.8s cubic-bezier(.4,0,.2,1)",
          boxShadow: `0 0 8px ${color}88`,
        }} />
      </div>
    </div>
  );
}

export function NeuralProfilePanel({ neural, loading }: Props) {
  const secAgo = neural ? Math.floor(Date.now() / 1000) - neural.last_tx_time : 0;
  const minAgo = Math.floor(secAgo / 60);

  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: 12, padding: 20,
      boxShadow: "0 0 30px rgba(155,95,255,0.06)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <span style={{ fontSize: 18 }}>🧬</span>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1 }}>
          Нейронный Профиль
        </h3>
      </div>

      {loading || !neural ? (
        <div style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: 32 }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ width: 28, height: 28, border: "2px solid var(--border)", borderTopColor: "var(--purple)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <span>Загрузка нейронного состояния...</span>
            </div>
          ) : "Данные недоступны"}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <NeonBar
            value={neural.threat_level} max={100} color="var(--red)"
            label="Уровень Угрозы"
            sublabel={`${neural.threat_level}/100`}
          />
          <NeonBar
            value={neural.memory_bank} max={100} color="var(--purple)"
            label="Банк Памяти"
            sublabel={`${neural.memory_bank}/100`}
          />
          <NeonBar
            value={neural.policy_weight} max={1000} color="var(--accent)"
            label="Вес Политики"
            sublabel={`${neural.policy_weight}/1000`}
          />

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Циклы Эволюции", value: neural.evolution_cycles, color: "var(--accent)" },
              { label: "Семя Мутации", value: neural.mutation_seed, color: "var(--purple)" },
              { label: "Последняя Активность", value: minAgo < 1 ? "Только что" : minAgo < 60 ? `${minAgo} мин назад` : `${Math.floor(minAgo/60)}ч назад`, color: minAgo > 60 ? "var(--yellow)" : "var(--green)" },
              { label: "Хэш Истории", value: neural.history_hash?.slice(0,10) + "…", color: "var(--muted)" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px 14px",
                border: "1px solid var(--border)",
              }}>
                <div style={{ color: "var(--muted)", fontSize: 10, marginBottom: 5, letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color, fontFamily: "'Rajdhani', sans-serif" }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
