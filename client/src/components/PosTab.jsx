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
  ShoppingBag,
  Coffee,
  CupSoda,
  Croissant,
  Sandwich
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
  const [tableNumber, setTableNumber] = useState('T-2');
  const [paymentMethod, setPaymentMethod] = useState('upi');
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

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);
  const tax = Number((subtotal * 0.05).toFixed(2)); // 5% GST
  const total = Number((subtotal + tax).toFixed(2));

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
        discountAmount: 0,
        items: cart.map((i) => ({
          menuItemId: i.id,
          quantity: i.qty
        }))
      };

      const res = await api.orders.createOrder(payload);
      if (res.success) {
        setCart([]);
        setCustomerName('Walk-in Guest');
        onOrderComplete(res.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to process order.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const categoryIconMap = {
    espresso: <Coffee size={16} />,
    'cold-brews': <CupSoda size={16} />,
    bakery: <Croissant size={16} />,
    bites: <Sandwich size={16} />
  };

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
    <div className="pos-container">
      {/* Left Menu Section */}
      <div>
        {/* Top Controls: Search + Branch Selector */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
            />
            <input
              type="text"
              className="form-input-clean"
              style={{ width: '100%', paddingLeft: '36px' }}
              placeholder="Search coffee, bakery, bites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {currentUser?.role === 'owner' ? (
            <select
              className="form-input-clean"
              value={activeBranchId}
              onChange={(e) => setActiveBranchId(e.target.value)}
              style={{ fontWeight: 500 }}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          ) : (
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--brand-primary)',
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)'
              }}
            >
              {selectedBranch?.name || currentUser?.branchName}
            </div>
          )}
        </div>

        {/* Category Pills (GoMeal Style) */}
        <div className="category-scroller">
          <button
            className={`category-btn-card ${selectedCategory === '' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('')}
          >
            <span>All Items</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`category-btn-card ${String(selectedCategory) === String(c.id) ? 'active' : ''}`}
              onClick={() => setSelectedCategory(String(c.id))}
            >
              {categoryIconMap[c.slug] || <Coffee size={16} />}
              <span>{c.name}</span>
            </button>
          ))}
        </div>

        {/* Food & Beverage Cards Grid */}
        <div className="menu-catalog-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="food-card" onClick={() => addToCart(item)}>
              <img src={item.image_url} alt={item.name} className="food-card-img" />
              <div className="food-card-content">
                <div className="food-title">{item.name}</div>
                <div className="food-desc">{item.description}</div>
                <div className="food-footer">
                  <div className="food-price">₹{Number(item.price).toFixed(0)}</div>
                  <button
                    className="btn-quick-add"
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

      {/* Right Order Bill Drawer */}
      <div className="order-cart-box">
        <div className="cart-title-row">
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Current Bill Ticket</h3>
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

        {/* Guest Name & Dine In / Takeaway */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '12px 0' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Customer Name</label>
            <input
              type="text"
              className="form-input-clean"
              style={{ width: '100%', padding: '6px 10px', fontSize: '12.5px' }}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Dining Mode</label>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '6px 4px',
                  fontSize: '11px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  background: orderType === 'dine_in' ? 'var(--brand-primary)' : '#ffffff',
                  color: orderType === 'dine_in' ? '#ffffff' : 'var(--text-main)',
                  fontWeight: 600
                }}
                onClick={() => setOrderType('dine_in')}
              >
                Dine In
              </button>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '6px 4px',
                  fontSize: '11px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  background: orderType === 'takeaway' ? 'var(--brand-primary)' : '#ffffff',
                  color: orderType === 'takeaway' ? '#ffffff' : 'var(--text-main)',
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
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Table Assigned</label>
            <input
              type="text"
              className="form-input-clean"
              style={{ width: '100%', padding: '6px 10px', fontSize: '12.5px' }}
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g. T-1, T-4, Sea-2"
            />
          </div>
        )}

        {/* Cart Items List */}
        <div className="cart-items-scroll">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-light)' }}>
              <ShoppingBag size={34} strokeWidth={1.5} style={{ opacity: 0.4, marginBottom: '6px' }} />
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Ticket is empty</p>
              <p style={{ fontSize: '11.5px' }}>Click any menu item to add</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-row">
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--brand-primary)', fontWeight: 600 }}>
                    ₹{item.price} × {item.qty} = ₹{(Number(item.price) * item.qty).toFixed(2)}
                  </div>
                </div>

                <div className="qty-controller">
                  <button className="qty-btn-icon" onClick={() => updateQty(item.id, -1)}>
                    <Minus size={11} />
                  </button>
                  <span style={{ fontSize: '12px', fontWeight: 600, minWidth: '14px', textAlign: 'center' }}>
                    {item.qty}
                  </span>
                  <button className="qty-btn-icon" onClick={() => updateQty(item.id, 1)}>
                    <Plus size={11} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Payment mode selection */}
        {cart.length > 0 && (
          <div style={{ margin: '8px 0' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>
              Payment Mode
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              <button
                type="button"
                className={`persona-btn-pill ${paymentMethod === 'upi' ? 'active' : ''}`}
                style={{ justifyContent: 'center', padding: '6px 4px', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setPaymentMethod('upi')}
              >
                <Smartphone size={13} />
                <span>UPI</span>
              </button>
              <button
                type="button"
                className={`persona-btn-pill ${paymentMethod === 'card' ? 'active' : ''}`}
                style={{ justifyContent: 'center', padding: '6px 4px', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setPaymentMethod('card')}
              >
                <CreditCard size={13} />
                <span>Card</span>
              </button>
              <button
                type="button"
                className={`persona-btn-pill ${paymentMethod === 'cash' ? 'active' : ''}`}
                style={{ justifyContent: 'center', padding: '6px 4px', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setPaymentMethod('cash')}
              >
                <Banknote size={13} />
                <span>Cash</span>
              </button>
            </div>
          </div>
        )}

        {/* Totals & Submit */}
        <div className="cart-totals-section">
          <div className="bill-line">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="bill-line">
            <span>GST (5%)</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          <div className="bill-line grand-total">
            <span>Total Payable</span>
            <span style={{ color: 'var(--brand-primary)' }}>₹{total.toFixed(2)}</span>
          </div>

          <button
            className="btn-solid-primary"
            style={{ marginTop: '10px' }}
            disabled={cart.length === 0 || isSubmitting}
            onClick={handleCheckout}
          >
            <Receipt size={16} />
            <span>{isSubmitting ? 'Processing Bill...' : `Charge ₹${total.toFixed(2)} & Print`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
