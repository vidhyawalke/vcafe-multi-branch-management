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
      {/* Header and Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Raw Material Inventory & Stock Control</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
            Outlet-specific ingredient levels with automated POS recipe deductions
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {currentUser?.role === 'owner' ? (
            <select
              className="form-input-clean"
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              style={{ fontWeight: 500 }}
            >
              <option value="">All Outlets</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          ) : (
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--brand-primary)', background: '#ffffff', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: 'var(--radius-md)' }}>
              {currentUser?.branchName}
            </div>
          )}

          {isOwnerOrManager && (
            <>
              <button className="btn-solid-primary" style={{ padding: '8px 14px', width: 'auto' }} onClick={() => onOpenRestock(inventory)}>
                <PlusCircle size={15} />
                <span>Restock</span>
              </button>
              <button className="btn-outline-neutral" onClick={() => onOpenTransfer(inventory)}>
                <ArrowRightLeft size={15} />
                <span>Transfer</span>
              </button>
            </>
          )}

          <button className="btn-outline-neutral" style={{ padding: '8px 10px' }} onClick={loadInventoryData} title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Low Stock Warning Alert */}
      {lowStockItems.length > 0 && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} color="var(--status-danger)" />
            <div style={{ fontSize: '13px' }}>
              <strong style={{ color: 'var(--status-danger)' }}>Low Stock Warning:</strong>{' '}
              {lowStockItems.map((i) => `${i.item_name} at ${i.branch_name} (${i.current_stock} ${i.unit})`).join(' • ')}
            </div>
          </div>

          {isOwnerOrManager && (
            <button
              className="btn-solid-primary"
              style={{ padding: '4px 12px', fontSize: '11.5px', width: 'auto' }}
              onClick={() => onOpenRestock(lowStockItems[0])}
            >
              Restock Item
            </button>
          )}
        </div>
      )}

      {/* View Toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <button
          className={`persona-btn-pill ${activeSubView === 'stock' ? 'active' : ''}`}
          onClick={() => setActiveSubView('stock')}
        >
          Active Stock Items ({inventory.length})
        </button>
        <button
          className={`persona-btn-pill ${activeSubView === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveSubView('logs')}
        >
          Stock Movement Logs ({logs.length})
        </button>
      </div>

      {activeSubView === 'stock' ? (
        <div className="clean-card" style={{ padding: 0 }}>
          <div className="table-responsive" style={{ border: 'none' }}>
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Material Item</th>
                  <th>Branch Outlet</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Safety Min</th>
                  <th>Stock Health</th>
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
                        <strong>{item.item_name}</strong>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{item.branch_name}</td>
                      <td>
                        <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', color: '#475569' }}>
                          {item.category}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: item.is_low_stock ? 'var(--status-danger)' : 'var(--text-main)' }}>
                          {stock} {item.unit}
                        </strong>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>
                        {min} {item.unit}
                      </td>
                      <td style={{ minWidth: '100px' }}>
                        <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.max(6, pct)}%`,
                              height: '100%',
                              background: item.is_low_stock ? 'var(--status-danger)' : 'var(--status-success)',
                              borderRadius: '3px'
                            }}
                          />
                        </div>
                      </td>
                      <td>₹{Number(item.cost_per_unit).toFixed(2)}</td>
                      <td>
                        {item.is_low_stock ? (
                          <span className="pill-badge badge-red">Low Stock</span>
                        ) : (
                          <span className="pill-badge badge-green">Healthy</span>
                        )}
                      </td>
                      {isOwnerOrManager && (
                        <td>
                          <button
                            className="btn-outline-neutral"
                            style={{ padding: '3px 8px', fontSize: '11px' }}
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
        <div className="clean-card" style={{ padding: 0 }}>
          <div className="table-responsive" style={{ border: 'none' }}>
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Outlet</th>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Quantity Delta</th>
                  <th>Notes</th>
                  <th>Authorized By</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const isPositive = Number(log.change_amount) > 0;
                  const typeLabelMap = {
                    order_deduction: 'Order Consumption',
                    manual_restock: 'Supplier Restock',
                    spoilage_waste: 'Waste / Loss',
                    transfer_in: 'Transfer In',
                    transfer_out: 'Transfer Out'
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
                        <span className={`pill-badge ${isPositive ? 'badge-green' : 'badge-amber'}`}>
                          {typeLabelMap[log.type] || log.type}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: isPositive ? 'var(--status-success)' : 'var(--status-danger)', fontFamily: 'var(--font-mono)' }}>
                          {isPositive ? `+${log.change_amount}` : log.change_amount} {log.unit}
                        </strong>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{log.notes || '-'}</td>
                      <td>{log.performed_by || 'Auto Deduction'}</td>
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
