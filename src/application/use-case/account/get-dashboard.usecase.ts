import { AccountRepository } from "@/src/domain/repository/account-repository";
import { TransactionRepository } from "@/src/domain/repository/transaction-repository";
import { CategoryRepository } from "@/src/domain/repository/category-repository";
import { TransactionType } from "@/src/domain/constants/transaction-type";
import {
  DashboardData,
  PeriodSummary,
  CategoryBreakdown,
} from "@/src/application/types/dashboard";

export class GetDashboardUseCase {
  constructor(
    private readonly accountRepo: AccountRepository,
    private readonly transactionRepo: TransactionRepository,
    private readonly categoryRepo: CategoryRepository,
  ) {}

  async execute(): Promise<DashboardData> {
    const accounts = await this.accountRepo.getAllAccounts();
    const account = accounts[0];

    const currentMonth = await this.getPeriodSummary();
    const previousMonth = await this.getPeriodSummary(true);

    return {
      currentBalance: account.balance,
      currentMonth,
      previousMonth,
    };
  }

  private async getPeriodSummary(isPreviousMonth = false): Promise<PeriodSummary> {
    const { startDate, endDate } = this.getMonthDateRange(isPreviousMonth);

    const [expenses, income] = await Promise.all([
      this.transactionRepo.findTransactions({
        startDate,
        endDate,
        transactionType: "EXPENSE" as TransactionType,
      }),
      this.transactionRepo.findTransactions({
        startDate,
        endDate,
        transactionType: "INCOME" as TransactionType,
      }),
    ]);

    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const net = totalIncome - totalExpenses;

    const byCategory = await this.groupExpensesByCategory(expenses, totalExpenses);

    return {
      totalIncome,
      totalExpenses,
      net,
      byCategory,
    };
  }

  private async groupExpensesByCategory(
    expenses: { categoryId: string | null; amount: number }[],
    totalExpenses: number,
  ): Promise<CategoryBreakdown[]> {
    const categoryMap = new Map<string | null, number>();

    for (const expense of expenses) {
      const current = categoryMap.get(expense.categoryId) ?? 0;
      categoryMap.set(expense.categoryId, current + expense.amount);
    }

    const categories = await this.loadCategories();

    const breakdown: CategoryBreakdown[] = [];

    for (const [categoryId, total] of categoryMap) {
      const categoryName = categoryId
        ? categories.get(categoryId)?.name ?? "Unknown"
        : "Uncategorised";

      const percentage =
        totalExpenses > 0 ? (total / totalExpenses) * 100 : 0;

      breakdown.push({
        categoryName,
        total,
        percentage: Math.round(percentage * 10) / 10,
      });
    }

    breakdown.sort((a, b) => b.total - a.total);

    return breakdown;
  }

  private async loadCategories(): Promise<Map<string, { name: string }>> {
    const categories = await this.categoryRepo.getAllCategories();
    const map = new Map<string, { name: string }>();
    for (const category of categories) {
      map.set(category.id.getValue(), { name: category.name });
    }
    return map;
  }

  private getMonthDateRange(isPreviousMonth: boolean): {
    startDate: Date;
    endDate: Date;
  } {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();

    if (isPreviousMonth) {
      month -= 1;
      if (month < 0) {
        month = 11;
        year -= 1;
      }
    }

    const startDate = new Date(year, month, 1, 0, 0, 0, 0);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    return { startDate, endDate };
  }
}
