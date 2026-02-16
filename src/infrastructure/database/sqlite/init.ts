import { SQLiteDatabase } from 'expo-sqlite';
import { ACCOUNTS_TABLE_INIT_QUERY } from './schema/accounts';

export async function initializeDatabase(db: SQLiteDatabase) {
  await db.execAsync(ACCOUNTS_TABLE_INIT_QUERY);
}
