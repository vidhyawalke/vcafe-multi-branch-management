import { useState } from "react";
import { Coffee, Mail, Lock, Eye, EyeOff, ShieldCheck, UserCheck } from "lucide-react";
import { api } from "../services/api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("admin@brewhub.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function selectRole(demoEmail) {
    setEmail(demoEmail);
    setPassword("password123");
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      localStorage.setItem("brewhub_token", data.token);
      localStorage.setItem("brewhub_user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError(err.message || "Failed to authenticate. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="brand-badge">
            <Coffee size={22} className="brand-icon" />
          </div>
          <h2>BrewHub</h2>
          <p className="login-subtitle">Multi-Branch Cafe Management & POS</p>
        </div>

        <div className="role-selector">
          <span className="role-label">Quick Demo Access:</span>
          <div className="role-buttons">
            <button
              type="button"
              className={`role-btn ${email === "admin@brewhub.com" ? "active" : ""}`}
              onClick={() => selectRole("admin@brewhub.com")}
            >
              <ShieldCheck size={14} />
              <span>Admin (HQ)</span>
            </button>
            <button
              type="button"
              className={`role-btn ${email === "staff@brewhub.com" ? "active" : ""}`}
              onClick={() => selectRole("staff@brewhub.com")}
            >
              <UserCheck size={14} />
              <span>Staff (Branch)</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-alert">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <div className="input-group">
              <Mail size={16} className="input-icon" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@brewhub.com"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
            </div>
            <div className="input-group">
              <Lock size={16} className="input-icon" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign in to BrewHub"}
          </button>
        </form>

        <div className="login-footer">
          <span>React • Node.js Express • PostgreSQL 18</span>
        </div>
      </div>
    </div>
  );
}
