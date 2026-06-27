import { TransactionRepository } from "@/src/domain/repository/transaction-repository";
import { HeatmapCell, MonthlyHeatmap } from "@/src/application/types/heatmap";

export class GetMonthlyHeatmapUseCase {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute({ year, month }: { year: number; month: number }): Promise<MonthlyHeatmap> {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDate = new Date(year, month, 1, 0, 0, 0, 0);
    const endDate = new Date(year, month, daysInMonth, 23, 59, 59, 999);

    const transactions = await this.transactionRepository.findTransactions({
      startDate,
      endDate,
    });

    const dailyTotals = new Array<number>(daysInMonth).fill(0);
    for (const t of transactions) {
      if (t.type === "EXPENSE") {
        const day = t.transactionDate.getDate();
        const idx = day - 1;
        if (idx >= 0 && idx < daysInMonth) {
          dailyTotals[idx] += t.amount;
        }
      }
    }

    const maxDailyExpense = dailyTotals.reduce((max, v) => (v > max ? v : max), 0);

    const cells: HeatmapCell[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const expenseTotal = dailyTotals[day - 1];
      const intensity = maxDailyExpense > 0 ? expenseTotal / maxDailyExpense : 0;
      cells.push({
        date: new Date(year, month, day),
        expenseTotal,
        intensity,
      });
    }

    return {
      year,
      month,
      cells,
      maxDailyExpense,
    };
  }
}