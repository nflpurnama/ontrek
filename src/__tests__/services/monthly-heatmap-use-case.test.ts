import { TransactionRepository } from "../../domain/repository/transaction-repository";
import { Transaction } from "../../domain/entities/transaction";
import { GetMonthlyHeatmapUseCase } from "../../application/use-case/transaction/get-monthly-heatmap";

function makeTransactionRepo(transactions: Transaction[]): jest.Mocked<TransactionRepository> {
  return {
    getTransaction: jest.fn(),
    saveTransaction: jest.fn(),
    updateTransaction: jest.fn(),
    deleteTransaction: jest.fn(),
    findTransactions: jest.fn(async () => transactions),
  };
}

function createTransaction(params: {
  date: Date;
  type: "EXPENSE" | "INCOME";
  amount: number;
}): Transaction {
  return Transaction.create({
    vendorId: null,
    categoryId: null,
    transactionDate: params.date,
    type: params.type,
    spendingType: "ESSENTIAL",
    amount: params.amount,
    description: null,
  });
}

describe("GetMonthlyHeatmapUseCase", () => {
  it("returns empty heatmap for a month with no transactions", async () => {
    const repo = makeTransactionRepo([]);
    const useCase = new GetMonthlyHeatmapUseCase(repo);
    const result = await useCase.execute({ year: 2026, month: 5 });
    expect(result.year).toBe(2026);
    expect(result.month).toBe(5);
    expect(result.cells).toHaveLength(30);
    expect(result.maxDailyExpense).toBe(0);
    expect(result.cells.every((c) => c.expenseTotal === 0 && c.intensity === 0)).toBe(true);
  });

  it("buckets only EXPENSE transactions and ignores INCOME", async () => {
    const txs = [
      createTransaction({ date: new Date(2026, 5, 10, 12, 0, 0), type: "EXPENSE", amount: 50000 }),
      createTransaction({ date: new Date(2026, 5, 10, 14, 0, 0), type: "EXPENSE", amount: 30000 }),
      createTransaction({ date: new Date(2026, 5, 15, 12, 0, 0), type: "INCOME", amount: 100000 }),
    ];
    const repo = makeTransactionRepo(txs);
    const useCase = new GetMonthlyHeatmapUseCase(repo);
    const result = await useCase.execute({ year: 2026, month: 5 });
    expect(result.cells[9].expenseTotal).toBe(80000);
    expect(result.cells[9].intensity).toBe(1);
    expect(result.cells[14].expenseTotal).toBe(0);
    expect(result.cells[14].intensity).toBe(0);
    expect(result.maxDailyExpense).toBe(80000);
  });

  it("scales intensity by max daily expense", async () => {
    const txs = [
      createTransaction({ date: new Date(2026, 5, 1, 12, 0, 0), type: "EXPENSE", amount: 100000 }),
      createTransaction({ date: new Date(2026, 5, 2, 12, 0, 0), type: "EXPENSE", amount: 50000 }),
      createTransaction({ date: new Date(2026, 5, 3, 12, 0, 0), type: "EXPENSE", amount: 25000 }),
    ];
    const repo = makeTransactionRepo(txs);
    const useCase = new GetMonthlyHeatmapUseCase(repo);
    const result = await useCase.execute({ year: 2026, month: 5 });
    expect(result.maxDailyExpense).toBe(100000);
    expect(result.cells[0].intensity).toBe(1);
    expect(result.cells[1].intensity).toBeCloseTo(0.5);
    expect(result.cells[2].intensity).toBeCloseTo(0.25);
  });

  it("passes correct month boundaries to repository", async () => {
    const findSpy = jest.fn(async () => []);
    const repo: jest.Mocked<TransactionRepository> = {
      getTransaction: jest.fn(),
      saveTransaction: jest.fn(),
      updateTransaction: jest.fn(),
      deleteTransaction: jest.fn(),
      findTransactions: findSpy,
    };
    const useCase = new GetMonthlyHeatmapUseCase(repo);
    await useCase.execute({ year: 2026, month: 5 });
    expect(findSpy).toHaveBeenCalledTimes(1);
    const arg = findSpy.mock.calls[0][0];
    expect(arg.startDate).toEqual(new Date(2026, 5, 1, 0, 0, 0, 0));
    expect(arg.endDate).toEqual(new Date(2026, 5, 30, 23, 59, 59, 999));
  });

  it("handles February of a non-leap year (28 days)", async () => {
    const repo = makeTransactionRepo([]);
    const useCase = new GetMonthlyHeatmapUseCase(repo);
    const result = await useCase.execute({ year: 2027, month: 1 });
    expect(result.cells).toHaveLength(28);
  });
});