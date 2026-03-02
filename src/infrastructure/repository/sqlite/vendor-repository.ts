import { eq, inArray } from "drizzle-orm";
import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { Id } from "@/src/domain/value-objects/id";
import { Vendor } from "@/src/domain/entities/vendor";
import {
  VendorFilter,
  VendorRepository,
} from "@/src/domain/repository/vendor-repository";
import {
  SelectSqliteVendor,
  SQLITE_VENDORS_TABLE,
} from "../../database/sqlite/schema/vendors";

export class SqliteVendorRepository implements VendorRepository {
  constructor(private readonly db: ExpoSQLiteDatabase<any>) {}

  async findVendors(filter?: VendorFilter): Promise<Vendor[]> {
    let query = `SELECT * FROM vendors`;
    const conditions: string[] = [];

    if (filter?.name) {
      conditions.push(`name LIKE '${filter.name}%' COLLATE NOCASE`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(" AND ");
    }

    query += ` ORDER BY name ASC`;

    const rows = await this.db.all<any>(query);

    return rows.map((row) => this.formatToDomain(row));
  }

  private formatToDomain(row: SelectSqliteVendor): Vendor {
    return Vendor.rehydrate({
      id: row.id,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      name: row.name,
      defaultCategoryId: row.categoryId,
    });
  }

  private formatFromDomain(obj: Vendor): SelectSqliteVendor {
    return {
      categoryId: obj.defaultCategoryId,
      createdAt: obj.createdAt.toISOString(),
      updatedAt: obj.updatedAt.toISOString(),
      id: obj.id.getValue(),
      name: obj.name,
    };
  }

  async getVendors(ids: Id[]): Promise<Vendor[]> {
    if (ids.length === 0) return [];

    const rows = await this.db
      .select()
      .from(SQLITE_VENDORS_TABLE)
      .where(
        inArray(
          SQLITE_VENDORS_TABLE.id,
          ids.map((id) => id.getValue()),
        ),
      );

    return rows.map((row) => this.formatToDomain(row));
  }

  async getAllVendors(): Promise<Vendor[]> {
    const rows = await this.db.select().from(SQLITE_VENDORS_TABLE);
    return rows.map((row) => this.formatToDomain(row));
  }

  async saveVendor(Vendor: Vendor): Promise<Id> {
    const row = this.formatFromDomain(Vendor);

    await this.db.insert(SQLITE_VENDORS_TABLE).values(row);

    return Vendor.id;
  }

  async updateVendor(Vendor: Vendor): Promise<Id> {
    const row = this.formatFromDomain(Vendor);

    const { id, ...updateFields } = row;

    const result = await this.db
      .update(SQLITE_VENDORS_TABLE)
      .set(updateFields)
      .where(eq(SQLITE_VENDORS_TABLE.id, id));

    if (result.changes === 0) {
      throw new Error("Vendor: Id not found:" + Vendor.id.getValue(), {
        cause: result,
      });
    }

    return Vendor.id;
  }

  async deleteVendor(id: Id): Promise<void> {
    const result = await this.db
      .delete(SQLITE_VENDORS_TABLE)
      .where(eq(SQLITE_VENDORS_TABLE.id, id.getValue()));

    if (result.changes === 0) {
      throw new Error("Vendor: Id not found:" + id.getValue(), {
        cause: result,
      });
    }
  }
}
