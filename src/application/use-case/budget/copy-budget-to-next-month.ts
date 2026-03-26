import { Budget, BudgetAllocation } from "@/src/domain/entities/budget";
import { BudgetRepository } from "@/src/domain/repository/budget-repository";
import { Id } from "@/src/domain/value-objects/id";

export class CopyBudgetToNextMonthUseCase {
  constructor(private readonly budgetRepo: BudgetRepository) {}

  async execute(): Promise<Id | null> {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const { nextMonth, nextYear } = this.getNextMonth(currentMonth, currentYear);

    const existingNextBudget = await this.budgetRepo.getBudget(nextMonth, nextYear);
    if (existingNextBudget) {
      return null;
    }

    const currentBudget = await this.budgetRepo.getBudget(currentMonth, currentYear);
    if (!currentBudget) {
      return null;
    }

    const newAllocations = currentBudget.allocations.map((a) =>
      BudgetAllocation.create({
        categoryId: a.categoryId,
        allocatedAmount: a.allocatedAmount,
      })
    );

    const newBudget = Budget.create({
      totalAmount: currentBudget.totalAmount,
      month: nextMonth,
      year: nextYear,
    });
    newBudget.setAllocations(newAllocations);

    return this.budgetRepo.saveBudget(newBudget);
  }

  private getNextMonth(month: number, year: number): {
    nextMonth: number;
    nextYear: number;
  } {
    if (month === 12) {
      return { nextMonth: 1, nextYear: year + 1 };
    }
    return { nextMonth: month + 1, nextYear: year };
  }
}
