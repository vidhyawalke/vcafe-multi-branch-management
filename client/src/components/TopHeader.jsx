import React from 'react';
import { Store, ShieldCheck } from 'lucide-react';

export default function TopHeader({ title, subtitle, currentUser, onSwitchPersona }) {
  const personas = [
    { id: 'owner', label: '👑 Owner (All Branches)' },
    { id: 'manager_panjim', label: '👔 Panjim Mgr' },
    { id: 'staff_anjuna', label: '☕ Anjuna Barista' }
  ];

  const currentRole = currentUser?.role;

  return (
    <header className="top-header">
      <div>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>{title}</h1>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{subtitle}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Recruiter persona switcher */}
        <div className="recruiter-demo-strip">
          <span className="demo-tag">Demo Persona:</span>
          {personas.map((p) => {
            const isActive =
              (p.id === 'owner' && currentRole === 'owner') ||
              (p.id === 'manager_panjim' && currentRole === 'manager') ||
              (p.id === 'staff_anjuna' && currentRole === 'staff');

            return (
              <button
                key={p.id}
                className={`persona-btn-pill ${isActive ? 'active' : ''}`}
                onClick={() => onSwitchPersona(p.id)}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Current Branch Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#ffffff',
            border: '1px solid var(--border-color)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '12.5px',
            fontWeight: 500,
            color: 'var(--text-main)'
          }}
        >
          <Store size={14} color="var(--brand-primary)" />
          <span>{currentUser?.branchName || 'All Goa Outlets'}</span>
        </div>
      </div>
    </header>
  );
}
