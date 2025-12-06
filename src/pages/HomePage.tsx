import React, { useEffect, useState } from "react";
import { getAccounts, getTransactions, getAnalytics } from "../api/plaidApi.ts";
import { usePlaidLink } from "react-plaid-link";

const HomePage = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [cards, setCards] = useState([]);
  const [tx, setTx] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // ----------- NEW: LINK TOKEN STATE -----------
  const [linkToken, setLinkToken] = useState("");

  // Fetch Link Token
  useEffect(() => {
    fetch("/api/create_link_token")
      .then((res) => res.json())
      .then((data) => setLinkToken(data.link_token))
      .catch(console.error);
  }, []);

  // Plaid Link handler
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async () => {
      // Refresh accounts after linking
      const updated = await getAccounts();
      setCards(updated);
    },
  });

  const handleAddCard = () => {
    if (ready) open();
  };

  // ----------- FETCH DASHBOARD DATA -----------
  useEffect(() => {
    getAccounts().then(setCards).catch(console.error);

    getTransactions()
      .then((data) => setTx(data.slice(0, 5)))
      .catch(console.error);

    getAnalytics().then(setAnalytics).catch(console.error);
  }, []);

  // ----------- LOGOUT FUNCTION -----------
  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div style={{ marginTop: "60px", padding: "20px", maxWidth: "900px", margin: "0 auto" }}>

      {/* USER HEADER */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1>Welcome, {user.name}!</h1>
        <p>Your email: {user.email}</p>

        <button
          onClick={handleLogout}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* CARDS PREVIEW */}
      <section style={{ marginBottom: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Your Cards</h2>

          {/* NEW ADD CARD BUTTON */}
          <button
            onClick={handleAddCard}
            disabled={!ready}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "1px solid #333",
              background: "white",
              cursor: "pointer",
            }}
          >
            + Add Card
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginTop: "10px",
          }}
        >
          {cards.slice(0, 3).map((c: any) => (
            <div
              key={c.account_id}
              style={{
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                background: "white",
              }}
            >
              <h3>{c.name}</h3>
              <p>Balance: ${c.balances.current}</p>
              {c.balances.limit && <p>Limit: ${c.balances.limit}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* TRANSACTIONS PREVIEW */}
      <section style={{ marginBottom: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>Recent Transactions</h2>
          <a href="/transactions">See More</a>
        </div>

        <div
          style={{
            marginTop: "10px",
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {tx.map((t: any) => (
            <div
              key={t.transaction_id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <span>{t.merchant_name || t.name}</span>
              <span>${t.amount}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ANALYTICS PREVIEW */}
      <section style={{ marginBottom: "60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>Analytics</h2>
          <a href="/analytics">See More</a>
        </div>

        {analytics && (
          <div
            style={{
              marginTop: "10px",
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <p>Total last 30 days: ${analytics.total30}</p>
            <p>Top Category: {analytics.topCategory}</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
