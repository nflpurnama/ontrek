import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const SQLITE_SAVINGS_GOALS_TABLE = sqliteTable("savings_goals", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  targetAmount: integer("target_amount").notNull(),
  currentBalance: integer("current_balance").notNull(),
  targetDate: text("target_date"),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const SQLITE_SAVINGS_GOAL_TRANSACTIONS_TABLE = sqliteTable(
  "savings_goal_transactions",
  {
    id: text("id").primaryKey(),
    goalId: text("goal_id").notNull(),
    transactionId: text("transaction_id").notNull(),
    type: text("type").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  }
);

export type InsertSqliteSavingsGoal = typeof SQLITE_SAVINGS_GOALS_TABLE.$inferInsert;
export type SelectSqliteSavingsGoal = typeof SQLITE_SAVINGS_GOALS_TABLE.$inferSelect;
export type InsertSqliteSavingsGoalTransaction = typeof SQLITE_SAVINGS_GOAL_TRANSACTIONS_TABLE.$inferInsert;
export type SelectSqliteSavingsGoalTransaction = typeof SQLITE_SAVINGS_GOAL_TRANSACTIONS_TABLE.$inferSelect;
