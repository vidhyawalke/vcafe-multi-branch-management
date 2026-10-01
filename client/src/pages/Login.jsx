import { useState } from "react";
import { Coffee, ArrowRight, Lock, Mail } from "lucide-react";
import { api } from "../services/api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("admin@brewhub.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-art">
        <div className="art-glow glow-one" />
        <div className="art-glow glow-two" />
        <div className="coffee-cup">
          <Coffee size={58} strokeWidth={1.4} />
        </div>
        <div className="art-copy">
          <span className="eyebrow">BREWHUB</span>
          <h1>Good coffee.<br /><em>Better operations.</em></h1>
          <p>One calm workspace for every cafe you run.</p>
        </div>
      </div>

      <div className="login-panel">
        <div className="login-form-wrap">
          <div className="mobile-brand"><Coffee size={22} /> BrewHub</div>
          <div className="login-heading">
            <span className="eyebrow">WELCOME BACK</span>
            <h2>Run your cafes<br />with clarity.</h2>
            <p>Sign in to your BrewHub workspace.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <label>Email address</label>
            <div className="input-wrap">
              <Mail size={17} />
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" />
            </div>

            <label>Password</label>
            <div className="input-wrap">
              <Lock size={17} />
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" />
            </div>

            {error && <div className="error-box">{error}</div>}

            <button className="primary-button login-button" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="demo-note">
            <strong>Demo access</strong>
            <span>admin@brewhub.com · password123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
