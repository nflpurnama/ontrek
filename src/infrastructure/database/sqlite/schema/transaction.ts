export const TRANSACTIONS_TABLE_INIT_QUERY = `
    CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY NOT NULL,
    vendor_id TEXT,
    category_id TEXT,
    transaction_date TEXT NOT NULL,
    transaction_type INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  `;

export interface SqliteTransaction {
  id: string;
  vendor_id: string;
  category_id: string;
  transaction_date: string;
  transaction_type: number;
  amount: number;
  description?: string;
  created_at: string;
  updated_at: string;
}
