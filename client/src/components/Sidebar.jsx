import {
  LayoutDashboard,
  Store,
  Coffee,
  ShoppingBag,
  LogOut,
  ChevronDown
} from "lucide-react";

export default function Sidebar({ active, setActive, user, onLogout }) {
  const items = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "menu", label: "Menu", icon: Coffee },
    { id: "branches", label: "Branches", icon: Store }
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">B</div>
        <div>
          <strong>BrewHub</strong>
          <span>cafe operations</span>
        </div>
      </div>

      <div className="workspace">
        <div className="workspace-label">WORKSPACE</div>
        <button className="branch-switcher">
          <span className="mini-avatar">P</span>
          <span className="branch-text">
            <strong>{user?.role === "ADMIN" ? "All branches" : "Panjim Cafe"}</strong>
            <small>{user?.role || "STAFF"}</small>
          </span>
          <ChevronDown size={16} />
        </button>
      </div>

      <nav>
        <div className="nav-label">MANAGE</div>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${active === item.id ? "active" : ""}`}
              onClick={() => setActive(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="user-card">
          <div className="user-avatar">{user?.name?.charAt(0) || "B"}</div>
          <div>
            <strong>{user?.name || "BrewHub User"}</strong>
            <small>{user?.role || "STAFF"}</small>
          </div>
        </div>
        <button className="logout-button" onClick={onLogout}>
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
