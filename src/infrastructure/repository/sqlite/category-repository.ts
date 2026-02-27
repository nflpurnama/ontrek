import { Id } from "@/src/domain/value-objects/id";
import * as SQLite from "expo-sqlite";
import { CategoryRepository } from "@/src/domain/repository/category-repository";
import { Category } from "@/src/domain/entities/category";
import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import {
  SelectSqliteCategory,
  SQLITE_CATEGORIES_TABLE,
} from "../../database/sqlite/schema/category";
import { eq, inArray } from "drizzle-orm";

export class SqliteCategoryRepository implements CategoryRepository {
  constructor(
    private readonly db: ExpoSQLiteDatabase<Record<string, never>> & {
      $client: SQLite.SQLiteDatabase;
    },
  ) {}

  async getCategory(ids: Id[]): Promise<Category[]> {
    if (ids.length === 0) return [];

    const rows = await this.db
      .select()
      .from(SQLITE_CATEGORIES_TABLE)
      .where(
        inArray(
          SQLITE_CATEGORIES_TABLE.id,
          ids.map((id) => id.getValue()),
        ),
      );

    return rows.map((row) => this.formatToDomain(row));
  }
  async getAllCategories(): Promise<Category[]> {
    const rows = await this.db.select().from(SQLITE_CATEGORIES_TABLE);

    return rows.map((row) => this.formatToDomain(row));
  }
  async saveCategory(category: Category): Promise<Id> {
    const row = this.formatFromDomain(category);

    await this.db.insert(SQLITE_CATEGORIES_TABLE).values(row);

    return category.id;
  }

  async updateCategory(category: Category): Promise<Id> {
    const row = this.formatFromDomain(category);

    const { id, ...updateFields } = row;

    const result = await this.db
      .update(SQLITE_CATEGORIES_TABLE)
      .set(updateFields)
      .where(eq(SQLITE_CATEGORIES_TABLE, id));

    if (result.changes === 0) {
      throw new Error("Categories: Id not found", { cause: result });
    }

    return category.id;
  }

  async deleteCategory(id: Id): Promise<void> {
    const result = await this.db
      .delete(SQLITE_CATEGORIES_TABLE)
      .where(eq(SQLITE_CATEGORIES_TABLE, id.getValue()));

    if (result.changes === 0) {
      throw new Error("Categories: Id not found", { cause: result });
    }
  }

  private formatToDomain(row: SelectSqliteCategory): Category {
    return Category.rehydrate({
      id: row.id,
      name: row.name,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }

  private formatFromDomain(row: Category): SelectSqliteCategory {
    return {
      id: row.id.getValue(),
      name: row.name,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
