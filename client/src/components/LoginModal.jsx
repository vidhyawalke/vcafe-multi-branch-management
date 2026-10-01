import React, { useState } from 'react';
import { X, Lock, Mail, AlertCircle, Coffee } from 'lucide-react';
import { api, setAuthSession } from '../services/api';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  if (!isOpen) return null;

  const [email, setEmail] = useState('owner@vcafe.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.auth.login(email, password);
      if (res.success) {
        setAuthSession(res.data.token, res.data.user);
        onLoginSuccess(res.data.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(e, p) {
    setEmail(e);
    setPassword(p);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="brand-icon-box" style={{ width: '32px', height: '32px' }}>
              <Coffee size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px' }}>VCafe Portal Sign In</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Role-Based Access Control</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'var(--status-danger-bg)', color: 'var(--status-danger)', padding: '10px', borderRadius: 'var(--radius-sm)', marginBottom: '14px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="custom-input"
                style={{ width: '100%', paddingLeft: '36px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="custom-input"
                style={{ width: '100%', paddingLeft: '36px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Quick Demo Pre-fills */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', marginTop: '4px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
              Quick Fill Demo Credentials:
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="demo-persona-btn"
                style={{ fontSize: '11px', padding: '3px 8px' }}
                onClick={() => fillDemo('owner@vcafe.com', 'admin123')}
              >
                👑 Owner
              </button>
              <button
                type="button"
                className="demo-persona-btn"
                style={{ fontSize: '11px', padding: '3px 8px' }}
                onClick={() => fillDemo('manager.panjim@vcafe.com', 'manager123')}
              >
                👔 Panjim Mgr
              </button>
              <button
                type="button"
                className="demo-persona-btn"
                style={{ fontSize: '11px', padding: '3px 8px' }}
                onClick={() => fillDemo('staff.anjuna@vcafe.com', 'staff123')}
              >
                ☕ Anjuna Staff
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to VCafe'}
          </button>
        </form>
      </div>
    </div>
  );
}
