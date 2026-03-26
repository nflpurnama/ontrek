import { Budget, BudgetAllocation } from "../entities/budget";
import { Id } from "../value-objects/id";

export interface BudgetRepository {
  getBudget(month: number, year: number): Promise<Budget | null>;
  saveBudget(budget: Budget): Promise<Id>;
  updateBudget(budget: Budget): Promise<Id>;
  deleteBudget(id: Id): Promise<void>;
  getAllocations(budgetId: Id): Promise<BudgetAllocation[]>;
  saveAllocation(budgetId: Id, allocation: BudgetAllocation): Promise<Id>;
  updateAllocation(allocation: BudgetAllocation): Promise<Id>;
  deleteAllocation(id: Id): Promise<void>;
  deleteAllocationsByBudgetId(budgetId: Id): Promise<void>;
}