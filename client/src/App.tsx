import { useEffect, useState } from "react";
import { LoginPage } from "./pages/LoginPage";
import { Dashboard } from "./pages/Dashboard";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/user", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => { setUser(u); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--bg)", gap: 16 }}>
      <div style={{ fontSize: 40, animation: "float 2s ease-in-out infinite" }}>🐱</div>
      <div style={{ color: "var(--accent)", fontSize: 15, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 3, textTransform: "uppercase" }}>
        Инициализация нейросети...
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: "50%", background: "var(--accent)",
            animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );

  if (!user) return <LoginPage />;
  return <Dashboard user={user} onLogout={() => { window.location.href = "/api/logout"; }} />;
}
