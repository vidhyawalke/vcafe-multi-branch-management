import React from 'react';
import {
  Coffee,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Store,
  LogOut,
  User,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, currentUser, onLogout, onOpenLogin }) {
  const isOwnerOrManager = currentUser?.role === 'owner' || currentUser?.role === 'manager';

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-logo">
        <div className="logo-badge">
          <Coffee size={20} strokeWidth={2.4} />
        </div>
        <div>
          <div className="logo-text">
            V<span>Cafe</span>
          </div>
          <div className="logo-sub">Multi-Branch ERP</div>
        </div>
      </div>

      {/* Main Navigation Links (GoMeal Style) */}
      <nav className="sidebar-nav">
        <button
          className={`nav-item-btn ${activeTab === 'pos' ? 'active' : ''}`}
          onClick={() => setActiveTab('pos')}
        >
          <ShoppingCart size={18} />
          <span>Point of Sale</span>
        </button>

        {isOwnerOrManager && (
          <button
            className={`nav-item-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Sales Analytics</span>
          </button>
        )}

        <button
          className={`nav-item-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <Package size={18} />
          <span>Stock & Inventory</span>
        </button>

        {isOwnerOrManager && (
          <button
            className={`nav-item-btn ${activeTab === 'branches' ? 'active' : ''}`}
            onClick={() => setActiveTab('branches')}
          >
            <Store size={18} />
            <span>Outlets & Staff</span>
          </button>
        )}
      </nav>

      {/* User Footer Profile */}
      <div className="sidebar-footer">
        {currentUser ? (
          <div className="sidebar-user-card">
            <div className="user-avatar-circle">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, truncate: 'true' }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--brand-primary)', fontWeight: 600, textTransform: 'capitalize' }}>
                {currentUser.role} • {currentUser.branchCode || 'All'}
              </div>
            </div>
            <button
              onClick={onLogout}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px'
              }}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button className="btn-solid-primary" onClick={onOpenLogin}>
            <User size={15} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </aside>
  );
}
