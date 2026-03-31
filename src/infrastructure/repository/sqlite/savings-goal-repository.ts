import { SavingsGoalRepository } from "@/src/domain/repository/savings-goal-repository";
import { SavingsGoal } from "@/src/domain/entities/savings-goal";
import { Id } from "@/src/domain/value-objects/id";
import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import {
  SQLITE_SAVINGS_GOALS_TABLE,
  SQLITE_SAVINGS_GOAL_TRANSACTIONS_TABLE,
  SelectSqliteSavingsGoal,
} from "../../database/sqlite/schema/savings-goal";
import { eq } from "drizzle-orm";

export class SqliteSavingsGoalRepository implements SavingsGoalRepository {
  constructor(private readonly db: ExpoSQLiteDatabase<any>) {}

  async create(goal: SavingsGoal): Promise<void> {
    const row = this.formatGoalFromDomain(goal);
    await this.db.insert(SQLITE_SAVINGS_GOALS_TABLE).values(row);
  }

  async findById(id: string): Promise<SavingsGoal | null> {
    const rows = await this.db
      .select()
      .from(SQLITE_SAVINGS_GOALS_TABLE)
      .where(eq(SQLITE_SAVINGS_GOALS_TABLE.id, id));

    if (rows.length === 0) {
      return null;
    }

    return this.formatGoalToDomain(rows[0]);
  }

  async findAll(): Promise<SavingsGoal[]> {
    const rows = await this.db
      .select()
      .from(SQLITE_SAVINGS_GOALS_TABLE)
      .orderBy(SQLITE_SAVINGS_GOALS_TABLE.createdAt);

    return rows.map((row) => this.formatGoalToDomain(row));
  }

  async update(goal: SavingsGoal): Promise<void> {
    const row = this.formatGoalFromDomain(goal);
    const { id, ...updateFields } = row;

    const result = await this.db
      .update(SQLITE_SAVINGS_GOALS_TABLE)
      .set(updateFields)
      .where(eq(SQLITE_SAVINGS_GOALS_TABLE.id, id));

    if (result.changes === 0) {
      throw new Error("Savings goal not found");
    }
  }

  async linkTransaction(
    goalId: string,
    transactionId: string,
    type: "DEPOSIT" | "WITHDRAW"
  ): Promise<void> {
    const now = new Date().toISOString();
    await this.db
      .insert(SQLITE_SAVINGS_GOAL_TRANSACTIONS_TABLE)
      .values({
        id: Id.create().getValue(),
        goalId,
        transactionId,
        type,
        createdAt: now,
        updatedAt: now,
      });
  }

  private formatGoalToDomain(row: SelectSqliteSavingsGoal): SavingsGoal {
    return SavingsGoal.rehydrate({
      id: row.id,
      name: row.name,
      targetAmount: row.targetAmount,
      currentBalance: row.currentBalance,
      targetDate: row.targetDate ? new Date(row.targetDate) : null,
      month: row.month,
      year: row.year,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }

  private formatGoalFromDomain(goal: SavingsGoal): SelectSqliteSavingsGoal {
    return {
      id: goal.id.getValue(),
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentBalance: goal.currentBalance,
      targetDate: goal.targetDate?.toISOString() ?? null,
      month: goal.month,
      year: goal.year,
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString(),
    };
  }
}