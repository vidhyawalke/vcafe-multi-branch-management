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

  // If user is manager, lock to their branch
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

  // Calculate highest revenue day for SVG chart scaling
  const maxDayRevenue = Math.max(...recentTrend.map((d) => Number(d.daily_revenue) || 0), 1000);

  return (
    <div>
      {/* Top Filter Header */}
      <div className="filter-bar">
        <div>
          <h2>Executive Business Analytics</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Consolidated revenue, branch sales performance, and operational KPIs
          </p>
        </div>

        <div className="branch-select-group">
          <Store size={16} color="var(--accent-primary)" />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Branch Scope:</span>
          {currentUser?.role === 'owner' ? (
            <select
              className="custom-select"
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
            >
              <option value="">All Outlets (Consolidated)</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          ) : (
            <span style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>
              {currentUser?.branchName || 'Assigned Branch'}
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="card kpi-card">
          <div className="kpi-icon-box kpi-icon-amber">
            <DollarSign size={24} />
          </div>
          <div>
            <div className="kpi-label">Gross Revenue</div>
            <div className="kpi-value">₹{kpis.totalRevenue.toLocaleString()}</div>
            <div style={{ fontSize: '11.5px', color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <ArrowUpRight size={13} />
              <span>Real-time POS synced</span>
            </div>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-box kpi-icon-green">
            <ShoppingBag size={24} />
          </div>
          <div>
            <div className="kpi-label">Orders Completed</div>
            <div className="kpi-value">{kpis.totalOrders}</div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Across {selectedBranchId ? '1 branch' : `${branches.length} branches`}
            </div>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-box kpi-icon-blue">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="kpi-label">Avg. Order Value</div>
            <div className="kpi-value">₹{kpis.averageOrderValue.toFixed(0)}</div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Per customer ticket</div>
          </div>
        </div>

        <div className="card kpi-card">
          <div className={`kpi-icon-box ${kpis.lowStockAlerts > 0 ? 'kpi-icon-red' : 'kpi-icon-green'}`}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="kpi-label">Low Stock Alerts</div>
            <div className="kpi-value">{kpis.lowStockAlerts}</div>
            <div style={{ fontSize: '11.5px', color: kpis.lowStockAlerts > 0 ? 'var(--status-danger)' : 'var(--status-success)' }}>
              {kpis.lowStockAlerts > 0 ? 'Immediate reorder needed' : 'All stocks healthy'}
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Analytics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Branch Revenue Comparison */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px' }}>Branch Revenue Comparison</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Goa Outlets</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {branchBreakdown.map((b) => {
              const maxRev = Math.max(...branchBreakdown.map((item) => Number(item.branch_revenue) || 1));
              const pct = Math.round(((Number(b.branch_revenue) || 0) / maxRev) * 100);

              return (
                <div key={b.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13.5px' }}>
                    <span style={{ fontWeight: 600 }}>{b.name}</span>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>
                      ₹{Number(b.branch_revenue).toLocaleString()}
                      <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '12px', marginLeft: '6px' }}>
                        ({b.branch_orders} orders)
                      </span>
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-gold))',
                        borderRadius: '4px',
                        transition: 'width 0.6s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7-Day Revenue Trend Line Chart (SVG) */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px' }}>7-Day Revenue Trend</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <Calendar size={13} />
              <span>Daily Performance</span>
            </div>
          </div>

          {recentTrend.length > 0 ? (
            <div>
              <div style={{ height: '140px', width: '100%', position: 'relative', marginTop: '10px' }}>
                <svg viewBox="0 0 350 120" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e58e26" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#e58e26" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Draw filled area and polyline */}
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
                        <path d={areaD} fill="url(#chartGradient)" />
                        <path d={pathD} fill="none" stroke="#e58e26" strokeWidth="3" strokeLinecap="round" />
                        {points.map((p, idx) => (
                          <g key={idx}>
                            <circle cx={p.x} cy={p.y} r="5" fill="#f6b93b" stroke="#171514" strokeWidth="2" />
                            <text
                              x={p.x}
                              y={p.y - 10}
                              fill="#f8f6f0"
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
              No orders recorded in this date range.
            </div>
          )}
        </div>
      </div>

      {/* Second Row: Top Products & Payment Modes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Top 5 Best Selling Menu Items */}
        <div className="card">
          <h3 style={{ fontSize: '16px', marginBottom: '14px' }}>Top Selling Artisanal Items</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255, 255, 255, 0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: idx === 0 ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                      color: idx === 0 ? '#000' : 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700
                    }}
                  >
                    #{idx + 1}
                  </span>
                  <span style={{ fontWeight: 600 }}>{item.item_name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>₹{Number(item.total_sales).toLocaleString()}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.units_sold} cups/plates sold</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Channels Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: '16px', marginBottom: '14px' }}>Payment Method Settlement</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {paymentBreakdown.map((p, idx) => {
              const iconMap = {
                upi: <Smartphone size={18} color="#10b981" />,
                card: <CreditCard size={18} color="#3b82f6" />,
                cash: <Banknote size={18} color="#f59e0b" />
              };

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {iconMap[p.payment_method] || <CreditCard size={18} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '13px' }}>
                        {p.payment_method}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.count} transactions settled</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>
                    ₹{Number(p.amount).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders History Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px' }}>Live Order Ledger</h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Recent transactions across POS billing terminals</p>
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Branch</th>
                <th>Guest / Table</th>
                <th>Type</th>
                <th>Items Ordered</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-primary)' }}>
                      {order.order_number}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12.5px' }}>{order.branch_name}</span>
                  </td>
                  <td>
                    <div>{order.customer_name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.table_number}</div>
                  </td>
                  <td>
                    <span className={`badge ${order.order_type === 'dine_in' ? 'badge-success' : 'badge-warning'}`}>
                      {order.order_type === 'dine_in' ? 'Dine In' : 'Takeaway'}
                    </span>
                  </td>
                  <td style={{ fontSize: '12.5px', maxWidth: '240px' }}>
                    {order.items?.map((it) => `${it.quantity}x ${it.item_name}`).join(', ') || '-'}
                  </td>
                  <td>
                    <span style={{ textTransform: 'uppercase', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {order.payment_method}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--accent-gold)' }}>₹{Number(order.total_amount).toFixed(2)}</strong>
                  </td>
                  <td>
                    <button
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={() => onViewReceipt(order)}
                    >
                      <Receipt size={13} />
                      <span>Receipt</span>
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
