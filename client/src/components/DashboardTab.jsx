import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  Receipt,
  Store,
  CreditCard,
  Smartphone,
  Banknote,
  Calendar,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';

export default function DashboardTab({ currentUser, onViewReceipt }) {
  const [metrics, setMetrics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.role === 'manager' && currentUser.branchId) {
      setSelectedBranchId(String(currentUser.branchId));
    }
  }, [currentUser]);

  useEffect(() => {
    loadDashboardData();
  }, [selectedBranchId]);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [branchRes, metricRes, ordersRes] = await Promise.all([
        api.branches.getAll(),
        api.reports.getMetrics({ branchId: selectedBranchId || '' }),
        api.orders.getOrders({ branchId: selectedBranchId || '', limit: 8 })
      ]);

      setBranches(branchRes.data || []);
      setMetrics(metricRes.data || null);
      setRecentOrders(ordersRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  const kpis = metrics?.kpis || {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    lowStockAlerts: 0
  };

  const branchBreakdown = metrics?.branchBreakdown || [];
  const topItems = metrics?.topItems || [];
  const paymentBreakdown = metrics?.paymentBreakdown || [];
  const recentTrend = metrics?.recentTrend || [];

  const maxDayRevenue = Math.max(...recentTrend.map((d) => Number(d.daily_revenue) || 0), 1000);

  return (
    <div>
      {/* Scope Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Executive Business Overview</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
            Multi-branch revenue consolidation, average ticket sizes, and sales velocity
          </p>
        </div>

        {currentUser?.role === 'owner' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Filter Scope:</span>
            <select
              className="form-input-clean"
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              style={{ fontWeight: 500 }}
            >
              <option value="">All Outlets (Consolidated)</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* KPI Row */}
      <div className="kpi-row">
        <div className="kpi-box">
          <div className="kpi-icon-circle" style={{ background: '#fef3c7', color: 'var(--brand-primary)' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <div className="kpi-title">Gross Revenue</div>
            <div className="kpi-val">₹{kpis.totalRevenue.toLocaleString()}</div>
            <div style={{ fontSize: '11px', color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
              <ArrowUpRight size={12} /> Live POS Synced
            </div>
          </div>
        </div>

        <div className="kpi-box">
          <div className="kpi-icon-circle" style={{ background: '#ecfdf5', color: 'var(--status-success)' }}>
            <ShoppingBag size={22} />
          </div>
          <div>
            <div className="kpi-title">Orders Completed</div>
            <div className="kpi-val">{kpis.totalOrders}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Across {selectedBranchId ? '1 branch' : `${branches.length} branches`}
            </div>
          </div>
        </div>

        <div className="kpi-box">
          <div className="kpi-icon-circle" style={{ background: '#eff6ff', color: 'var(--status-info)' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="kpi-title">Avg. Ticket Size</div>
            <div className="kpi-val">₹{kpis.averageOrderValue.toFixed(0)}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Per customer order</div>
          </div>
        </div>

        <div className="kpi-box">
          <div
            className="kpi-icon-circle"
            style={{
              background: kpis.lowStockAlerts > 0 ? '#fef2f2' : '#ecfdf5',
              color: kpis.lowStockAlerts > 0 ? 'var(--status-danger)' : 'var(--status-success)'
            }}
          >
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="kpi-title">Low Stock Items</div>
            <div className="kpi-val">{kpis.lowStockAlerts}</div>
            <div style={{ fontSize: '11px', color: kpis.lowStockAlerts > 0 ? 'var(--status-danger)' : 'var(--status-success)', fontWeight: 600 }}>
              {kpis.lowStockAlerts > 0 ? 'Action required' : 'Stock healthy'}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Branch Revenue Comparison */}
        <div className="clean-card">
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Outlet Revenue Performance</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {branchBreakdown.map((b) => {
              const maxRev = Math.max(...branchBreakdown.map((item) => Number(item.branch_revenue) || 1));
              const pct = Math.round(((Number(b.branch_revenue) || 0) / maxRev) * 100);

              return (
                <div key={b.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                    <span style={{ fontWeight: 600 }}>{b.name}</span>
                    <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>
                      ₹{Number(b.branch_revenue).toLocaleString()}
                      <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '11.5px', marginLeft: '6px' }}>
                        ({b.branch_orders} bills)
                      </span>
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: 'var(--brand-primary)',
                        borderRadius: '4px',
                        transition: 'width 0.5s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7-Day Revenue Trend (Clean Line SVG) */}
        <div className="clean-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Daily Sales Trend</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Last 7 Days</span>
          </div>

          {recentTrend.length > 0 ? (
            <div>
              <div style={{ height: '140px', width: '100%', position: 'relative', marginTop: '10px' }}>
                <svg viewBox="0 0 350 120" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="lightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d97706" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {(() => {
                    const points = recentTrend.map((d, idx) => {
                      const x = (idx / Math.max(recentTrend.length - 1, 1)) * 320 + 15;
                      const y = 110 - ((Number(d.daily_revenue) || 0) / maxDayRevenue) * 90;
                      return { x, y, rev: d.daily_revenue, date: d.order_date };
                    });

                    const pathD = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                    const areaD = `${pathD} L ${points[points.length - 1].x} 110 L ${points[0].x} 110 Z`;

                    return (
                      <>
                        <path d={areaD} fill="url(#lightGradient)" />
                        <path d={pathD} fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
                        {points.map((p, idx) => (
                          <g key={idx}>
                            <circle cx={p.x} cy={p.y} r="4" fill="#d97706" stroke="#ffffff" strokeWidth="2" />
                            <text
                              x={p.x}
                              y={p.y - 8}
                              fill="#1f2937"
                              fontSize="9.5"
                              textAnchor="middle"
                              fontWeight="600"
                            >
                              ₹{Math.round(p.rev)}
                            </text>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                {recentTrend.map((d, i) => (
                  <span key={i}>{d.order_date ? d.order_date.substring(5) : ''}</span>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
              No sales data recorded.
            </div>
          )}
        </div>
      </div>

      {/* Top Items & Payment Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="clean-card">
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Top Selling Products</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'var(--bg-card-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: idx === 0 ? 'var(--brand-primary)' : '#e5e7eb',
                      color: idx === 0 ? '#fff' : '#4b5563',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700
                    }}
                  >
                    #{idx + 1}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>{item.item_name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>₹{Number(item.total_sales).toLocaleString()}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.units_sold} ordered</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="clean-card">
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Payment Mode Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {paymentBreakdown.map((p, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'var(--bg-card-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '12.5px' }}>
                    {p.payment_method}
                  </div>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>({p.count} bills)</span>
                </div>
                <strong style={{ fontSize: '14px' }}>₹{Number(p.amount).toLocaleString()}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="clean-card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Recent Transaction Ledger</h3>
        </div>

        <div className="table-responsive" style={{ border: 'none' }}>
          <table className="clean-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Branch</th>
                <th>Guest</th>
                <th>Dining</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Amount</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--brand-primary)' }}>
                      {order.order_number}
                    </span>
                  </td>
                  <td>{order.branch_name}</td>
                  <td>
                    <div>{order.customer_name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.table_number}</div>
                  </td>
                  <td>
                    <span className={`pill-badge ${order.order_type === 'dine_in' ? 'badge-green' : 'badge-amber'}`}>
                      {order.order_type === 'dine_in' ? 'Dine In' : 'Takeaway'}
                    </span>
                  </td>
                  <td style={{ fontSize: '12.5px' }}>
                    {order.items?.map((it) => `${it.quantity}x ${it.item_name}`).join(', ') || '-'}
                  </td>
                  <td style={{ textTransform: 'uppercase', fontSize: '11.5px', fontWeight: 600 }}>
                    {order.payment_method}
                  </td>
                  <td>
                    <strong>₹{Number(order.total_amount).toFixed(2)}</strong>
                  </td>
                  <td>
                    <button
                      className="btn-outline-neutral"
                      style={{ padding: '4px 10px', fontSize: '11.5px' }}
                      onClick={() => onViewReceipt(order)}
                    >
                      <Receipt size={13} /> Bill
                    </button>
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
