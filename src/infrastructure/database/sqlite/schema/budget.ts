import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const SQLITE_BUDGETS_TABLE = sqliteTable("budgets", {
  id: text("id").primaryKey(),
  totalAmount: integer("total_amount").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const SQLITE_BUDGET_ALLOCATIONS_TABLE = sqliteTable("budget_allocations", {
  id: text("id").primaryKey(),
  budgetId: text("budget_id").notNull(),
  categoryId: text("category_id").notNull(),
  allocatedAmount: integer("allocated_amount").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type InsertSqliteBudget = typeof SQLITE_BUDGETS_TABLE.$inferInsert;
export type SelectSqliteBudget = typeof SQLITE_BUDGETS_TABLE.$inferSelect;
export type InsertSqliteBudgetAllocation = typeof SQLITE_BUDGET_ALLOCATIONS_TABLE.$inferInsert;
export type SelectSqliteBudgetAllocation = typeof SQLITE_BUDGET_ALLOCATIONS_TABLE.$inferSelect;