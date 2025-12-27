import React, { useEffect, useState } from "react";
import { usePlaidLink, type PlaidLinkOptions, type PlaidLinkError } from "react-plaid-link";
import { getAccounts, getTransactions, getAnalytics } from "../api/plaidApi";

type Card = {
  account_id: string;
  name: string;
  balances: {
    current: number;
    limit?: number;
  };
};

const HomePage: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [cards, setCards] = useState<Card[]>([]);
  const [tx, setTx] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  // ----------- PLAID STATE -----------
  const [linkToken, setLinkToken] = useState<string>("");
  const [linkLoading, setLinkLoading] = useState<boolean>(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  // ----------- FETCH LINK TOKEN -----------
  useEffect(() => {
    const fetchLinkToken = async () => {
      try {
        setLinkLoading(true);

        const res = await fetch("http://localhost:8080/create_link_token", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.uid, // MUST be UUID
          }),
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch link token (${res.status})`);
        }

        const data = await res.json();

        if (!data.link_token) {
          throw new Error("Missing link_token in response");
        }

        setLinkToken(data.link_token);
      } catch (err: any) {
        console.error(err);
        setLinkError(err.message);
      } finally {
        setLinkLoading(false);
      }
    };

    fetchLinkToken();
  }, []);

  // ----------- PLAID CONFIG (TYPE SAFE) -----------
  const plaidConfig: PlaidLinkOptions = {
    token: linkToken, // empty string keeps ready=false
    onSuccess: async (public_token: string) => {
      try {
        await fetch("http://localhost:8080/exchange_public_token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ public_token }),
        });

        const updated = await getAccounts();
        setCards(updated);
      } catch (err) {
        console.error("Failed to exchange public token", err);
      }
    },
    onExit: (err: PlaidLinkError | null) => {
      if (err) {
        console.error("Plaid exited with error", err);
      }
    },
  };

  const { open, ready } = usePlaidLink(plaidConfig);

  // ----------- DASHBOARD DATA -----------
  useEffect(() => {
    getAccounts().then(setCards).catch(console.error);

    getTransactions()
      .then((data) => setTx(data.slice(0, 5)))
      .catch(console.error);

    getAnalytics().then(setAnalytics).catch(console.error);
  }, []);

  // ----------- ACTIONS -----------
  const handleAddCard = () => {
    if (ready) open();
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // ----------- UI -----------
  return (
    <div style={{ marginTop: "60px", padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      {/* USER HEADER */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1>Welcome, {user.name}!</h1>
        <p>Your email: {user.email}</p>

        <button
          onClick={handleLogout}
          style={{ marginTop: "20px", padding: "10px 20px", cursor: "pointer" }}
        >
          Logout
        </button>
      </div>

      {/* CARDS */}
      <section style={{ marginBottom: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Your Cards</h2>

          <button
            onClick={handleAddCard}
            disabled={!ready}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "1px solid #333",
              background: "white",
              cursor: ready ? "pointer" : "not-allowed",
              opacity: ready ? 1 : 0.5,
            }}
          >
            {linkLoading ? "Loading..." : "+ Add Card"}
          </button>
        </div>

        {linkError && (
          <p style={{ color: "red", marginTop: "10px" }}>
            Failed to initialize Plaid: {linkError}
          </p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginTop: "10px",
          }}
        >
          {cards.slice(0, 3).map((c) => (
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

      {/* TRANSACTIONS */}
      <section style={{ marginBottom: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>Recent Transactions</h2>
          <a href="/transactions">See More</a>
        </div>

        <div style={{ marginTop: "10px", background: "white", padding: "20px", borderRadius: "8px" }}>
          {tx.map((t) => (
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

      {/* ANALYTICS */}
      <section style={{ marginBottom: "60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>Analytics</h2>
          <a href="/analytics">See More</a>
        </div>

        {analytics && (
          <div style={{ marginTop: "10px", background: "white", padding: "20px", borderRadius: "8px" }}>
            <p>Total last 30 days: ${analytics.total30}</p>
            <p>Top Category: {analytics.topCategory}</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
