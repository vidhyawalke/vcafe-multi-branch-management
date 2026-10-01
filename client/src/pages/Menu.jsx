import { useEffect, useState } from "react";
import { Plus, MoreHorizontal } from "lucide-react";
import { api } from "../services/api";

const demoMenu = [
  { id: 1, name: "Cappuccino", category: "Coffee", price: 150, available: true },
  { id: 2, name: "Iced Latte", category: "Coffee", price: 170, available: true },
  { id: 3, name: "Americano", category: "Coffee", price: 120, available: true },
  { id: 4, name: "Paneer Sandwich", category: "Food", price: 180, available: true },
  { id: 5, name: "Cheesecake", category: "Dessert", price: 220, available: false }
];

export default function Menu() {
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    api("/menu").then(setMenu).catch(() => setMenu(demoMenu));
  }, []);

  const data = menu.length ? menu : demoMenu;

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">CATALOGUE</span>
          <h1>Menu</h1>
          <p>Manage what your customers can order at each branch.</p>
        </div>
        <button className="primary-button"><Plus size={17} /> Add item</button>
      </div>

      <div className="category-tabs">
        <button className="category active">All items <span>{data.length}</span></button>
        <button className="category">Coffee</button>
        <button className="category">Food</button>
        <button className="category">Dessert</button>
      </div>

      <div className="menu-grid">
        {data.map(item => (
          <article className="menu-card" key={item.id}>
            <div className={`menu-image ${item.category.toLowerCase()}`}>
              <span>{item.category === "Coffee" ? "☕" : item.category === "Dessert" ? "🍰" : "🥪"}</span>
            </div>
            <div className="menu-info">
              <div className="menu-card-top">
                <span className="category-label">{item.category}</span>
                <button className="icon-button"><MoreHorizontal size={18} /></button>
              </div>
              <h3>{item.name}</h3>
              <div className="menu-card-bottom">
                <strong>₹{Number(item.price).toLocaleString("en-IN")}</strong>
                <span className={item.available ? "availability available" : "availability unavailable"}>
                  {item.available ? "Available" : "Unavailable"}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
