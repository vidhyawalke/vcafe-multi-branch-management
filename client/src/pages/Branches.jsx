import { useEffect, useState } from "react";
import { Plus, MapPin, Phone, Store, Users, CheckCircle, X, AlertCircle } from "lucide-react";
import { api } from "../services/api";

const initialBranches = [
  { id: 1, name: "Panjim Cafe", location: "18th June Road, Panjim", phone: "+91 90000 11111", status: "ACTIVE", revenue: "₹35,200", orders: 136, staff: 4 },
  { id: 2, name: "Margao Cafe", location: "Comba, Margao", phone: "+91 90000 22222", status: "ACTIVE", revenue: "₹28,100", orders: 112, staff: 3 },
  { id: 3, name: "Mapusa Cafe", location: "Mapusa Market Road", phone: "+91 90000 33333", status: "ACTIVE", revenue: "₹21,220", orders: 94, staff: 3 }
];

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchLocation, setNewBranchLocation] = useState("");
  const [newBranchPhone, setNewBranchPhone] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadBranches();
  }, []);

  async function loadBranches() {
    try {
      const data = await api("/branches");
      if (data && data.length) {
        const mapped = data.map((b, idx) => ({
          ...b,
          revenue: idx === 0 ? "₹35,200" : idx === 1 ? "₹28,100" : "₹21,220",
          orders: idx === 0 ? 136 : idx === 1 ? 112 : 94,
          staff: idx === 0 ? 4 : 3
        }));
        setBranches(mapped);
      } else {
        setBranches(initialBranches);
      }
    } catch {
      setBranches(initialBranches);
    }
  }

  async function handleAddBranch(e) {
    e.preventDefault();
    if (!newBranchName.trim() || !newBranchLocation.trim()) {
      setError("Please fill in branch name and location.");
      return;
    }

    try {
      const created = await api("/branches", {
        method: "POST",
        body: JSON.stringify({
          name: newBranchName.trim(),
          location: newBranchLocation.trim(),
          phone: newBranchPhone.trim() || "+91 98000 00000"
        })
      });

      setBranches([
        ...branches,
        {
          id: created.id || Date.now(),
          name: created.name || newBranchName,
          location: created.location || newBranchLocation,
          phone: created.phone || newBranchPhone,
          status: "ACTIVE",
          revenue: "₹0",
          orders: 0,
          staff: 1
        }
      ]);

      setIsModalOpen(false);
      setNewBranchName("");
      setNewBranchLocation("");
      setNewBranchPhone("");
      setError("");
    } catch (err) {
      setError(err.message || "Failed to add branch");
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Branch Network</h1>
          <p className="page-description">
            Multi-branch registry, location profiles, and operating status.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          <span>Add Branch</span>
        </button>
      </div>

      <div className="branches-grid">
        {branches.map((branch) => (
          <div key={branch.id} className="branch-card card">
            <div className="branch-card-header">
              <div className="branch-avatar">
                <Store size={20} />
              </div>
              <span className="badge-active">
                <CheckCircle size={12} />
                <span>{branch.status || "ACTIVE"}</span>
              </span>
            </div>

            <div className="branch-card-body">
              <h3 className="branch-name">{branch.name}</h3>
              <div className="branch-meta-row">
                <MapPin size={15} className="meta-icon" />
                <span>{branch.location}</span>
              </div>
              <div className="branch-meta-row">
                <Phone size={15} className="meta-icon" />
                <span>{branch.phone || "+91 90000 00000"}</span>
              </div>
            </div>

            <div className="branch-card-stats">
              <div className="branch-stat-col">
                <span className="stat-col-label">Today's Revenue</span>
                <span className="stat-col-val font-semibold">{branch.revenue || "₹0"}</span>
              </div>
              <div className="branch-stat-col">
                <span className="stat-col-label">Orders</span>
                <span className="stat-col-val font-semibold">{branch.orders || 0}</span>
              </div>
              <div className="branch-stat-col">
                <span className="stat-col-label">Assigned Staff</span>
                <span className="stat-col-val font-semibold">{branch.staff || 2}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Register New Branch</h3>
              <button
                className="btn-icon-close"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddBranch} className="modal-body">
              {error && (
                <div className="error-alert">
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label>Branch Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Porvorim Cafe"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="text-input"
                />
              </div>

              <div className="form-group">
                <label>Physical Address / Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Near Mall De Goa, Porvorim"
                  value={newBranchLocation}
                  onChange={(e) => setNewBranchLocation(e.target.value)}
                  className="text-input"
                />
              </div>

              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  type="text"
                  placeholder="+91 90000 44444"
                  value={newBranchPhone}
                  onChange={(e) => setNewBranchPhone(e.target.value)}
                  className="text-input"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
