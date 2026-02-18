import { DatabaseTransaction } from "@/src/domain/database/database-transaction";
import { SQLiteDatabase } from "expo-sqlite";

export class SqliteTransaction implements DatabaseTransaction {
  constructor(private readonly db: SQLiteDatabase) {}

  async runInTransaction(callback: () => Promise<void>) {
    await this.db.execAsync("BEGIN TRANSACTION");
    try {
      await callback();
      await this.db.execAsync("COMMIT");
    } catch (error) {
      await this.db.execAsync("ROLLBACK");
      throw error;
    }
  }
}
