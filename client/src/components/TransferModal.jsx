import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function TransferModal({ isOpen, onClose, allInventory, onSuccess }) {
  if (!isOpen) return null;

  const [branches, setBranches] = useState([]);
  const [fromBranchId, setFromBranchId] = useState('1'); // Panjim
  const [toBranchId, setToBranchId] = useState('2'); // Anjuna
  const [itemId, setItemId] = useState('1');
  const [quantity, setQuantity] = useState('5');
  const [notes, setNotes] = useState('Rush transfer to cover weekend peak');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.branches.getAll().then((res) => {
      setBranches(res.data || []);
    });
  }, []);

  const uniqueItems = Array.from(
    new Map((allInventory || []).map((i) => [i.inventory_item_id, i])).values()
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (fromBranchId === toBranchId) {
        throw new Error('Source branch and Destination branch cannot be the same.');
      }

      const qty = parseFloat(quantity);
      if (isNaN(qty) || qty <= 0) {
        throw new Error('Please enter a valid positive quantity.');
      }

      await api.inventory.transferStock({
        fromBranchId: Number(fromBranchId),
        toBranchId: Number(toBranchId),
        inventoryItemId: Number(itemId),
        quantity: qty,
        notes: notes.trim()
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Transfer failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowRightLeft size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '18px' }}>Inter-Branch Stock Transfer</h3>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                Dispatch From (Source)
              </label>
              <select className="custom-select" style={{ width: '100%' }} value={fromBranchId} onChange={(e) => setFromBranchId(e.target.value)}>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                Receive At (Destination)
              </label>
              <select className="custom-select" style={{ width: '100%' }} value={toBranchId} onChange={(e) => setToBranchId(e.target.value)}>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Material / Ingredient
            </label>
            <select className="custom-select" style={{ width: '100%' }} value={itemId} onChange={(e) => setItemId(e.target.value)}>
              {uniqueItems.map((i) => (
                <option key={i.inventory_item_id} value={i.inventory_item_id}>
                  {i.item_name} ({i.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Transfer Quantity
            </label>
            <input
              type="number"
              step="0.1"
              className="custom-input"
              style={{ width: '100%' }}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Transfer Logistics Note
            </label>
            <input
              type="text"
              className="custom-input"
              style={{ width: '100%' }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Sent via internal delivery rider"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="button" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 1, margin: 0, justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Transferring...' : 'Authorize Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
