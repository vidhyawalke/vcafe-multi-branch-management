import { MapPin, Phone, Plus, ArrowUpRight } from "lucide-react";

const branches = [
  { name: "Panjim Cafe", location: "18th June Road, Panjim", phone: "+91 90000 11111", revenue: "₹35,200", orders: 126, initials: "PC" },
  { name: "Margao Cafe", location: "Comba, Margao", phone: "+91 90000 22222", revenue: "₹28,100", orders: 98, initials: "MC" },
  { name: "Mapusa Cafe", location: "Mapusa Market Road", phone: "+91 90000 33333", revenue: "₹21,220", orders: 84, initials: "MP" }
];

export default function Branches() {
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">BUSINESS</span>
          <h1>Branches</h1>
          <p>One view of every cafe in your network.</p>
        </div>
        <button className="primary-button"><Plus size={17} /> Add branch</button>
      </div>

      <div className="branch-grid">
        {branches.map(branch => (
          <article className="branch-card" key={branch.name}>
            <div className="branch-card-top">
              <div className="branch-logo">{branch.initials}</div>
              <span className="active-pill"><i /> Active</span>
            </div>
            <h2>{branch.name}</h2>
            <div className="branch-contact"><MapPin size={15} /> {branch.location}</div>
            <div className="branch-contact"><Phone size={15} /> {branch.phone}</div>

            <div className="branch-metrics">
              <div><small>Today's revenue</small><strong>{branch.revenue}</strong></div>
              <div><small>Orders</small><strong>{branch.orders}</strong></div>
            </div>

            <button className="branch-link">View branch <ArrowUpRight size={15} /></button>
          </article>
        ))}
      </div>
    </div>
  );
}
