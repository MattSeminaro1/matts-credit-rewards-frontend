import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { pageCenterStyle, formContainerStyle, inputStyle, buttonStyle, buttonDefault, buttonHover } from "../styles/formStyles";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Login failed");
      } else {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/home");
      }
    } catch {
      setMessage("Network error");
    }
  };

  return (
    <div style={pageCenterStyle}>
      <div style={formContainerStyle}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Login</h2>
        <form style={{ display: "flex", flexDirection: "column", gap: "12px" }} onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
          <button
            type="submit"
            style={buttonStyle}
            onMouseOver={(e) => (e.currentTarget.style.background = buttonHover)}
            onMouseOut={(e) => (e.currentTarget.style.background = buttonDefault)}
          >
            Login
          </button>
          {message && <p style={{ color: "red", textAlign: "center" }}>{message}</p>}
        </form>
        <p style={{ textAlign: "center", marginTop: "15px" }}>
          Don’t have an account? <Link to="/signup" style={{ color: buttonDefault, fontWeight: "bold" }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
