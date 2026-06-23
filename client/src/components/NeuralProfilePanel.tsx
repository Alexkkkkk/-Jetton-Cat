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

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ background: "var(--bg)", borderRadius: 4, height: 6, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.5s ease" }} />
    </div>
  );
}

export function NeuralProfilePanel({ neural, loading }: Props) {
  const secAgo = neural ? Math.floor(Date.now() / 1000) - neural.last_tx_time : 0;
  const minAgo = Math.floor(secAgo / 60);

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
        <span style={{ fontSize: 18 }}>🧬</span>
        <h3 style={{ fontSize: 15, fontWeight: 600 }}>Neural Brain Profile</h3>
      </div>

      {loading || !neural ? (
        <div style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: 24 }}>
          {loading ? "Loading neural state..." : "Neural data unavailable"}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ color: "var(--muted)", fontSize: 12 }}>Threat Level</span>
              <span style={{ color: neural.threat_level > 50 ? "var(--red)" : neural.threat_level > 20 ? "var(--yellow)" : "var(--green)", fontSize: 12, fontWeight: 600 }}>
                {neural.threat_level}/100
              </span>
            </div>
            <Bar value={neural.threat_level} max={100} color={neural.threat_level > 50 ? "var(--red)" : neural.threat_level > 20 ? "var(--yellow)" : "var(--green)"} />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ color: "var(--muted)", fontSize: 12 }}>Memory Bank</span>
              <span style={{ color: "var(--purple)", fontSize: 12, fontWeight: 600 }}>{neural.memory_bank}/100</span>
            </div>
            <Bar value={neural.memory_bank} max={100} color="var(--purple)" />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ color: "var(--muted)", fontSize: 12 }}>Policy Weight</span>
              <span style={{ color: "var(--accent)", fontSize: 12, fontWeight: 600 }}>{neural.policy_weight}/1000</span>
            </div>
            <Bar value={neural.policy_weight} max={1000} color="var(--accent)" />
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: "var(--bg)", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 3 }}>Evolution Cycles</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "var(--accent)" }}>{neural.evolution_cycles}</div>
            </div>
            <div style={{ background: "var(--bg)", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 3 }}>Mutation Seed</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "var(--purple)" }}>{neural.mutation_seed}</div>
            </div>
            <div style={{ background: "var(--bg)", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 3 }}>Last Activity</div>
              <div style={{ fontWeight: 600, fontSize: 13, color: minAgo > 60 ? "var(--yellow)" : "var(--green)" }}>
                {minAgo < 1 ? "Just now" : minAgo < 60 ? `${minAgo}m ago` : `${Math.floor(minAgo / 60)}h ago`}
              </div>
            </div>
            <div style={{ background: "var(--bg)", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 3 }}>History Hash</div>
              <div style={{ fontWeight: 600, fontSize: 11, color: "var(--muted)", wordBreak: "break-all" }}>
                {neural.history_hash?.slice(0, 12)}…
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
