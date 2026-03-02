import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const SQLITE_TRANSACTIONS_TABLE = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  transactionDate: text("transaction_date").notNull(),
  transactionType: text("transaction_type").notNull(),
  spendingType: text("spending_type").notNull(),
  amount: integer("amount").notNull(),
  description: text("description"),
  categoryId: text("category_id"),
  vendorId: text("vendor_id"),
});

export type InsertSqliteTransaction =
  typeof SQLITE_TRANSACTIONS_TABLE.$inferInsert;
export type SelectSqliteTransaction =
  typeof SQLITE_TRANSACTIONS_TABLE.$inferSelect;
