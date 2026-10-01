import { useEffect, useState } from "react";
import { Plus, Search, Filter, ShoppingCart, CheckCircle, X, AlertCircle } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { api } from "../services/api";

const initialOrders = [
  { id: 1024, customer_name: "Ananya Rao", branch_name: "Panjim Cafe", total_amount: 450, status: "COMPLETED", created_at: "11:20 AM" },
  { id: 1023, customer_name: "Rahul Nair", branch_name: "Margao Cafe", total_amount: 280, status: "PREPARING", created_at: "11:14 AM" },
  { id: 1022, customer_name: "Meera Shah", branch_name: "Mapusa Cafe", total_amount: 620, status: "COMPLETED", created_at: "10:55 AM" },
  { id: 1021, customer_name: "Aarav Kulkarni", branch_name: "Panjim Cafe", total_amount: 320, status: "READY", created_at: "10:40 AM" },
  { id: 1020, customer_name: "Sana Pinto", branch_name: "Margao Cafe", total_amount: 510, status: "PENDING", created_at: "10:25 AM" }
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState(1);
  const [cart, setCart] = useState([
    { menu_item_id: 1, name: "Cappuccino", price: 150, quantity: 2 },
    { menu_item_id: 4, name: "Paneer Sandwich", price: 180, quantity: 1 }
  ]);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const data = await api("/orders");
      setOrders(data.length ? data : initialOrders);
    } catch {
      setOrders(initialOrders);
    }
  }

  async function handleStatusChange(orderId, newStatus) {
    try {
      const updated = await api(`/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus })
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o))
      );
    } catch {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    }
  }

  async function handleCreateOrder(e) {
    e.preventDefault();
    if (!customerName.trim()) {
      setSubmitError("Please enter a customer name");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const orderPayload = {
        customer_name: customerName.trim(),
        branch_id: Number(selectedBranchId),
        items: cart.map((c) => ({
          menu_item_id: c.menu_item_id,
          quantity: c.quantity
        }))
      };

      const result = await api("/orders", {
        method: "POST",
        body: JSON.stringify(orderPayload)
      });

      const branchName =
        Number(selectedBranchId) === 1
          ? "Panjim Cafe"
          : Number(selectedBranchId) === 2
          ? "Margao Cafe"
          : "Mapusa Cafe";

      const newOrderObj = {
        id: result.id || Math.floor(1000 + Math.random() * 9000),
        customer_name: customerName,
        branch_name: branchName,
        total_amount: result.total || cartTotal,
        status: "PENDING",
        created_at: "Just now"
      };

      setOrders([newOrderObj, ...orders]);
      setSubmitSuccess("Order placed successfully!");
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess("");
        setCustomerName("");
      }, 1200);
    } catch (err) {
      setSubmitError(err.message || "Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateQuantity(index, delta) {
    setCart((prev) => {
      const next = [...prev];
      const newQty = next[index].quantity + delta;
      if (newQty <= 0) {
        next.splice(index, 1);
      } else {
        next[index].quantity = newQty;
      }
      return next;
    });
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search);
    const matchesStatus =
      statusFilter === "ALL" || o.status?.toUpperCase() === statusFilter;
    const matchesBranch =
      branchFilter === "ALL" ||
      o.branch_name?.toLowerCase().includes(branchFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesBranch;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Order Management & POS</h1>
          <p className="page-description">
            Process orders, manage preparation workflows, and track tickets.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          <span>New Order</span>
        </button>
      </div>

      <div className="filters-bar card">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by customer name or order #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <select
            className="select-input"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          >
            <option value="ALL">All Branches</option>
            <option value="Panjim">Panjim Cafe</option>
            <option value="Margao">Margao Cafe</option>
            <option value="Mapusa">Mapusa Cafe</option>
          </select>

          <div className="status-filter-pills">
            {["ALL", "PENDING", "PREPARING", "READY", "COMPLETED"].map((st) => (
              <button
                key={st}
                className={`filter-pill ${statusFilter === st ? "active" : ""}`}
                onClick={() => setStatusFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Branch</th>
                <th>Total</th>
                <th>Status</th>
                <th>Workflow Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state-cell">
                    No orders match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-mono">#{order.id}</td>
                    <td className="font-medium">{order.customer_name}</td>
                    <td className="text-muted">{order.branch_name || "Panjim Cafe"}</td>
                    <td className="font-semibold">
                      ₹{Number(order.total_amount).toLocaleString("en-IN")}
                    </td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td>
                      <select
                        className="select-input select-sm"
                        value={order.status || "PENDING"}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PREPARING">PREPARING</option>
                        <option value="READY">READY</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-title-group">
                <ShoppingCart size={18} />
                <h3>Create New Order</h3>
              </div>
              <button
                className="btn-icon-close"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="modal-body">
              {submitError && (
                <div className="error-alert">
                  <AlertCircle size={15} />
                  <span>{submitError}</span>
                </div>
              )}
              {submitSuccess && (
                <div className="success-alert">
                  <CheckCircle size={15} />
                  <span>{submitSuccess}</span>
                </div>
              )}

              <div className="form-group">
                <label>Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="text-input"
                />
              </div>

              <div className="form-group">
                <label>Cafe Branch</label>
                <select
                  className="select-input w-full"
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(Number(e.target.value))}
                >
                  <option value={1}>Panjim Cafe (18th June Road)</option>
                  <option value={2}>Margao Cafe (Comba)</option>
                  <option value={3}>Mapusa Cafe (Market Road)</option>
                </select>
              </div>

              <div className="order-items-builder">
                <label className="section-label">Order Items</label>
                <div className="items-list">
                  {cart.map((item, idx) => (
                    <div key={item.menu_item_id} className="item-row">
                      <div className="item-info">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted">₹{item.price} each</span>
                      </div>
                      <div className="qty-controls">
                        <button
                          type="button"
                          className="btn-qty"
                          onClick={() => updateQuantity(idx, -1)}
                        >
                          -
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          type="button"
                          className="btn-qty"
                          onClick={() => updateQuantity(idx, 1)}
                        >
                          +
                        </button>
                      </div>
                      <span className="item-subtotal">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="cart-summary-box">
                  <span>Total Amount</span>
                  <span className="summary-total">₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting || cart.length === 0}
                >
                  {isSubmitting ? "Placing order..." : "Place Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
