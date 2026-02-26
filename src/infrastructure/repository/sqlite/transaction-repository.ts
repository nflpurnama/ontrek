import { Transaction } from "@/src/domain/entities/transaction";
import {
  TransactionFilter,
  TransactionRepository,
} from "@/src/domain/repository/transaction-repository";
import { Id } from "@/src/domain/value-objects/id";
import * as SQLite from "expo-sqlite";
import { SqliteTransaction } from "../../database/sqlite/schema/transaction";
import { TransactionType } from "@/src/domain/constants/transaction-type";
import { SpendingType } from "@/src/domain/constants/spending-type";

export class SqliteTransactionRepository implements TransactionRepository {
  constructor(private readonly db: SQLite.SQLiteDatabase) {}

  async getTransaction(ids: Id[]): Promise<Transaction[]> {
    const placeholders = ids.map(() => "?").join(",");
    const values = ids.map((id) => id.getValue());

    const result: SqliteTransaction[] = await this.db.getAllAsync<any>(
      `SELECT * FROM transactions WHERE id IN (${placeholders})`,
      values,
    );

    if (!result) return [];

    return result.map((row) => this.formatRow(row));
  }

  async findTransactions(filter: TransactionFilter): Promise<Transaction[]> {
    let query = `SELECT * FROM transactions`;
    const conditions: string[] = [];
    const values: any[] = [];

    if (filter?.categoryId) {
      conditions.push(`category_id = ?`);
      values.push(filter.categoryId);
    }

    if (filter?.vendorId) {
      conditions.push(`vendor_id = ?`);
      values.push(filter.vendorId);
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

    const rows = await this.db.getAllAsync<any>(query, values);

    return rows.map(this.formatRow);
  }

  async saveTransaction(transaction: Transaction): Promise<Id> {
    const rowToInsert = this.formatObject(transaction);
    await this.db.runAsync(
      `
      INSERT INTO transactions
      (id, amount, category_id, created_at, description, transaction_date, transaction_type, updated_at, vendor_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        rowToInsert.id,
        rowToInsert.amount,
        rowToInsert.category_id,
        rowToInsert.created_at,
        rowToInsert.description || "",
        rowToInsert.transaction_date,
        rowToInsert.transaction_type,
        rowToInsert.updated_at,
        rowToInsert.vendor_id,
      ],
    );

    return transaction.id;
  }

  async updateTransaction(transaction: Transaction): Promise<Id> {
    const rowToUpdate = this.formatObject(transaction);
    const result = await this.db.runAsync(
      `
        UPDATE transactions
        SET
          amount = ?,
          category_id = ?,
          description, = ?,
          transaction_date = ?,
          transaction_type = ?,
          updated_at = ?,
          vendor_id = ?
        WHERE id = ?
        `,
      [
        rowToUpdate.amount,
        rowToUpdate.category_id,
        rowToUpdate.description || "",
        rowToUpdate.transaction_date,
        rowToUpdate.transaction_type,
        rowToUpdate.updated_at,
        rowToUpdate.vendor_id,
        rowToUpdate.id,
      ],
    );

    if (result.changes === 0) {
      throw new Error(
        `Transaction with id ${transaction.id.getValue()} does not exist.`,
      );
    }

    return transaction.id;
  }

  async deleteTransaction(id: Id): Promise<void> {
    const result = await this.db.runAsync(
      `DELETE FROM transactions WHERE id = ?`,
      [id.getValue()],
    );

    if (result.changes === 0) {
      throw new Error(`Transaction with id ${id.getValue()} does not exist.`);
    }
  }

  private formatRow(row: SqliteTransaction): Transaction {
    return Transaction.rehydrate({
      id: row.id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      amount: row.amount,
      transactionDate: new Date(row.transaction_date),
      categoryId: row.category_id,
      vendorId: row.vendor_id,
      type: row.transaction_type as TransactionType,
      spendingType: row.spending_type as SpendingType,
      description: row.description,
    });
  }

  private formatObject(obj: Transaction): SqliteTransaction {
    return {
      amount: obj.amount,
      category_id: obj.categoryId || "",
      created_at: obj.createdAt.toISOString(),
      description: obj.description,
      id: obj.id.getValue(),
      transaction_date: obj.transactionDate.toDateString(),
      transaction_type: obj.type,
      spending_type: obj.spendingType,
      updated_at: obj.updatedAt.toISOString(),
      vendor_id: obj.vendorId || "",
    };
  }
}
