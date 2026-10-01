import React, { useState, useEffect } from 'react';
import { Store, MapPin, Phone, Shield } from 'lucide-react';
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
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Outlet Network & Authorized Staff</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
          Physical branch locations in Goa and Role-Based Access Control (RBAC) hierarchy
        </p>
      </div>

      {/* Branch Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {branches.map((b) => (
          <div key={b.id} className="clean-card" style={{ borderTop: '4px solid var(--brand-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span
                  style={{
                    background: '#fef3c7',
                    color: '#92400e',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  BRANCH {b.code}
                </span>
                <h3 style={{ fontSize: '16px', marginTop: '6px', fontWeight: 700 }}>{b.name}</h3>
              </div>

              <span className="pill-badge badge-green">Operational</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={14} color="var(--brand-primary)" />
                <span>{b.address}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} color="var(--brand-primary)" />
                <span>{b.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={14} color="var(--brand-primary)" />
                <span>GSTIN: {b.gstin}</span>
              </div>
            </div>

            {/* Quick Metrics Bar for Branch */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: '#f8fafc', padding: '10px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Staff</div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{b.staff_count}</div>
              </div>
              <div style={{ textAlign: 'center', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Orders</div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{b.total_orders}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Revenue</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--brand-primary)' }}>
                  ₹{Number(b.total_revenue).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Staff and Team RBAC Directory */}
      <div className="clean-card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Team Directory & Role Hierarchy</h3>
        </div>

        <div className="table-responsive" style={{ border: 'none' }}>
          <table className="clean-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Role</th>
                <th>Assigned Outlet</th>
                <th>Login Email</th>
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
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: '#fef3c7',
                          color: '#78350f',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '11px'
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
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        background: u.role === 'owner' ? '#fef3c7' : u.role === 'manager' ? '#eff6ff' : '#ecfdf5',
                        color: u.role === 'owner' ? '#92400e' : u.role === 'manager' ? '#1e40af' : '#065f46'
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td>{u.role === 'owner' ? 'Universal Access' : u.branch_name || '-'}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
                    {u.email}
                  </td>
                  <td style={{ fontSize: '12.5px' }}>{u.phone || '-'}</td>
                  <td>
                    <span className="pill-badge badge-green">Active</span>
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
