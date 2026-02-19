export const VENDORS_TABLE_INIT_QUERY = `
    CREATE TABLE IF NOT EXISTS vendors (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    category_id TEXT,
  );
  `;

export interface SqliteVendor {
  id: string;
  name: string;
  category_id?: string;
}
