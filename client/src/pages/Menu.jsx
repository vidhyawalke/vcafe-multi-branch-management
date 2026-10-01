import { useEffect, useState } from "react";
import { Plus, Coffee, UtensilsCrossed, Cake, Check, X, Store, AlertCircle } from "lucide-react";
import { api } from "../services/api";

const initialMenu = [
  { id: 1, name: "Cappuccino", category: "Coffee", price: 150, available: true, branch_name: "Panjim Cafe" },
  { id: 2, name: "Iced Latte", category: "Coffee", price: 170, available: true, branch_name: "Panjim Cafe" },
  { id: 3, name: "Americano", category: "Coffee", price: 120, available: true, branch_name: "Panjim Cafe" },
  { id: 4, name: "Paneer Sandwich", category: "Food", price: 180, available: true, branch_name: "Panjim Cafe" },
  { id: 5, name: "Cheesecake", category: "Dessert", price: 220, available: false, branch_name: "Panjim Cafe" },
  { id: 6, name: "Cold Brew", category: "Coffee", price: 180, available: true, branch_name: "Margao Cafe" },
  { id: 7, name: "Veg Wrap", category: "Food", price: 160, available: true, branch_name: "Margao Cafe" },
  { id: 8, name: "Brownie", category: "Dessert", price: 140, available: true, branch_name: "Margao Cafe" },
  { id: 9, name: "Mocha", category: "Coffee", price: 190, available: true, branch_name: "Mapusa Cafe" },
  { id: 10, name: "Club Sandwich", category: "Food", price: 220, available: true, branch_name: "Mapusa Cafe" },
  { id: 11, name: "Tiramisu", category: "Dessert", price: 240, available: true, branch_name: "Mapusa Cafe" }
];

export default function Menu() {
  const [menu, setMenu] = useState([]);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Coffee");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemBranch, setNewItemBranch] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMenu();
  }, []);

  async function loadMenu() {
    try {
      const data = await api("/menu");
      setMenu(data.length ? data : initialMenu);
    } catch {
      setMenu(initialMenu);
    }
  }

  function toggleAvailability(id) {
    setMenu((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, available: !item.available } : item
      )
    );
  }

  async function handleAddItem(e) {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const payload = {
        name: newItemName.trim(),
        category: newItemCategory,
        price: Number(newItemPrice),
        branch_id: Number(newItemBranch)
      };

      const created = await api("/menu", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      const branchName =
        Number(newItemBranch) === 1
          ? "Panjim Cafe"
          : Number(newItemBranch) === 2
          ? "Margao Cafe"
          : "Mapusa Cafe";

      setMenu([
        {
          id: created.id || Date.now(),
          name: newItemName,
          category: newItemCategory,
          price: Number(newItemPrice),
          available: true,
          branch_name: branchName
        },
        ...menu
      ]);

      setIsModalOpen(false);
      setNewItemName("");
      setNewItemPrice("");
      setError("");
    } catch (err) {
      setError(err.message || "Failed to add menu item");
    }
  }

  const filteredItems = menu.filter((item) => {
    const matchesCategory =
      activeCategory === "ALL" ||
      item.category?.toUpperCase() === activeCategory;
    const matchesBranch =
      selectedBranch === "ALL" ||
      item.branch_name?.toLowerCase().includes(selectedBranch.toLowerCase());
    return matchesCategory && matchesBranch;
  });

  function getCategoryIcon(cat) {
    switch (cat?.toLowerCase()) {
      case "coffee":
        return <Coffee size={16} />;
      case "food":
        return <UtensilsCrossed size={16} />;
      case "dessert":
        return <Cake size={16} />;
      default:
        return <Coffee size={16} />;
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Menu Catalogue</h1>
          <p className="page-description">
            Branch-specific menus, item pricing, and availability management.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          <span>Add Menu Item</span>
        </button>
      </div>

      <div className="filters-bar card">
        <div className="category-filter-pills">
          {["ALL", "COFFEE", "FOOD", "DESSERT"].map((cat) => (
            <button
              key={cat}
              className={`filter-pill ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="branch-select-wrapper">
          <Store size={15} className="select-icon" />
          <select
            className="select-input"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="ALL">All Branch Menus</option>
            <option value="Panjim">Panjim Cafe</option>
            <option value="Margao">Margao Cafe</option>
            <option value="Mapusa">Mapusa Cafe</option>
          </select>
        </div>
      </div>

      <div className="menu-cards-grid">
        {filteredItems.map((item) => (
          <div key={item.id} className="menu-card">
            <div className="menu-card-header">
              <div className="menu-category-tag">
                {getCategoryIcon(item.category)}
                <span>{item.category}</span>
              </div>
              <button
                type="button"
                className={`availability-toggle-btn ${item.available ? "is-available" : "is-unavailable"}`}
                onClick={() => toggleAvailability(item.id)}
                title="Click to toggle availability"
              >
                {item.available ? <Check size={13} /> : <X size={13} />}
                <span>{item.available ? "In Stock" : "Unavailable"}</span>
              </button>
            </div>

            <div className="menu-card-body">
              <h3 className="menu-item-name">{item.name}</h3>
              <span className="menu-branch-label">{item.branch_name || "Panjim Cafe"}</span>
            </div>

            <div className="menu-card-footer">
              <span className="menu-price">₹{Number(item.price).toLocaleString("en-IN")}</span>
              <span className="menu-id-tag font-mono">#{item.id}</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Add New Menu Item</h3>
              <button
                className="btn-icon-close"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="modal-body">
              {error && (
                <div className="error-alert">
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label>Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Espresso Romano"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="text-input"
                />
              </div>

              <div className="grid-2-col-compact">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="select-input w-full"
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                  >
                    <option value="Coffee">Coffee</option>
                    <option value="Food">Food</option>
                    <option value="Dessert">Dessert</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="150"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="text-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Assign to Branch</label>
                <select
                  className="select-input w-full"
                  value={newItemBranch}
                  onChange={(e) => setNewItemBranch(Number(e.target.value))}
                >
                  <option value={1}>Panjim Cafe</option>
                  <option value={2}>Margao Cafe</option>
                  <option value={3}>Mapusa Cafe</option>
                </select>
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
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
