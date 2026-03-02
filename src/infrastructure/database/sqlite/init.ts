import { SQLiteDatabase } from 'expo-sqlite';
import { TRANSACTIONS_TABLE_INIT_QUERY } from './schema/transaction';

export async function initializeDatabase(db: SQLiteDatabase) {
  await db.execAsync(TRANSACTIONS_TABLE_INIT_QUERY);
}
