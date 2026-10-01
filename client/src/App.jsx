import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Menu from "./pages/Menu";
import Branches from "./pages/Branches";

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("brewhub_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [active, setActive] = useState("dashboard");

  function logout() {
    localStorage.removeItem("brewhub_token");
    localStorage.removeItem("brewhub_user");
    setUser(null);
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="app-shell">
      <Sidebar active={active} setActive={setActive} user={user} onLogout={logout} />
      <main className="main-content">
        {active === "dashboard" && <Dashboard user={user} />}
        {active === "orders" && <Orders />}
        {active === "menu" && <Menu />}
        {active === "branches" && <Branches />}
      </main>
    </div>
  );
}
