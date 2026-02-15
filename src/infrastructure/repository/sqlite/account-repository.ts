import { Account } from "@/src/domain/entities/account";
import { AccountRepository } from "@/src/domain/repository/account-repository";
import { Id } from "@/src/domain/value-objects/id";
import { SqliteAccount } from "../../database/sqlite/schema/accounts";
import * as SQLite from "expo-sqlite";

export class SqliteAccountRepository implements AccountRepository {
  constructor(private readonly _db: SQLite.SQLiteDatabase) {}

  private formatRow(row: SqliteAccount): Account {
    return Account.rehydrate({
      id: row.id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      name: row.name,
      balance: row.balance,
    });
  }

  async getAll(): Promise<Account[]> {
    const result: SqliteAccount[] = await this._db.getAllAsync<any>(
      `SELECT * FROM accounts`
    );

    if (!result) return [];

    return result.map(row => this.formatRow(row));
  }

  async get(ids: Id[]): Promise<Account[]> {
    const placeholders = ids.map(() => "?").join(",");
    const values = ids.map((id) => id.getValue());

    const result: SqliteAccount[] = await this._db.getAllAsync<any>(
      `SELECT * FROM accounts WHERE id IN (${placeholders})`,
      values,
    );

    if (!result) return [];

    return result.map(row => this.formatRow(row));
  }

  async save(account: Account): Promise<Id> {
    await this._db.runAsync(
      `
      INSERT INTO accounts 
      (id, name, balance, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        account.id.getValue(),
        account.name,
        account.balance,
        account.createdAt.toISOString(),
        account.updatedAt.toISOString(),
      ],
    );

    return account.id;
  }

  async update(account: Account): Promise<Id> {
    const result = await this._db.runAsync(
      `
    UPDATE accounts
    SET
      name = ?,
      balance = ?,
      updated_at = ?
    WHERE id = ?
    `,
      [
        account.name,
        account.balance,
        account.updatedAt.toISOString(),
        account.id.getValue(),
      ],
    );

    if (result.changes === 0) {
      throw new Error(
        `Account with id ${account.id.getValue()} does not exist.`,
      );
    }

    return account.id;
  }

  async delete(id: Id): Promise<void> {
    const result = await this._db.runAsync(
      `DELETE FROM accounts WHERE id = ?`,
      [id.getValue()],
    );

    if (result.changes === 0) {
      throw new Error(`Account with id ${id.getValue()} does not exist.`);
    }
  }
}
