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

    if (totalAllocated > input.totalAmount) {
      const remaining = input.totalAmount - (totalAllocated - input.allocations[input.allocations.length - 1].allocatedAmount);
      throw new Error(
        `Total allocations (${totalAllocated.toLocaleString()}) exceed budget (${input.totalAmount.toLocaleString()}). ` +
        `Reduce by at least ${(totalAllocated - input.totalAmount).toLocaleString()} or increase your budget.`
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
