export const VENDORS_TABLE_INIT_QUERY = `
    CREATE TABLE IF NOT EXISTS vendors (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    category_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  `;

export interface SqliteVendor {
  id: string;
  name: string;
  category_id: string | null;
  created_at: string;
  updated_at: string;
}
