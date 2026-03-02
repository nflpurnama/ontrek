import { SQLiteDatabase } from 'expo-sqlite';
import { TRANSACTIONS_TABLE_INIT_QUERY } from './schema/transaction';
import { VENDORS_TABLE_INIT_QUERY } from './schema/vendors';

export async function initializeDatabase(db: SQLiteDatabase) {
  await db.execAsync(VENDORS_TABLE_INIT_QUERY);
  await db.execAsync(TRANSACTIONS_TABLE_INIT_QUERY);
}
