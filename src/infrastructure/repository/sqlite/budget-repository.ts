import { Id } from "@/src/domain/value-objects/id";
import { BudgetRepository } from "@/src/domain/repository/budget-repository";
import { Budget, BudgetAllocation } from "@/src/domain/entities/budget";
import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import {
  SQLITE_BUDGETS_TABLE,
  SQLITE_BUDGET_ALLOCATIONS_TABLE,
  SelectSqliteBudget,
  SelectSqliteBudgetAllocation,
} from "../../database/sqlite/schema/budget";
import { eq, and } from "drizzle-orm";

export class SqliteBudgetRepository implements BudgetRepository {
  constructor(private readonly db: ExpoSQLiteDatabase<any>) {}

  async getBudget(month: number, year: number): Promise<Budget | null> {
    const rows = await this.db
      .select()
      .from(SQLITE_BUDGETS_TABLE)
      .where(
        and(
          eq(SQLITE_BUDGETS_TABLE.month, month),
          eq(SQLITE_BUDGETS_TABLE.year, year)
        )
      );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    const allocations = await this.getAllocations(Id.rehydrate(row.id));

    return this.formatBudgetToDomain(row, allocations);
  }

  async saveBudget(budget: Budget): Promise<Id> {
    const row = this.formatBudgetFromDomain(budget);
    await this.db.insert(SQLITE_BUDGETS_TABLE).values(row);

    for (const allocation of budget.allocations) {
      await this.saveAllocation(budget.id, allocation);
    }

    return budget.id;
  }

  async updateBudget(budget: Budget): Promise<Id> {
    const row = this.formatBudgetFromDomain(budget);
    const { id, ...updateFields } = row;

    const result = await this.db
      .update(SQLITE_BUDGETS_TABLE)
      .set(updateFields)
      .where(eq(SQLITE_BUDGETS_TABLE.id, id));

    if (result.changes === 0) {
      throw new Error("Budget not found");
    }

    await this.deleteAllocationsByBudgetId(budget.id);
    for (const allocation of budget.allocations) {
      await this.saveAllocation(budget.id, allocation);
    }

    return budget.id;
  }

  async deleteBudget(id: Id): Promise<void> {
    await this.deleteAllocationsByBudgetId(id);

    const result = await this.db
      .delete(SQLITE_BUDGETS_TABLE)
      .where(eq(SQLITE_BUDGETS_TABLE.id, id.getValue()));

    if (result.changes === 0) {
      throw new Error("Budget not found");
    }
  }

  async getAllocations(budgetId: Id): Promise<BudgetAllocation[]> {
    const rows = await this.db
      .select()
      .from(SQLITE_BUDGET_ALLOCATIONS_TABLE)
      .where(eq(SQLITE_BUDGET_ALLOCATIONS_TABLE.budgetId, budgetId.getValue()));

    return rows.map((row) => this.formatAllocationToDomain(row));
  }

  async saveAllocation(budgetId: Id, allocation: BudgetAllocation): Promise<Id> {
    const row = this.formatAllocationFromDomain(budgetId, allocation);
    await this.db.insert(SQLITE_BUDGET_ALLOCATIONS_TABLE).values(row);
    return allocation.id;
  }

  async updateAllocation(allocation: BudgetAllocation): Promise<Id> {
    const row = this.formatAllocationUpdateFromDomain(allocation);

    const result = await this.db
      .update(SQLITE_BUDGET_ALLOCATIONS_TABLE)
      .set(row)
      .where(eq(SQLITE_BUDGET_ALLOCATIONS_TABLE.id, allocation.id.getValue()));

    if (result.changes === 0) {
      throw new Error("Budget allocation not found");
    }

    return allocation.id;
  }

  async deleteAllocation(id: Id): Promise<void> {
    const result = await this.db
      .delete(SQLITE_BUDGET_ALLOCATIONS_TABLE)
      .where(eq(SQLITE_BUDGET_ALLOCATIONS_TABLE.id, id.getValue()));

    if (result.changes === 0) {
      throw new Error("Budget allocation not found");
    }
  }

  async deleteAllocationsByBudgetId(budgetId: Id): Promise<void> {
    await this.db
      .delete(SQLITE_BUDGET_ALLOCATIONS_TABLE)
      .where(eq(SQLITE_BUDGET_ALLOCATIONS_TABLE.budgetId, budgetId.getValue()));
  }

  private formatBudgetToDomain(
    row: SelectSqliteBudget,
    allocations: BudgetAllocation[]
  ): Budget {
    return Budget.rehydrate({
      id: row.id,
      totalAmount: row.totalAmount,
      month: row.month,
      year: row.year,
      allocations,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }

  private formatBudgetFromDomain(budget: Budget): SelectSqliteBudget {
    return {
      id: budget.id.getValue(),
      totalAmount: budget.totalAmount,
      month: budget.month,
      year: budget.year,
      createdAt: budget.createdAt.toISOString(),
      updatedAt: budget.updatedAt.toISOString(),
    };
  }

  private formatAllocationToDomain(
    row: SelectSqliteBudgetAllocation
  ): BudgetAllocation {
    return BudgetAllocation.rehydrate({
      id: row.id,
      categoryId: row.categoryId,
      allocatedAmount: row.allocatedAmount,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }

  private formatAllocationFromDomain(
    budgetId: Id,
    allocation: BudgetAllocation
  ): SelectSqliteBudgetAllocation {
    return {
      id: allocation.id.getValue(),
      budgetId: budgetId.getValue(),
      categoryId: allocation.categoryId,
      allocatedAmount: allocation.allocatedAmount,
      createdAt: allocation.createdAt.toISOString(),
      updatedAt: allocation.updatedAt.toISOString(),
    };
  }

  private formatAllocationUpdateFromDomain(
    allocation: BudgetAllocation
  ): Partial<SelectSqliteBudgetAllocation> {
    return {
      allocatedAmount: allocation.allocatedAmount,
      updatedAt: allocation.updatedAt.toISOString(),
    };
  }
}
