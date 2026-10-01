import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { api } from "../services/api";

const demoOrders = [
  { id: 1024, customer_name: "Ananya Rao", branch_name: "Panjim Cafe", total_amount: 450, status: "COMPLETED", created_at: new Date() },
  { id: 1023, customer_name: "Rahul Nair", branch_name: "Margao Cafe", total_amount: 280, status: "PREPARING", created_at: new Date() },
  { id: 1022, customer_name: "Meera Shah", branch_name: "Mapusa Cafe", total_amount: 620, status: "COMPLETED", created_at: new Date() },
  { id: 1021, customer_name: "Aarav K.", branch_name: "Panjim Cafe", total_amount: 320, status: "READY", created_at: new Date() },
  { id: 1020, customer_name: "Sana Pinto", branch_name: "Margao Cafe", total_amount: 510, status: "PENDING", created_at: new Date() }
];

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api("/orders").then(setOrders).catch(() => setOrders(demoOrders));
  }, []);

  const data = orders.length ? orders : demoOrders;

  async function changeStatus(id, status) {
    try {
      const updated = await api(`/orders/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status })
      });
      setOrders(current => current.map(o => o.id === id ? updated : o));
    } catch {
      setOrders(current => current.map(o => o.id === id ? { ...o, status } : o));
    }
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">OPERATIONS</span>
          <h1>Orders</h1>
          <p>Keep every order moving smoothly.</p>
        </div>
        <button className="primary-button"><Plus size={17} /> New order</button>
      </div>

      <div className="toolbar">
        <div className="search"><Search size={17} /><input placeholder="Search orders or customers..." /></div>
        <div className="filter-pills">
          <button className="filter active">All</button>
          <button className="filter">Pending</button>
          <button className="filter">Preparing</button>
          <button className="filter">Ready</button>
        </div>
      </div>

      <section className="panel">
        <div className="table order-table">
          <div className="table-row table-header">
            <span>ORDER</span><span>BRANCH</span><span>AMOUNT</span><span>STATUS</span><span>ACTION</span>
          </div>
          {data.map(order => (
            <div className="table-row" key={order.id}>
              <span><strong>#{order.id}</strong><small>{order.customer_name}</small></span>
              <span>{order.branch_name}</span>
              <span>₹{Number(order.total_amount).toLocaleString("en-IN")}</span>
              <span><StatusBadge status={order.status} /></span>
              <span>
                <select
                  className="status-select"
                  value={order.status}
                  onChange={e => changeStatus(order.id, e.target.value)}
                >
                  <option>PENDING</option>
                  <option>PREPARING</option>
                  <option>READY</option>
                  <option>COMPLETED</option>
                  <option>CANCELLED</option>
                </select>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
