import { BudgetRepository } from "../../domain/repository/budget-repository";
import { TransactionRepository } from "../../domain/repository/transaction-repository";
import { CategoryRepository } from "../../domain/repository/category-repository";
import { SetMonthlyBudgetUseCase } from "../../application/use-case/budget/set-monthly-budget";
import { GetCurrentBudgetUseCase } from "../../application/use-case/budget/get-current-budget";
import { CopyBudgetToNextMonthUseCase } from "../../application/use-case/budget/copy-budget-to-next-month";
import { Budget, BudgetAllocation } from "../../domain/entities/budget";
import { Category } from "../../domain/entities/category";
import { Transaction } from "../../domain/entities/transaction";

function makeBudgetRepo(): jest.Mocked<BudgetRepository> {
  return {
    getBudget: jest.fn(),
    saveBudget: jest.fn(),
    updateBudget: jest.fn(),
    deleteBudget: jest.fn(),
    getAllocations: jest.fn(),
    saveAllocation: jest.fn(),
    updateAllocation: jest.fn(),
    deleteAllocation: jest.fn(),
    deleteAllocationsByBudgetId: jest.fn(),
  };
}

function makeCategoryRepo(categories: Category[]): jest.Mocked<CategoryRepository> {
  return {
    getCategory: jest.fn(async () => categories),
    getAllCategories: jest.fn(async () => categories),
    saveCategory: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
  };
}

function makeTransactionRepo(transactions: Transaction[]): jest.Mocked<TransactionRepository> {
  return {
    getTransaction: jest.fn(),
    saveTransaction: jest.fn(),
    updateTransaction: jest.fn(),
    deleteTransaction: jest.fn(),
    findTransactions: jest.fn(async () => transactions),
  };
}

function createTransaction(categoryId: string | null, amount: number): Transaction {
  return Transaction.create({
    vendorId: null,
    categoryId,
    transactionDate: new Date(),
    type: "EXPENSE",
    spendingType: "ESSENTIAL",
    amount,
    description: null,
  });
}

function createCategory(name: string): Category {
  return Category.create({ name });
}

// ── SetMonthlyBudgetUseCase tests ──────────────────────────────────────────────

describe("SetMonthlyBudgetUseCase.execute()", () => {
  it("creates a new budget when none exists", async () => {
    const budgetRepo = makeBudgetRepo();
    budgetRepo.getBudget.mockResolvedValue(null);
    budgetRepo.saveBudget.mockImplementation(async (budget) => budget.id);

    const useCase = new SetMonthlyBudgetUseCase(budgetRepo);
    const result = await useCase.execute({
      totalAmount: 5000,
      month: 3,
      year: 2026,
      allocations: [
        { categoryId: "cat-1", allocatedAmount: 2000 },
      ],
    });

    expect(budgetRepo.getBudget).toHaveBeenCalledWith(3, 2026);
    expect(budgetRepo.saveBudget).toHaveBeenCalled();
    expect(budgetRepo.updateBudget).not.toHaveBeenCalled();
    expect(result.getValue()).toBeDefined();
  });

  it("updates existing budget when one exists", async () => {
    const existingBudget = Budget.create({ totalAmount: 3000, month: 3, year: 2026 });
    const budgetRepo = makeBudgetRepo();
    budgetRepo.getBudget.mockResolvedValue(existingBudget);
    budgetRepo.updateBudget.mockResolvedValue(existingBudget.id);

    const useCase = new SetMonthlyBudgetUseCase(budgetRepo);
    await useCase.execute({
      totalAmount: 5000,
      month: 3,
      year: 2026,
      allocations: [],
    });

    expect(budgetRepo.saveBudget).not.toHaveBeenCalled();
    expect(budgetRepo.updateBudget).toHaveBeenCalled();
  });

  it("sets correct allocations on new budget", async () => {
    const budgetRepo = makeBudgetRepo();
    budgetRepo.getBudget.mockResolvedValue(null);
    budgetRepo.saveBudget.mockImplementation(async (budget) => {
      expect(budget.allocations).toHaveLength(2);
      expect(budget.allocations[0].categoryId).toBe("cat-1");
      expect(budget.allocations[0].allocatedAmount).toBe(1000);
      expect(budget.allocations[1].categoryId).toBe("cat-2");
      expect(budget.allocations[1].allocatedAmount).toBe(2000);
      return budget.id;
    });

    const useCase = new SetMonthlyBudgetUseCase(budgetRepo);
    await useCase.execute({
      totalAmount: 5000,
      month: 3,
      year: 2026,
      allocations: [
        { categoryId: "cat-1", allocatedAmount: 1000 },
        { categoryId: "cat-2", allocatedAmount: 2000 },
      ],
    });
  });
});

// ── GetCurrentBudgetUseCase tests ─────────────────────────────────────────────

describe("GetCurrentBudgetUseCase.execute()", () => {
  it("returns hasBudget: false when no budget exists", async () => {
    const budgetRepo = makeBudgetRepo();
    budgetRepo.getBudget.mockResolvedValue(null);
    const transactionRepo = makeTransactionRepo([]);
    const categoryRepo = makeCategoryRepo([]);

    const useCase = new GetCurrentBudgetUseCase(budgetRepo, transactionRepo, categoryRepo);
    const result = await useCase.execute(3, 2026);

    expect(result.hasBudget).toBe(false);
    expect(result.budget).toBeNull();
    expect(result.month).toBe(3);
    expect(result.year).toBe(2026);
    expect(result.totalAllocated).toBe(0);
  });

  it("calculates totalSpent from expenses", async () => {
    const budgetRepo = makeBudgetRepo();
    budgetRepo.getBudget.mockResolvedValue(null);
    const transactionRepo = makeTransactionRepo([
      createTransaction(null, 100),
      createTransaction(null, 200),
      createTransaction(null, 300),
    ]);
    const categoryRepo = makeCategoryRepo([]);

    const useCase = new GetCurrentBudgetUseCase(budgetRepo, transactionRepo, categoryRepo);
    const result = await useCase.execute(3, 2026);

    expect(result.totalSpent).toBe(600);
    expect(result.unallocatedSpent).toBe(600);
  });

  it("groups spending by category for allocations", async () => {
    const foodCat = createCategory("Food");
    const transportCat = createCategory("Transport");

    const budget = Budget.create({ totalAmount: 5000, month: 3, year: 2026 });
    budget.setAllocations([
      BudgetAllocation.create({ categoryId: foodCat.id.getValue(), allocatedAmount: 2000 }),
      BudgetAllocation.create({ categoryId: transportCat.id.getValue(), allocatedAmount: 1000 }),
    ]);

    const budgetRepo = makeBudgetRepo();
    budgetRepo.getBudget.mockResolvedValue(budget);
    const transactionRepo = makeTransactionRepo([
      createTransaction(foodCat.id.getValue(), 500),
      createTransaction(foodCat.id.getValue(), 300),
      createTransaction(transportCat.id.getValue(), 200),
    ]);
    const categoryRepo = makeCategoryRepo([foodCat, transportCat]);

    const useCase = new GetCurrentBudgetUseCase(budgetRepo, transactionRepo, categoryRepo);
    const result = await useCase.execute(3, 2026);

    expect(result.hasBudget).toBe(true);
    expect(result.totalSpent).toBe(1000);
    expect(result.categoryAllocations).toHaveLength(2);

    const foodAllocation = result.categoryAllocations.find(c => c.categoryName === "Food");
    expect(foodAllocation?.spentAmount).toBe(800);
    expect(foodAllocation?.remainingAmount).toBe(1200);

    const transportAllocation = result.categoryAllocations.find(c => c.categoryName === "Transport");
    expect(transportAllocation?.spentAmount).toBe(200);
    expect(transportAllocation?.remainingAmount).toBe(800);
  });

  it("calculates unallocated amounts correctly", async () => {
    const foodCat = createCategory("Food");

    const budget = Budget.create({ totalAmount: 5000, month: 3, year: 2026 });
    budget.setAllocations([
      BudgetAllocation.create({ categoryId: foodCat.id.getValue(), allocatedAmount: 2000 }),
    ]);

    const budgetRepo = makeBudgetRepo();
    budgetRepo.getBudget.mockResolvedValue(budget);
    const transactionRepo = makeTransactionRepo([
      createTransaction(foodCat.id.getValue(), 1000),
      createTransaction(null, 500),
    ]);
    const categoryRepo = makeCategoryRepo([foodCat]);

    const useCase = new GetCurrentBudgetUseCase(budgetRepo, transactionRepo, categoryRepo);
    const result = await useCase.execute(3, 2026);

    expect(result.totalAllocated).toBe(2000);
    expect(result.unallocatedBudget).toBe(3000);
    expect(result.unallocatedSpent).toBe(500);
  });

  it("uses current month/year when not specified", async () => {
    jest.useRealTimers();
    const now = new Date();
    const expectedMonth = now.getMonth() + 1;
    const expectedYear = now.getFullYear();

    const budgetRepo = makeBudgetRepo();
    budgetRepo.getBudget.mockResolvedValue(null);
    const transactionRepo = makeTransactionRepo([]);
    const categoryRepo = makeCategoryRepo([]);

    const useCase = new GetCurrentBudgetUseCase(budgetRepo, transactionRepo, categoryRepo);
    const result = await useCase.execute();

    expect(result.month).toBe(expectedMonth);
    expect(result.year).toBe(expectedYear);
    jest.useFakeTimers();
  });
});

// ── CopyBudgetToNextMonthUseCase tests ─────────────────────────────────────────

describe("CopyBudgetToNextMonthUseCase.execute()", () => {
  it("returns null when next month already has a budget", async () => {
    const budgetRepo = makeBudgetRepo();
    budgetRepo.getBudget.mockResolvedValueOnce(Budget.create({ totalAmount: 1000, month: 1, year: 2026 }));
    budgetRepo.getBudget.mockResolvedValueOnce(Budget.create({ totalAmount: 2000, month: 2, year: 2026 }));

    const useCase = new CopyBudgetToNextMonthUseCase(budgetRepo);
    const result = await useCase.execute();

    expect(result).toBeNull();
    expect(budgetRepo.saveBudget).not.toHaveBeenCalled();
  });

  it("returns null when current month has no budget", async () => {
    const budgetRepo = makeBudgetRepo();
    budgetRepo.getBudget.mockResolvedValue(null);

    const useCase = new CopyBudgetToNextMonthUseCase(budgetRepo);
    const result = await useCase.execute();

    expect(result).toBeNull();
    expect(budgetRepo.saveBudget).not.toHaveBeenCalled();
  });

  it("copies budget to next month with same total and allocations", async () => {
    const currentBudget = Budget.create({ totalAmount: 5000, month: 1, year: 2026 });
    currentBudget.setAllocations([
      BudgetAllocation.create({ categoryId: "cat-1", allocatedAmount: 2000 }),
      BudgetAllocation.create({ categoryId: "cat-2", allocatedAmount: 1000 }),
    ]);

    const budgetRepo = makeBudgetRepo();
    budgetRepo.getBudget
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(currentBudget);
    budgetRepo.saveBudget.mockImplementation(async (budget) => {
      expect(budget.totalAmount).toBe(5000);
      expect(budget.allocations).toHaveLength(2);
      expect(budget.allocations[0].categoryId).toBe("cat-1");
      expect(budget.allocations[0].allocatedAmount).toBe(2000);
      return budget.id;
    });

    const useCase = new CopyBudgetToNextMonthUseCase(budgetRepo);
    await useCase.execute();

    expect(budgetRepo.saveBudget).toHaveBeenCalled();
  });

  it("handles December -> January year rollover", () => {
    const useCase = new CopyBudgetToNextMonthUseCase(makeBudgetRepo());
    
    const result1 = useCase["getNextMonth"](12, 2025);
    expect(result1).toEqual({ nextMonth: 1, nextYear: 2026 });

    const result2 = useCase["getNextMonth"](1, 2026);
    expect(result2).toEqual({ nextMonth: 2, nextYear: 2026 });

    const result3 = useCase["getNextMonth"](11, 2026);
    expect(result3).toEqual({ nextMonth: 12, nextYear: 2026 });
  });
});
