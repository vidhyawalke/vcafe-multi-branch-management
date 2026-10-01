import {
  LayoutDashboard,
  Store,
  Coffee,
  ShoppingBag,
  LogOut,
  MapPin
} from "lucide-react";

export default function Sidebar({ active, setActive, user, onLogout }) {
  const items = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "orders", label: "Orders & POS", icon: ShoppingBag },
    { id: "menu", label: "Menu Catalogue", icon: Coffee },
    { id: "branches", label: "Branch Network", icon: Store }
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon-box">
          <Coffee size={18} />
        </div>
        <div className="brand-text">
          <span className="brand-title">BrewHub</span>
          <span className="brand-tag">Operations Portal</span>
        </div>
      </div>

      <div className="sidebar-branch-info">
        <div className="branch-info-header">
          <MapPin size={13} />
          <span>ACTIVE BRANCH</span>
        </div>
        <div className="branch-info-name">
          {user?.role === "ADMIN" ? "All Locations (HQ View)" : "Panjim Cafe Branch"}
        </div>
        <div className="branch-role-badge">
          Role: {user?.role || "STAFF"}
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">MANAGEMENT</div>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              className={`nav-btn ${isActive ? "active" : ""}`}
              onClick={() => setActive(item.id)}
            >
              <Icon size={17} className="nav-icon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">{user?.name?.charAt(0) || "U"}</div>
          <div className="user-details">
            <span className="user-name">{user?.name || "User"}</span>
            <span className="user-email">{user?.email || "user@brewhub.com"}</span>
          </div>
        </div>
        <button className="btn-logout" onClick={onLogout} title="Sign out">
          <LogOut size={15} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
