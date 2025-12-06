import React, { useState } from "react";
import { Link } from "react-router-dom";

const SignUpForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); 
  const [success, setSuccess] = useState(false); // <--- track success

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8080/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSuccess(false);
        setMessage(data.error || "Signup failed");
      } else {
        setSuccess(true);
        setMessage(data.message || "Signup successful!");
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      console.error(err);
      setSuccess(false);
      setMessage("Network error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", width: "300px" }}
    >
      {!success && (
        <>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginBottom: "10px", padding: "8px" }}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginBottom: "10px", padding: "8px" }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginBottom: "10px", padding: "8px" }}
            required
          />
          <button type="submit" style={{ padding: "8px" }}>
            Sign Up
          </button>
        </>
      )}

      {message && (
        <p style={{ marginTop: "10px", color: success ? "green" : "red" }}>
          {message}
        </p>
      )}

      {success && (
        <Link
          to="/"
          style={{
            marginTop: "15px",
            textAlign: "center",
            color: "blue",
            textDecoration: "underline",
          }}
        >
          Go to Login
        </Link>
      )}
    </form>
  );
};

export default SignUpForm;
