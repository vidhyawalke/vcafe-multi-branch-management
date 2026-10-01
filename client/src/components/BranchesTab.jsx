import React, { useState, useEffect } from 'react';
import { Store, MapPin, Phone, Users, Shield, Receipt, DollarSign } from 'lucide-react';
import { api } from '../services/api';

export default function BranchesTab({ currentUser }) {
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBranchAndUserData();
  }, []);

  async function loadBranchAndUserData() {
    setLoading(true);
    try {
      const [branchRes, usersRes] = await Promise.all([
        api.branches.getAll(),
        api.auth.getUsers()
      ]);
      setBranches(branchRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error('Failed to load branches and users:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="filter-bar">
        <div>
          <h2>Branch Network & Operations Team</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Multi-branch physical locations, operational status, and role-based staff assignments
          </p>
        </div>
      </div>

      {/* Branch Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {branches.map((b) => (
          <div key={b.id} className="card" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span
                  style={{
                    background: 'var(--bg-tertiary)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    color: 'var(--accent-gold)'
                  }}
                >
                  BRANCH #{b.code}
                </span>
                <h3 style={{ fontSize: '18px', marginTop: '6px' }}>{b.name}</h3>
              </div>

              <span className="badge badge-success">
                <span className="branch-dot" /> Operational
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={15} color="var(--accent-primary)" />
                <span>{b.address}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={15} color="var(--accent-primary)" />
                <span>{b.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={15} color="var(--accent-primary)" />
                <span>GSTIN: {b.gstin}</span>
              </div>
            </div>

            {/* Quick Metrics Bar for Branch */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Staff</div>
                <div style={{ fontSize: '15px', fontWeight: 700 }}>{b.staff_count}</div>
              </div>
              <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-subtle)', borderRight: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Orders</div>
                <div style={{ fontSize: '15px', fontWeight: 700 }}>{b.total_orders}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Revenue</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                  ₹{Number(b.total_revenue).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Staff and Team RBAC Directory */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px' }}>Authorized Staff & Access Permissions (RBAC)</h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Role hierarchy: Owner (Universal) &gt; Manager (Branch Ops) &gt; Staff (POS Terminal)
            </p>
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Team Member</th>
                <th>Assigned Role</th>
                <th>Branch Assignment</th>
                <th>Email ID</th>
                <th>Contact</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'var(--bg-tertiary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '12px',
                          color: 'var(--accent-gold)'
                        }}
                      >
                        {u.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .substring(0, 2)}
                      </div>
                      <strong>{u.name}</strong>
                    </div>
                  </td>
                  <td>
                    <span className={`role-chip role-${u.role}`}>{u.role}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px' }}>
                      {u.role === 'owner' ? 'All Outlets (Universal)' : u.branch_name || '-'}
                    </span>
                  </td>
                  <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {u.email}
                  </td>
                  <td style={{ fontSize: '12.5px' }}>{u.phone || '-'}</td>
                  <td>
                    <span className="badge badge-success">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
