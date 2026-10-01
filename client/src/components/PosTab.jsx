import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  Store,
  CreditCard,
  Smartphone,
  Banknote,
  UtensilsCrossed,
  ShoppingBag
} from 'lucide-react';
import { api } from '../services/api';

export default function PosTab({ currentUser, onOrderComplete }) {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart state
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('Walk-in Guest');
  const [orderType, setOrderType] = useState('dine_in');
  const [tableNumber, setTableNumber] = useState('T-3');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active branch
  const [branches, setBranches] = useState([]);
  const [activeBranchId, setActiveBranchId] = useState(
    currentUser?.branchId ? String(currentUser.branchId) : '1'
  );

  useEffect(() => {
    if (currentUser?.branchId) {
      setActiveBranchId(String(currentUser.branchId));
    }
  }, [currentUser]);

  useEffect(() => {
    loadCatalog();
  }, []);

  async function loadCatalog() {
    try {
      const [catsRes, itemsRes, branchRes] = await Promise.all([
        api.menu.getCategories(),
        api.menu.getItems({ availableOnly: 'true' }),
        api.branches.getAll()
      ]);
      setCategories(catsRes.data || []);
      setMenuItems(itemsRes.data || []);
      setBranches(branchRes.data || []);
    } catch (err) {
      console.error('Failed to load menu catalog:', err);
    }
  }

  function addToCart(item) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }

  function updateQty(itemId, delta) {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.id === itemId) {
            const newQty = i.qty + delta;
            return newQty > 0 ? { ...i, qty: newQty } : null;
          }
          return i;
        })
        .filter(Boolean)
    );
  }

  function removeFromCart(itemId) {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  }

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);
  const discount = Math.min(subtotal, Math.max(0, Number(discountAmount) || 0));
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Number((taxableAmount * 0.05).toFixed(2)); // 5% GST
  const total = Number((taxableAmount + tax).toFixed(2));

  async function handleCheckout() {
    if (cart.length === 0) return;

    setIsSubmitting(true);
    try {
      const payload = {
        branchId: Number(activeBranchId),
        customerName: customerName || 'Walk-in Guest',
        orderType,
        tableNumber: orderType === 'dine_in' ? tableNumber : 'Takeaway',
        paymentMethod,
        discountAmount: discount,
        items: cart.map((i) => ({
          menuItemId: i.id,
          quantity: i.qty
        }))
      };

      const res = await api.orders.createOrder(payload);
      if (res.success) {
        // Clear cart
        setCart([]);
        setCustomerName('Walk-in Guest');
        setDiscountAmount(0);
        // Trigger receipt modal
        onOrderComplete(res.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to process order.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Filtered menu
  const filteredItems = menuItems.filter((item) => {
    const matchesCat = !selectedCategory || String(item.category_id) === String(selectedCategory);
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const selectedBranch = branches.find((b) => String(b.id) === String(activeBranchId));

  return (
    <div className="pos-layout">
      {/* Left: Menu Catalog and Filters */}
      <div>
        {/* Terminal Header */}
        <div className="filter-bar" style={{ marginBottom: '14px' }}>
          <div>
            <h2>Point of Sale Terminal</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px' }}>
              Instant touch-order checkout with real-time inventory deduction
            </p>
          </div>

          {currentUser?.role === 'owner' ? (
            <div className="branch-select-group">
              <Store size={16} color="var(--accent-primary)" />
              <select
                className="custom-select"
                value={activeBranchId}
                onChange={(e) => setActiveBranchId(e.target.value)}
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="branch-pill">
              <Store size={14} color="var(--accent-primary)" />
              <span>{selectedBranch?.name || currentUser?.branchName || 'Assigned Terminal'}</span>
            </div>
          )}
        </div>

        {/* Search bar & Category filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              className="custom-input"
              style={{ width: '100%', paddingLeft: '36px' }}
              placeholder="Search coffee, bakery, bites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="category-chips">
          <button
            className={`category-chip ${selectedCategory === '' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('')}
          >
            All Items ({menuItems.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`category-chip ${String(selectedCategory) === String(c.id) ? 'active' : ''}`}
              onClick={() => setSelectedCategory(String(c.id))}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="menu-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="menu-card" onClick={() => addToCart(item)}>
              <img src={item.image_url} alt={item.name} className="menu-card-img" />
              <div className="menu-card-body">
                <div className="menu-card-title">{item.name}</div>
                <div className="menu-card-desc">{item.description}</div>
                <div className="menu-card-footer">
                  <div className="menu-price">₹{Number(item.price).toFixed(0)}</div>
                  <button
                    className="btn-add-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item);
                    }}
                  >
                    <Plus size={13} style={{ display: 'inline', verticalAlign: '-1px' }} /> Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Cart and Billing Panel */}
      <div className="cart-card">
        <div className="cart-header">
          <div>
            <h3 style={{ fontSize: '16px' }}>Active Ticket</h3>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Terminal: {selectedBranch?.name || 'Panjim Flagship'}
            </div>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Trash2 size={13} /> Clear
            </button>
          )}
        </div>

        {/* Order Meta Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '12px 0' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Guest Name</label>
            <input
              type="text"
              className="custom-input"
              style={{ width: '100%', padding: '6px 10px', fontSize: '12.5px' }}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Order Type</label>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                className={`custom-input ${orderType === 'dine_in' ? 'active' : ''}`}
                style={{
                  flex: 1,
                  padding: '6px 4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  background: orderType === 'dine_in' ? 'var(--accent-primary)' : 'var(--bg-input)',
                  color: orderType === 'dine_in' ? '#000' : 'var(--text-primary)',
                  fontWeight: 600
                }}
                onClick={() => setOrderType('dine_in')}
              >
                Dine In
              </button>
              <button
                type="button"
                className={`custom-input ${orderType === 'takeaway' ? 'active' : ''}`}
                style={{
                  flex: 1,
                  padding: '6px 4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  background: orderType === 'takeaway' ? 'var(--accent-primary)' : 'var(--bg-input)',
                  color: orderType === 'takeaway' ? '#000' : 'var(--text-primary)',
                  fontWeight: 600
                }}
                onClick={() => setOrderType('takeaway')}
              >
                Takeaway
              </button>
            </div>
          </div>
        </div>

        {orderType === 'dine_in' && (
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Table Number</label>
            <input
              type="text"
              className="custom-input"
              style={{ width: '100%', padding: '6px 10px', fontSize: '12.5px' }}
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g. T-1, T-4, Sea-2"
            />
          </div>
        )}

        {/* Cart Item Rows */}
        <div className="cart-items-list">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
              <ShoppingBag size={36} strokeWidth={1.5} style={{ opacity: 0.4, marginBottom: '8px' }} />
              <p style={{ fontSize: '13px' }}>Your active cart is empty</p>
              <p style={{ fontSize: '11.5px' }}>Click any menu item to begin ticket</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item-row">
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--accent-gold)' }}>
                    ₹{item.price} × {item.qty} = ₹{(Number(item.price) * item.qty).toFixed(2)}
                  </div>
                </div>

                <div className="cart-qty-ctrl">
                  <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>
                    <Minus size={12} />
                  </button>
                  <span className="qty-val">{item.qty}</span>
                  <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Payment mode selection */}
        {cart.length > 0 && (
          <div style={{ margin: '10px 0 8px 0' }}>
            <label style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Payment Settlement
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              <button
                type="button"
                className={`demo-persona-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
                style={{ justifyContent: 'center', padding: '6px 4px' }}
                onClick={() => setPaymentMethod('upi')}
              >
                <Smartphone size={13} />
                <span>UPI</span>
              </button>
              <button
                type="button"
                className={`demo-persona-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                style={{ justifyContent: 'center', padding: '6px 4px' }}
                onClick={() => setPaymentMethod('card')}
              >
                <CreditCard size={13} />
                <span>Card</span>
              </button>
              <button
                type="button"
                className={`demo-persona-btn ${paymentMethod === 'cash' ? 'active' : ''}`}
                style={{ justifyContent: 'center', padding: '6px 4px' }}
                onClick={() => setPaymentMethod('cash')}
              >
                <Banknote size={13} />
                <span>Cash</span>
              </button>
            </div>
          </div>
        )}

        {/* Totals & Submit */}
        <div className="cart-summary">
          <div className="summary-line">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-line">
            <span>GST (5%)</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          <div className="summary-line total">
            <span>Total Payable</span>
            <span className="price">₹{total.toFixed(2)}</span>
          </div>

          <button
            className="btn-primary"
            disabled={cart.length === 0 || isSubmitting}
            onClick={handleCheckout}
            style={{ opacity: cart.length === 0 ? 0.5 : 1 }}
          >
            <Receipt size={17} />
            <span>{isSubmitting ? 'Processing...' : `Charge ₹${total.toFixed(2)} & Print`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
