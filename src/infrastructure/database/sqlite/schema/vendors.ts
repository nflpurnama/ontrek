import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const SQLITE_VENDORS_TABLE = sqliteTable('vendors', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  categoryId: text('category_id'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export type InsertSqliteVendor = typeof SQLITE_VENDORS_TABLE.$inferInsert;
export type SelectSqliteVendor = typeof SQLITE_VENDORS_TABLE.$inferSelect;