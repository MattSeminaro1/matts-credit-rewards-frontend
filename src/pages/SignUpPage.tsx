import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { pageCenterStyle, formContainerStyle, inputStyle, buttonStyle, buttonDefault, buttonHover } from "../styles/formStyles";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8080/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Signup failed");
      } else {
        setMessage("Account created successfully!");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch {
      setMessage("Network error");
    }
  };

  return (
    <div style={pageCenterStyle}>
      <div style={formContainerStyle}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Sign Up</h2>
        <form style={{ display: "flex", flexDirection: "column", gap: "12px" }} onSubmit={handleSubmit}>
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
          <button
            type="submit"
            style={buttonStyle}
            onMouseOver={(e) => (e.currentTarget.style.background = buttonHover)}
            onMouseOut={(e) => (e.currentTarget.style.background = buttonDefault)}
          >
            Sign Up
          </button>
          {message && <p style={{ color: "red", textAlign: "center" }}>{message}</p>}
        </form>
        <p style={{ textAlign: "center", marginTop: "15px" }}>
          Already have an account? <Link to="/login" style={{ color: buttonDefault, fontWeight: "bold" }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
