export const ACCOUNTS_TABLE_INIT_QUERY = `
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      balance INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `

export interface SqliteAccount{
    id: string,
    name: string,
    balance: number,
    created_at: string,
    updated_at: string
}