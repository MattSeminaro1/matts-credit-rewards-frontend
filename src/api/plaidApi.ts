export interface Account {
  account_id: string;
  name: string;
  balances: {
    current: number;
    limit?: number;
  };
}

export interface Transaction {
  transaction_id: string;
  name: string;
  merchant_name?: string;
  amount: number;
}

export interface Analytics {
  total30: number;
  topCategory: string;
}

const API_BASE = "http://localhost:8080"; // adjust if needed

export async function getAccounts(): Promise<Account[]> {
  const res = await fetch(`${API_BASE}/plaid/accounts`);
  if (!res.ok) throw new Error("Failed to fetch accounts");
  return res.json();
}

export async function getTransactions(): Promise<Transaction[]> {
  const res = await fetch(`${API_BASE}/plaid/transactions`);
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
}

export async function getAnalytics(): Promise<Analytics> {
  const res = await fetch(`${API_BASE}/plaid/analytics`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}
