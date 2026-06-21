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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--bg)" }}>
      <div style={{ color: "var(--accent)", fontSize: 18 }}>⚙️ Loading...</div>
    </div>
  );

  if (!user) return <LoginPage />;
  return <Dashboard user={user} onLogout={() => { window.location.href = "/api/logout"; }} />;
}
