import React from 'react';
import { Coffee, ShoppingCart, BarChart3, Package, Store, LogOut, User } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, currentUser, onLogout, openLoginModal }) {
  const isOwnerOrManager = currentUser?.role === 'owner' || currentUser?.role === 'manager';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="brand-icon-box">
          <Coffee size={22} strokeWidth={2.4} />
        </div>
        <div>
          <div className="brand-title">
            V<span>Cafe</span>
          </div>
          <div className="brand-subtitle">Multi-Branch Operations Platform</div>
        </div>
      </div>

      <div className="nav-links">
        <button
          className={`nav-tab-btn ${activeTab === 'pos' ? 'active' : ''}`}
          onClick={() => setActiveTab('pos')}
        >
          <ShoppingCart size={17} />
          <span>POS Checkout</span>
        </button>

        {isOwnerOrManager && (
          <button
            className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart3 size={17} />
            <span>Sales Analytics</span>
          </button>
        )}

        <button
          className={`nav-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <Package size={17} />
          <span>Inventory Control</span>
        </button>

        {isOwnerOrManager && (
          <button
            className={`nav-tab-btn ${activeTab === 'branches' ? 'active' : ''}`}
            onClick={() => setActiveTab('branches')}
          >
            <Store size={17} />
            <span>Branch Network</span>
          </button>
        )}
      </div>

      <div className="nav-user-meta">
        <div className="branch-pill">
          <div className="branch-dot" />
          <span>{currentUser?.branchName || 'All Goa Outlets'}</span>
        </div>

        {currentUser ? (
          <div className="user-badge">
            <div className="user-avatar" title={currentUser.name}>
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>{currentUser.name}</div>
              <span className={`role-chip role-${currentUser.role}`}>{currentUser.role}</span>
            </div>
            <button
              onClick={onLogout}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                marginLeft: '8px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button className="btn-secondary" onClick={openLoginModal}>
            <User size={15} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </nav>
  );
}
