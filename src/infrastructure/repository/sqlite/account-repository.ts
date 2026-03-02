import { Account } from "@/src/domain/entities/account";
import { AccountRepository } from "@/src/domain/repository/account-repository";
import { Id } from "@/src/domain/value-objects/id";
import { SelectSqliteAccount, SQLITE_ACCOUNTS_TABLE } from "../../database/sqlite/schema/accounts";
import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { eq, inArray } from "drizzle-orm";

export class SqliteAccountRepository implements AccountRepository {
  constructor(private readonly db: ExpoSQLiteDatabase<any>) {}

  private formatToDomain(row: SelectSqliteAccount): Account {
    return Account.rehydrate({
      id: row.id,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      name: row.name,
      balance: row.balance,
    });
  }

  private formatFromDomain(obj: Account): SelectSqliteAccount {
    return {
      balance: obj.balance,
      createdAt: obj.createdAt.toISOString(),
      updatedAt: obj.updatedAt.toISOString(),
      id: obj.id.getValue(),
      name: obj.name
    }
  }

  async getAccounts(ids: Id[]): Promise<Account[]> {
    if (ids.length === 0) return [];

    const rows = await this.db
      .select()
      .from(SQLITE_ACCOUNTS_TABLE)
      .where(
        inArray(
          SQLITE_ACCOUNTS_TABLE.id,
          ids.map((id) => id.getValue()),
        ),
      );

    return rows.map((row) => this.formatToDomain(row));
  }

  async getAllAccounts(): Promise<Account[]> {
    const rows = await this.db.select().from(SQLITE_ACCOUNTS_TABLE);
    return rows.map((row) => this.formatToDomain(row));
  }

  async saveAccount(account: Account): Promise<Id> {
      const row = this.formatFromDomain(account);

      await this.db.insert(SQLITE_ACCOUNTS_TABLE).values(row);

      return account.id;
    }

    async updateAccount(account: Account): Promise<Id> {
      const row = this.formatFromDomain(account);

      const { id, ...updateFields } = row;

      const result = await this.db
        .update(SQLITE_ACCOUNTS_TABLE)
        .set(updateFields)
        .where(eq(SQLITE_ACCOUNTS_TABLE.id, id));

      if (result.changes === 0) {
        throw new Error("Account: Id not found:" + account.id.getValue(), { cause: result });
      }

      return account.id;
    }

    async deleteAccount(id: Id): Promise<void> {
      const result = await this.db
        .delete(SQLITE_ACCOUNTS_TABLE)
        .where(eq(SQLITE_ACCOUNTS_TABLE.id, id.getValue()));

      if (result.changes === 0) {
        throw new Error("Account: Id not found:" + id.getValue(), { cause: result });
      }
    }
}
