import { Id } from "@/src/domain/value-objects/id";
import * as SQLite from "expo-sqlite";
import { VendorRepository } from "@/src/domain/repository/vendor-repository";
import { Vendor } from "@/src/domain/entities/vendor";
import { SqliteVendor } from "../../database/sqlite/schema/vendors";

export class SqliteVendorRepository implements VendorRepository {
  constructor(private readonly db: SQLite.SQLiteDatabase) {}

  async getAllVendors(): Promise<Vendor[]> {
    const result: SqliteVendor[] = await this.db.getAllAsync<any>(
      `SELECT * FROM vendors`
    );

    if (!result) return [];

    return result.map((row) => this.formatRow(row));
  }

  async getVendor(ids: Id[]): Promise<Vendor[]> {
    const placeholders = ids.map(() => "?").join(",");
    const values = ids.map((id) => id.getValue());

    const result: SqliteVendor[] = await this.db.getAllAsync<any>(
      `SELECT * FROM vendors WHERE id IN (${placeholders})`,
      values,
    );

    if (!result) return [];

    return result.map((row) => this.formatRow(row));
  }

  async saveVendor(vendor: Vendor): Promise<Id> {
    const rowToInsert = this.formatObject(vendor);
    await this.db.runAsync(
      `
      INSERT INTO vendors 
      (id, created_at, updated_at, name, category_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        rowToInsert.id,
        rowToInsert.created_at,
        rowToInsert.updated_at,
        rowToInsert.name,
        rowToInsert.category_id,
      ],
    );

    return vendor.id;
  }

  async updateVendor(vendor: Vendor): Promise<Id> {
    const rowToUpdate = this.formatObject(vendor);
    const result = await this.db.runAsync(
      `
        UPDATE vendors
        SET
          updated_at = ?,
          name = ?,
          category_id = ?,
        WHERE id = ?
        `,
      [
        rowToUpdate.updated_at,
        rowToUpdate.name,
        rowToUpdate.category_id,
        rowToUpdate.id,
      ],
    );

    if (result.changes === 0) {
      throw new Error(
        `Vendor with id ${vendor.id.getValue()} does not exist.`,
      );
    }

    return vendor.id;
  }

  async deleteVendor(id: Id): Promise<void> {
    const result = await this.db.runAsync(
      `DELETE FROM vendors WHERE id = ?`,
      [id.getValue()],
    );

    if (result.changes === 0) {
      throw new Error(`Vendor with id ${id.getValue()} does not exist.`);
    }
  }

  private formatRow(row: SqliteVendor): Vendor {
    return Vendor.rehydrate({
      id: row.id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      name: row.name,
      defaultCategoryId: row.category_id,
    });
  }

  private formatObject(obj: Vendor): SqliteVendor {
    return {
      id: obj.id.getValue(),
      created_at: obj.createdAt.toISOString(),
      updated_at: obj.updatedAt.toISOString(),
      name: obj.name,
      category_id: obj.defaultCategoryId,
    };
  }
}
