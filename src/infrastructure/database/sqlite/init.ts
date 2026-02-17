import { SQLiteDatabase } from 'expo-sqlite';
import { ACCOUNTS_TABLE_INIT_QUERY } from './schema/accounts';
import { TRANSACTIONS_TABLE_INIT_QUERY } from './schema/transaction';

export async function initializeDatabase(db: SQLiteDatabase) {
  await db.execAsync(ACCOUNTS_TABLE_INIT_QUERY);
  await db.execAsync(TRANSACTIONS_TABLE_INIT_QUERY)
}
