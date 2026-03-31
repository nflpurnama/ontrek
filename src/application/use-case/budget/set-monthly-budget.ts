import { Budget, BudgetAllocation } from "@/src/domain/entities/budget";
import { BudgetRepository } from "@/src/domain/repository/budget-repository";
import { Id } from "@/src/domain/value-objects/id";

export interface SetMonthlyBudgetInput {
  totalAmount: number;
  month: number;
  year: number;
  allocations: {
    categoryId: string;
    allocatedAmount: number;
  }[];
}

export class SetMonthlyBudgetUseCase {
  constructor(private readonly budgetRepo: BudgetRepository) {}

  async execute(input: SetMonthlyBudgetInput): Promise<Id> {
    const totalAllocated = input.allocations.reduce(
      (sum, a) => sum + a.allocatedAmount,
      0
    );

    const remaining = input.totalAmount - totalAllocated;
    if (remaining < 0) {
      throw new Error(
        `Total allocations exceed budget by ${(-remaining).toLocaleString()}. ` +
        `You have 0 remaining to allocate.`
      );
    }

    const existingBudget = await this.budgetRepo.getBudget(input.month, input.year);

    const budget = existingBudget ?? Budget.create({
      totalAmount: input.totalAmount,
      month: input.month,
      year: input.year,
    });

    budget.updateTotalAmount(input.totalAmount);

    const newAllocations = input.allocations.map((a) =>
      BudgetAllocation.create({
        categoryId: a.categoryId,
        allocatedAmount: a.allocatedAmount,
      })
    );
    budget.setAllocations(newAllocations);

    if (existingBudget) {
      return this.budgetRepo.updateBudget(budget);
    } else {
      return this.budgetRepo.saveBudget(budget);
    }
  }
}
