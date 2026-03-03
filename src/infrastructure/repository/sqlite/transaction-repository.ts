import { Transaction } from "@/src/domain/entities/transaction";
import {
  TransactionFilter,
  TransactionRepository,
} from "@/src/domain/repository/transaction-repository";
import { Id } from "@/src/domain/value-objects/id";
import * as SQLite from "expo-sqlite";
import {
  SelectSqliteTransaction,
  SQLITE_TRANSACTIONS_TABLE,
} from "../../database/sqlite/schema/transaction";
import { TransactionType } from "@/src/domain/constants/transaction-type";
import { SpendingType } from "@/src/domain/constants/spending-type";
import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { eq, inArray } from "drizzle-orm";

export class SqliteTransactionRepository implements TransactionRepository {
  constructor(private readonly db: ExpoSQLiteDatabase<any>) {}

  private formatToDomain(row: SelectSqliteTransaction): Transaction {
    return Transaction.rehydrate({
      id: row.id,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      amount: row.amount,
      transactionDate: new Date(row.transactionDate),
      categoryId: row.categoryId,
      type: row.transactionType as TransactionType,
      spendingType: row.spendingType as SpendingType,
      description: row.description,
      vendorId: row.vendorId,
    });
  }

  private formatFromDomain(obj: Transaction): SelectSqliteTransaction {
    return {
      id: obj.id.getValue(),
      createdAt: obj.createdAt.toISOString(),
      updatedAt: obj.updatedAt.toISOString(),
      amount: obj.amount,
      transactionDate: obj.transactionDate.toISOString(),
      transactionType: obj.type,
      spendingType: obj.spendingType,
      categoryId: obj.categoryId,
      vendorId: obj.vendorId,
      description: obj.description,
    };
  }

  async saveTransaction(Transaction: Transaction): Promise<Id> {
    const row = this.formatFromDomain(Transaction);

    await this.db.insert(SQLITE_TRANSACTIONS_TABLE).values(row);

    return Transaction.id;
  }

  async updateTransaction(Transaction: Transaction): Promise<Id> {
    const row = this.formatFromDomain(Transaction);

    const { id, ...updateFields } = row;

    const result = await this.db
      .update(SQLITE_TRANSACTIONS_TABLE)
      .set(updateFields)
      .where(eq(SQLITE_TRANSACTIONS_TABLE.id, id));

    if (result.changes === 0) {
      throw new Error(
        "Transaction: Id not found:" + Transaction.id.getValue(),
        {
          cause: result,
        },
      );
    }

    return Transaction.id;
  }

  async deleteTransaction(id: Id): Promise<void> {
    const result = await this.db
      .delete(SQLITE_TRANSACTIONS_TABLE)
      .where(eq(SQLITE_TRANSACTIONS_TABLE.id, id.getValue()));

    if (result.changes === 0) {
      throw new Error("Transaction: Id not found:" + id.getValue(), {
        cause: result,
      });
    }
  }

  async getTransaction(ids: Id[]): Promise<Transaction[]> {
    if (ids.length === 0) return [];

    const rows = await this.db
      .select()
      .from(SQLITE_TRANSACTIONS_TABLE)
      .where(
        inArray(
          SQLITE_TRANSACTIONS_TABLE.id,
          ids.map((id) => id.getValue()),
        ),
      );

    return rows.map((row) => this.formatToDomain(row));
  }

  async findTransactions(filter: TransactionFilter): Promise<Transaction[]> {
    let query = `SELECT * FROM transactions`;
    const conditions: string[] = [];
    const values: any[] = [];

    if (filter?.categoryId) {
      conditions.push(`category_id = ?`);
      values.push(filter.categoryId);
    }

    if (filter?.transactionType) {
      conditions.push(`transaction_type = ?`);
      values.push(filter.transactionType);
    }

    if (filter?.startDate && filter?.endDate) {
      conditions.push(`transaction_date BETWEEN ? AND ?`);
      values.push(filter.startDate.toISOString());
      values.push(filter.endDate.toISOString());
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(" AND ");
    }

    query += ` ORDER BY transaction_date DESC`;

    const rows = await this.db.select().from(SQLITE_TRANSACTIONS_TABLE);

    return rows.map(row => this.formatToDomain(row));
  }
}
