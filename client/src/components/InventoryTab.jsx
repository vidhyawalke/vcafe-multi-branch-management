import React, { useState, useEffect } from 'react';
import {
  Package,
  AlertTriangle,
  ArrowRightLeft,
  PlusCircle,
  History,
  Store,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export default function InventoryTab({
  currentUser,
  onOpenRestock,
  onOpenTransfer
}) {
  const [inventory, setInventory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(
    currentUser?.branchId ? String(currentUser.branchId) : ''
  );
  const [activeSubView, setActiveSubView] = useState('stock'); // 'stock' | 'logs'
  const [loading, setLoading] = useState(true);

  const isOwnerOrManager = currentUser?.role === 'owner' || currentUser?.role === 'manager';

  useEffect(() => {
    if (currentUser?.role === 'manager' && currentUser.branchId) {
      setSelectedBranchId(String(currentUser.branchId));
    }
  }, [currentUser]);

  useEffect(() => {
    loadInventoryData();
  }, [selectedBranchId]);

  async function loadInventoryData() {
    setLoading(true);
    try {
      const [invRes, logsRes, branchRes] = await Promise.all([
        api.inventory.getInventory({ branchId: selectedBranchId || '' }),
        api.inventory.getLogs({ branchId: selectedBranchId || '', limit: 15 }),
        api.branches.getAll()
      ]);

      setInventory(invRes.data || []);
      setLogs(logsRes.data || []);
      setBranches(branchRes.data || []);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  }

  const lowStockItems = inventory.filter((i) => i.is_low_stock);

  return (
    <div>
      {/* Top Filter & Actions Header */}
      <div className="filter-bar">
        <div>
          <h2>Real-Time Inventory & Material Ledger</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Multi-branch stock levels, automated POS recipe consumption, and inter-outlet logistics
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Branch filter */}
          {currentUser?.role === 'owner' ? (
            <div className="branch-select-group">
              <Store size={16} color="var(--accent-primary)" />
              <select
                className="custom-select"
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
              >
                <option value="">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="branch-pill">
              <Store size={14} color="var(--accent-primary)" />
              <span>{currentUser?.branchName || 'Assigned Branch'}</span>
            </div>
          )}

          {/* Quick Action buttons */}
          {isOwnerOrManager && (
            <>
              <button className="btn-secondary" onClick={() => onOpenRestock(inventory)}>
                <PlusCircle size={15} />
                <span>Restock / Adjust</span>
              </button>

              <button className="btn-secondary" onClick={() => onOpenTransfer(inventory)}>
                <ArrowRightLeft size={15} />
                <span>Transfer Stock</span>
              </button>
            </>
          )}

          <button
            className="btn-secondary"
            style={{ padding: '8px 10px' }}
            onClick={loadInventoryData}
            title="Refresh Stock Levels"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Low Stock Warning Alert Banner */}
      {lowStockItems.length > 0 && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--status-danger)'
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--status-danger)', fontSize: '14px' }}>
                Stock Warning: {lowStockItems.length} material(s) reached minimum reorder threshold!
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                {lowStockItems.map((i) => `${i.item_name} at ${i.branch_name} (${i.current_stock} ${i.unit})`).join(' • ')}
              </div>
            </div>
          </div>

          {isOwnerOrManager && (
            <button
              className="btn-primary"
              style={{ width: 'auto', padding: '6px 14px', fontSize: '12.5px', margin: 0 }}
              onClick={() => onOpenRestock(lowStockItems[0])}
            >
              Restock Now
            </button>
          )}
        </div>
      )}

      {/* Sub Tabs: Live Stock vs Audit Logs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          className={`demo-persona-btn ${activeSubView === 'stock' ? 'active' : ''}`}
          onClick={() => setActiveSubView('stock')}
        >
          <Package size={14} />
          <span>Active Stock Inventory ({inventory.length})</span>
        </button>
        <button
          className={`demo-persona-btn ${activeSubView === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveSubView('logs')}
        >
          <History size={14} />
          <span>Stock Movement Audit Logs ({logs.length})</span>
        </button>
      </div>

      {activeSubView === 'stock' ? (
        /* Inventory Table */
        <div className="card" style={{ padding: 0 }}>
          <div className="data-table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ingredient / Material</th>
                  <th>Outlet Branch</th>
                  <th>Category</th>
                  <th>Available Stock</th>
                  <th>Min Safety Level</th>
                  <th>Stock Health Bar</th>
                  <th>Unit Cost</th>
                  <th>Status</th>
                  {isOwnerOrManager && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  const stock = Number(item.current_stock);
                  const min = Number(item.min_threshold);
                  const pct = Math.min(100, Math.round((stock / (min * 3)) * 100));

                  return (
                    <tr key={item.id}>
                      <td>
                        <strong style={{ fontSize: '13.5px' }}>{item.item_name}</strong>
                      </td>
                      <td>
                        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                          {item.branch_name}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            background: 'var(--bg-tertiary)',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '11.5px',
                            color: 'var(--text-muted)'
                          }}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td>
                        <strong style={{ fontSize: '14px', color: item.is_low_stock ? 'var(--status-danger)' : 'var(--text-primary)' }}>
                          {stock} {item.unit}
                        </strong>
                      </td>
                      <td>
                        <span style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
                          {min} {item.unit}
                        </span>
                      </td>
                      <td style={{ minWidth: '120px' }}>
                        <div style={{ width: '100%', height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.max(5, pct)}%`,
                              height: '100%',
                              background: item.is_low_stock ? 'var(--status-danger)' : 'var(--status-success)',
                              borderRadius: '3px'
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '12.5px' }}>₹{Number(item.cost_per_unit).toFixed(2)}</span>
                      </td>
                      <td>
                        {item.is_low_stock ? (
                          <span className="badge badge-danger">
                            <AlertTriangle size={11} /> Low Stock
                          </span>
                        ) : (
                          <span className="badge badge-success">
                            <CheckCircle2 size={11} /> Healthy
                          </span>
                        )}
                      </td>
                      {isOwnerOrManager && (
                        <td>
                          <button
                            className="btn-secondary"
                            style={{ padding: '3px 8px', fontSize: '11.5px' }}
                            onClick={() => onOpenRestock(item)}
                          >
                            + Restock
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Audit Logs Table */
        <div className="card" style={{ padding: 0 }}>
          <div className="data-table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Branch</th>
                  <th>Item</th>
                  <th>Movement Type</th>
                  <th>Quantity Delta</th>
                  <th>Audit Note</th>
                  <th>Authorized By</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const isPositive = Number(log.change_amount) > 0;
                  const typeLabelMap = {
                    order_deduction: 'POS Order Deduction',
                    manual_restock: 'Manual Replenishment',
                    spoilage_waste: 'Waste / Spoilage',
                    transfer_in: 'Transfer Received',
                    transfer_out: 'Transfer Dispatched'
                  };

                  return (
                    <tr key={log.id}>
                      <td style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td>{log.branch_name}</td>
                      <td>
                        <strong>{log.item_name}</strong>
                      </td>
                      <td>
                        <span className={`badge ${isPositive ? 'badge-success' : 'badge-warning'}`}>
                          {typeLabelMap[log.type] || log.type}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                            color: isPositive ? 'var(--status-success)' : 'var(--status-danger)'
                          }}
                        >
                          {isPositive ? `+${log.change_amount}` : log.change_amount} {log.unit}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{log.notes || '-'}</td>
                      <td>
                        <span style={{ fontSize: '12px' }}>{log.performed_by || 'System Automation'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
