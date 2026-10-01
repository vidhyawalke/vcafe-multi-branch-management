import React from 'react';
import { Crown, Briefcase, Coffee, ShieldCheck } from 'lucide-react';

export default function DemoPersonaBar({ currentUser, onSwitchPersona }) {
  const personas = [
    {
      id: 'owner',
      label: '👑 Vidhya Walke (Owner)',
      role: 'owner',
      sub: 'All Branches'
    },
    {
      id: 'manager_panjim',
      label: '👔 Rahul Deshmukh (Manager)',
      role: 'manager',
      sub: 'Panjim Branch'
    },
    {
      id: 'staff_anjuna',
      label: '☕ Kevin Lobo (Barista / Staff)',
      role: 'staff',
      sub: 'Anjuna Branch'
    }
  ];

  const currentRole = currentUser?.role;
  const currentBranch = currentUser?.branchName || 'All Branches';

  return (
    <div className="demo-banner">
      <div className="demo-banner-left">
        <span className="demo-badge">Recruiter Demo Mode</span>
        <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck size={14} color="#e58e26" />
          <span>Active Role-Based Access:</span>
          <strong style={{ color: '#fff' }}>{currentUser ? `${currentUser.name} (${currentUser.role.toUpperCase()})` : 'Not Logged In'}</strong>
          <span style={{ color: 'var(--text-muted)' }}>• {currentBranch}</span>
        </span>
      </div>

      <div className="demo-persona-group">
        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginRight: '4px' }}>Switch Role:</span>
        {personas.map((p) => {
          const isActive =
            (p.id === 'owner' && currentRole === 'owner') ||
            (p.id === 'manager_panjim' && currentRole === 'manager') ||
            (p.id === 'staff_anjuna' && currentRole === 'staff');

          return (
            <button
              key={p.id}
              className={`demo-persona-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSwitchPersona(p.id)}
              title={`Switch to ${p.label} - ${p.sub}`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
