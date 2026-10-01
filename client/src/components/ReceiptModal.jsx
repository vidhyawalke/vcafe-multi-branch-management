import React from 'react';
import { X, Printer, CheckCircle } from 'lucide-react';

export default function ReceiptModal({ receiptData, onClose }) {
  if (!receiptData) return null;

  const items = receiptData.items || [];
  const branch = receiptData.branch || {
    name: 'VCafe Panjim (Flagship)',
    address: 'MG Road, Altinho, Panjim, Goa 403001',
    phone: '+91 832 242 1890',
    gstin: '30AABCV1234F1Z5'
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '420px', padding: '20px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-success)', fontSize: '13px', fontWeight: 600 }}>
            <CheckCircle size={16} />
            <span>Order Charged Successfully</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Thermal Print Receipt Simulation */}
        <div className="thermal-receipt">
          <div className="thermal-receipt-center">
            <div className="thermal-title">VCAFE ARTISANAL</div>
            <div style={{ fontSize: '11px', fontWeight: 600 }}>{branch.name}</div>
            <div style={{ fontSize: '10px', color: '#444' }}>{branch.address}</div>
            <div style={{ fontSize: '10px', color: '#444' }}>Tel: {branch.phone}</div>
            <div style={{ fontSize: '10px', color: '#444' }}>GSTIN: {branch.gstin || '30AABCV1234F1Z5'}</div>
          </div>

          <div className="thermal-divider" />

          <div className="thermal-line">
            <span>INVOICE #:</span>
            <strong>{receiptData.orderNumber}</strong>
          </div>
          <div className="thermal-line">
            <span>DATE:</span>
            <span>{new Date(receiptData.createdAt || Date.now()).toLocaleString()}</span>
          </div>
          <div className="thermal-line">
            <span>TABLE:</span>
            <span>{receiptData.tableNumber || receiptData.orderType}</span>
          </div>
          <div className="thermal-line">
            <span>GUEST:</span>
            <span>{receiptData.customerName || 'Walk-in'}</span>
          </div>
          <div className="thermal-line">
            <span>STAFF:</span>
            <span>{receiptData.staffName || 'Barista'}</span>
          </div>

          <div className="thermal-divider" />

          {/* Line Items */}
          <div style={{ margin: '8px 0' }}>
            {items.map((it, idx) => (
              <div key={idx} style={{ marginBottom: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                  <span>{it.name || it.item_name}</span>
                  <span>₹{(Number(it.subtotal) || Number(it.unitPrice || it.unit_price) * (it.quantity || it.qty)).toFixed(2)}</span>
                </div>
                <div style={{ fontSize: '10.5px', color: '#555' }}>
                  {it.quantity || it.qty} pcs @ ₹{Number(it.unitPrice || it.unit_price).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="thermal-divider" />

          {/* Totals */}
          <div className="thermal-line">
            <span>Subtotal:</span>
            <span>₹{Number(receiptData.subtotal).toFixed(2)}</span>
          </div>
          {Number(receiptData.discountAmount) > 0 && (
            <div className="thermal-line" style={{ color: '#090' }}>
              <span>Discount:</span>
              <span>-₹{Number(receiptData.discountAmount).toFixed(2)}</span>
            </div>
          )}
          <div className="thermal-line">
            <span>CGST (2.5%):</span>
            <span>₹{(Number(receiptData.taxAmount) / 2).toFixed(2)}</span>
          </div>
          <div className="thermal-line">
            <span>SGST (2.5%):</span>
            <span>₹{(Number(receiptData.taxAmount) / 2).toFixed(2)}</span>
          </div>

          <div className="thermal-total thermal-line">
            <span>TOTAL AMOUNT:</span>
            <span>₹{Number(receiptData.totalAmount).toFixed(2)}</span>
          </div>

          <div className="thermal-line" style={{ textTransform: 'uppercase', fontSize: '10.5px' }}>
            <span>Settled Via:</span>
            <strong>{receiptData.paymentMethod}</strong>
          </div>

          <div className="thermal-divider" />

          <div className="thermal-receipt-center" style={{ fontSize: '10.5px', color: '#555', marginTop: '10px' }}>
            <div>Thank you for visiting VCafe!</div>
            <div>Brewed with passion in Goa.</div>
            <div style={{ fontSize: '9px', marginTop: '4px' }}>Powered by VCafe Cloud ERP</div>
          </div>
        </div>

        {/* Print / Done Actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={handlePrint}>
            <Printer size={15} />
            <span>Print Thermal Bill</span>
          </button>
          <button className="btn-primary" style={{ flex: 1, margin: 0, justifyContent: 'center' }} onClick={onClose}>
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}
