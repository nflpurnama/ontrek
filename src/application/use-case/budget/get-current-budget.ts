import { Budget } from "@/src/domain/entities/budget";
import { BudgetRepository } from "@/src/domain/repository/budget-repository";
import { TransactionRepository } from "@/src/domain/repository/transaction-repository";
import { CategoryRepository } from "@/src/domain/repository/category-repository";
import { TransactionType } from "@/src/domain/constants/transaction-type";

export interface CategoryBudgetStatus {
  categoryId: string;
  categoryName: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
}

export interface CurrentBudgetData {
  budget: Budget | null;
  month: number;
  year: number;
  totalSpent: number;
  totalAllocated: number;
  unallocatedBudget: number;
  unallocatedSpent: number;
  categoryAllocations: CategoryBudgetStatus[];
  hasBudget: boolean;
  daysRemaining: number;
  dailyAllowance: number;
}

export class GetCurrentBudgetUseCase {
  constructor(
    private readonly budgetRepo: BudgetRepository,
    private readonly transactionRepo: TransactionRepository,
    private readonly categoryRepo: CategoryRepository
  ) {}

  async execute(month?: number, year?: number): Promise<CurrentBudgetData> {
    const now = new Date();
    const targetMonth = month ?? now.getMonth() + 1;
    const targetYear = year ?? now.getFullYear();

    const budget = await this.budgetRepo.getBudget(targetMonth, targetYear);

    const { startDate, endDate } = this.getMonthDateRange(targetMonth, targetYear);

    const expenses = await this.transactionRepo.findTransactions({
      startDate,
      endDate,
      transactionType: "EXPENSE" as TransactionType,
    });

    const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);

    if (!budget) {
      const { daysRemaining } = this.calculateDailyAllowance(
        targetMonth,
        targetYear,
        0,
        totalSpent
      );
      return {
        budget: null,
        month: targetMonth,
        year: targetYear,
        totalSpent,
        totalAllocated: 0,
        unallocatedBudget: 0,
        unallocatedSpent: totalSpent,
        categoryAllocations: [],
        hasBudget: false,
        daysRemaining,
        dailyAllowance: 0,
      };
    }

    const categories = await this.loadCategories();

    const spentByCategory = new Map<string | null, number>();
    for (const expense of expenses) {
      const current = spentByCategory.get(expense.categoryId) ?? 0;
      spentByCategory.set(expense.categoryId, current + expense.amount);
    }

    const categoryAllocations: CategoryBudgetStatus[] = [];

    for (const allocation of budget.allocations) {
      const categoryName =
        categories.get(allocation.categoryId)?.name ?? "Unknown";
      const spentAmount = spentByCategory.get(allocation.categoryId) ?? 0;

      categoryAllocations.push({
        categoryId: allocation.categoryId,
        categoryName,
        allocatedAmount: allocation.allocatedAmount,
        spentAmount,
        remainingAmount: allocation.allocatedAmount - spentAmount,
      });
    }

    const totalAllocated = budget.totalAllocated;
    const unallocatedBudget = budget.unallocatedAmount;
    const unallocatedSpent = spentByCategory.get(null) ?? 0;

    const { daysRemaining, dailyAllowance } = this.calculateDailyAllowance(
      targetMonth,
      targetYear,
      budget.totalAmount,
      totalSpent
    );

    return {
      budget,
      month: targetMonth,
      year: targetYear,
      totalSpent,
      totalAllocated,
      unallocatedBudget,
      unallocatedSpent,
      categoryAllocations,
      hasBudget: true,
      daysRemaining,
      dailyAllowance,
    };
  }

  private calculateDailyAllowance(
    month: number,
    year: number,
    budgetTotal: number,
    totalSpent: number
  ): { daysRemaining: number; dailyAllowance: number } {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentDay = now.getDate(); // 1-31

    // If we're looking at a future month, no days have passed
    if (month > currentMonth || year > now.getFullYear()) {
      const daysInMonth = new Date(year, month, 0).getDate();
      const remainingBudget = budgetTotal - totalSpent;
      const dailyAllowance = daysInMonth > 0 ? Math.floor(remainingBudget / daysInMonth) : 0;
      return { daysRemaining: daysInMonth, dailyAllowance };
    }

    // If we're looking at a past month, no days remaining
    if (month < currentMonth || year < now.getFullYear()) {
      return { daysRemaining: 0, dailyAllowance: 0 };
    }

    // Current month
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysRemaining = daysInMonth - currentDay;
    const remainingBudget = budgetTotal - totalSpent;
    const dailyAllowance = daysRemaining > 0 ? Math.floor(remainingBudget / daysRemaining) : 0;

    return { daysRemaining: Math.max(0, daysRemaining), dailyAllowance };
  }

  private async loadCategories(): Promise<Map<string, { name: string }>> {
    const categories = await this.categoryRepo.getAllCategories();
    const map = new Map<string, { name: string }>();
    for (const category of categories) {
      map.set(category.id.getValue(), { name: category.name });
    }
    return map;
  }

  private getMonthDateRange(month: number, year: number): {
    startDate: Date;
    endDate: Date;
  } {
    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    return { startDate, endDate };
  }
}
