import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(e) {
    e.preventDefault();

    try {
      await axios
        .post("http://localhost:3002/auth/login", {
          email,
          password,
        })
        .then((res) => {
          if (res.data.success) {
            window.location.href = "http://localhost:3001";
          } else {
            alert("Login failed: " + res.data.message);
          }
        });
    } catch (e) {
      console.log(e);
      alert("Login error");
    }
  }

  return (
    <div className="login-container">
      <h2 className="login-header">Login</h2>
      <form onSubmit={submit}>
        <input
          type="email"
          name="email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="login-input"
          required
        />
        <input
          type="password"
          name="password"
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="login-input"
          required
        />
        <button type="submit" className="login-button">
          Login
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
