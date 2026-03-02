import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const SQLITE_ACCOUNTS_TABLE = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  balance: integer('balance').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export type InsertSqliteAccount = typeof SQLITE_ACCOUNTS_TABLE.$inferInsert;
export type SelectSqliteAccount = typeof SQLITE_ACCOUNTS_TABLE.$inferSelect;