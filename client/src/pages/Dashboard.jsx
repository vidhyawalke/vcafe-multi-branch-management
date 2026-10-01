import { useEffect, useState } from "react";
import { IndianRupee, ShoppingBag, Store, TrendingUp, ArrowUpRight } from "lucide-react";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { api } from "../services/api";

const demoOrders = [
  { id: 1024, customer_name: "Ananya Rao", branch_name: "Panjim Cafe", total_amount: 450, status: "COMPLETED", created_at: new Date() },
  { id: 1023, customer_name: "Rahul Nair", branch_name: "Margao Cafe", total_amount: 280, status: "PREPARING", created_at: new Date() },
  { id: 1022, customer_name: "Meera Shah", branch_name: "Mapusa Cafe", total_amount: 620, status: "COMPLETED", created_at: new Date() },
  { id: 1021, customer_name: "Aarav K.", branch_name: "Panjim Cafe", total_amount: 320, status: "READY", created_at: new Date() }
];

export default function Dashboard({ user }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api("/orders").then(setOrders).catch(() => setOrders(demoOrders));
  }, []);

  const visibleOrders = orders.length ? orders : demoOrders;
  const revenue = visibleOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">OVERVIEW</span>
          <h1>Good morning, {user?.name?.split(" ")[0] || "there"}.</h1>
          <p>Here’s what’s happening across your cafes today.</p>
        </div>
        <div className="date-chip">Thursday · 2 Oct 2026</div>
      </div>

      <div className="stats-grid">
        <StatCard icon={<IndianRupee size={19} />} label="Today's revenue" value={`₹${revenue.toLocaleString("en-IN")}`} note="+12.8% vs last week" trend="↗ 12.8%" />
        <StatCard icon={<ShoppingBag size={19} />} label="Orders today" value={visibleOrders.length + 318} note="24 currently in progress" trend="↗ 8.4%" />
        <StatCard icon={<Store size={19} />} label="Active branches" value="3" note="All branches operating" />
        <StatCard icon={<TrendingUp size={19} />} label="Average order" value="₹486" note="₹42 higher than last month" trend="↗ 6.1%" />
      </div>

      <div className="content-grid">
        <section className="panel orders-panel">
          <div className="panel-heading">
            <div>
              <h3>Recent orders</h3>
              <p>Your latest customer activity</p>
            </div>
            <button className="text-button">View all <ArrowUpRight size={15} /></button>
          </div>

          <div className="table">
            <div className="table-row table-header">
              <span>ORDER</span><span>BRANCH</span><span>AMOUNT</span><span>STATUS</span>
            </div>
            {visibleOrders.slice(0, 5).map(order => (
              <div className="table-row" key={order.id}>
                <span><strong>#{order.id}</strong><small>{order.customer_name}</small></span>
                <span>{order.branch_name}</span>
                <span>₹{Number(order.total_amount).toLocaleString("en-IN")}</span>
                <span><StatusBadge status={order.status} /></span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel branch-panel">
          <div className="panel-heading">
            <div>
              <h3>Branch pulse</h3>
              <p>Today's revenue by location</p>
            </div>
          </div>

          {[
            ["Panjim Cafe", "₹35,200", "82%"],
            ["Margao Cafe", "₹28,100", "66%"],
            ["Mapusa Cafe", "₹21,220", "51%"]
          ].map(([name, amount, width]) => (
            <div className="branch-stat" key={name}>
              <div className="branch-line"><span>{name}</span><strong>{amount}</strong></div>
              <div className="progress"><span style={{ width }} /></div>
            </div>
          ))}

          <div className="insight">
            <span>✦</span>
            <p><strong>Panjim is leading today.</strong><br />Revenue is 18% above its weekly average.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
