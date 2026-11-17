import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Login.css";
import { BACKEND_URL } from "../service/Helper";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showColdStartMessage, setShowColdStartMessage] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setShowColdStartMessage(false);

    // If Render is sleeping, show a wakeup notice after 3 seconds
    const coldStartTimer = setTimeout(() => {
      setShowColdStartMessage(true);
    }, 3000);

    try {
      const res = await axios.post(
        `${BACKEND_URL}/auth/login`,
        {
          email,
          password,
        },
        { withCredentials: true },
      );

      clearTimeout(coldStartTimer);

      if (res.data.success) {
        const targetUrl = new URL(
          "https://full-stack-stock-market-app-7sqn-sandy.vercel.app",
        );
        targetUrl.searchParams.set("email", email);
        window.location.assign(targetUrl.toString());
      } else {
        alert("Login failed: " + res.data.message);
        setLoading(false);
      }
    } catch (e) {
      clearTimeout(coldStartTimer);
      console.log(e);
      alert("Login error");
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <h2 className="login-header">Login</h2>

      {/* Cold start waking notification */}
      {showColdStartMessage && (
        <div
          style={{
            background: "#fff3cd",
            color: "#856404",
            padding: "10px",
            marginBottom: "15px",
            borderRadius: "4px",
            fontSize: "13px",
            textAlign: "center",
          }}
        >
          ⏳ Waking up server... Render free tier is spinning up from sleep
          mode. Please wait a moment!
        </div>
      )}

      <form onSubmit={submit}>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="login-input"
          required
          disabled={loading}
        />
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="login-input"
          required
          disabled={loading}
        />
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <br />
      <p>Or</p>
      <Link to="/signup" className="login-link">
        Create account
      </Link>
    </div>
  );
};

export default Login;
