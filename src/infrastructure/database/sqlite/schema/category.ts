import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const SQLITE_CATEGORIES_TABLE = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export type InsertSqliteCategory = typeof SQLITE_CATEGORIES_TABLE.$inferInsert;
export type SelectSqliteCategory = typeof SQLITE_CATEGORIES_TABLE.$inferSelect;