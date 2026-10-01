import React, { useState, useEffect } from 'react';
import { X, PackagePlus, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function RestockModal({ isOpen, onClose, selectedItem, allInventory, onSuccess }) {
  if (!isOpen) return null;

  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState(selectedItem?.branch_id || '1');
  const [itemId, setItemId] = useState(selectedItem?.inventory_item_id || '1');
  const [changeAmount, setChangeAmount] = useState('10');
  const [type, setType] = useState('manual_restock');
  const [notes, setNotes] = useState('Vendor morning replenishment delivery');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.branches.getAll().then((res) => {
      setBranches(res.data || []);
    });
  }, []);

  useEffect(() => {
    if (selectedItem) {
      if (selectedItem.branch_id) setBranchId(String(selectedItem.branch_id));
      if (selectedItem.inventory_item_id) setItemId(String(selectedItem.inventory_item_id));
    }
  }, [selectedItem]);

  const uniqueItems = Array.from(
    new Map((allInventory || []).map((i) => [i.inventory_item_id, i])).values()
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const amount = parseFloat(changeAmount);
      if (isNaN(amount) || amount === 0) {
        throw new Error('Please enter a valid non-zero quantity.');
      }

      const finalAmount = type === 'spoilage_waste' ? -Math.abs(amount) : Math.abs(amount);

      await api.inventory.adjustStock({
        branchId: Number(branchId),
        inventoryItemId: Number(itemId),
        changeAmount: finalAmount,
        type,
        notes: notes.trim()
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to adjust stock.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PackagePlus size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '18px' }}>Restock & Adjust Material</h3>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Target Outlet Branch
            </label>
            <select className="custom-select" style={{ width: '100%' }} value={branchId} onChange={(e) => setBranchId(e.target.value)}>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Raw Material Item
            </label>
            <select className="custom-select" style={{ width: '100%' }} value={itemId} onChange={(e) => setItemId(e.target.value)}>
              {uniqueItems.map((i) => (
                <option key={i.inventory_item_id} value={i.inventory_item_id}>
                  {i.item_name} ({i.unit})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                Adjustment Type
              </label>
              <select className="custom-select" style={{ width: '100%' }} value={type} onChange={(e) => setType(e.target.value)}>
                <option value="manual_restock">➕ Supplier Restock</option>
                <option value="spoilage_waste">➖ Waste / Spoilage</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                Quantity
              </label>
              <input
                type="number"
                step="0.1"
                className="custom-input"
                style={{ width: '100%' }}
                value={changeAmount}
                onChange={(e) => setChangeAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Audit Note / Reason
            </label>
            <input
              type="text"
              className="custom-input"
              style={{ width: '100%' }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Received weekly Arabica coffee bean crate from vendor"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="button" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 1, margin: 0, justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Updating...' : 'Confirm Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
