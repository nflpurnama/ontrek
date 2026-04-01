import { SqliteFinancialTransactionService } from "../../infrastructure/services/sqlite/sqlite-financial-transaction-service";
import { Account } from "../../domain/entities/account";
import { Transaction } from "../../domain/entities/transaction";
import { SavingsGoal } from "../../domain/entities/savings-goal";
import { AccountRepository } from "../../domain/repository/account-repository";
import { TransactionRepository } from "../../domain/repository/transaction-repository";
import { VendorRepository } from "../../domain/repository/vendor-repository";
import { SavingsGoalRepository } from "../../domain/repository/savings-goal-repository";
import { DatabaseTransaction } from "../../domain/database/database-transaction";
import { Id } from "../../domain/value-objects/id";
import { Vendor } from "../../domain/entities/vendor";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeAccount(balance: number) {
  return Account.create({ name: "Default Account", balance });
}

function makeTransaction(type: "EXPENSE" | "INCOME", amount: number) {
  return Transaction.create({
    vendorId: null,
    categoryId: null,
    transactionDate: new Date(),
    type,
    spendingType: "ESSENTIAL",
    amount,
    description: null,
  });
}

// ── Mock factories ────────────────────────────────────────────────────────────

/**
 * Returns a DatabaseTransaction mock whose runInTransaction immediately
 * executes the callback — simulating a synchronous transaction wrapper.
 */
function makeDatabaseTransaction(): DatabaseTransaction {
  return {
    runInTransaction: jest.fn(async (cb) => { await cb(); }),
  };
}

function makeAccountRepo(account: Account): jest.Mocked<AccountRepository> {
  return {
    getAllAccounts: jest.fn(async () => [account]),
    getAccounts: jest.fn(async ({}) => [account]),
    saveAccount: jest.fn(async ({}) => account.id),
    updateAccount: jest.fn(async ({}) => account.id),
    deleteAccount: jest.fn(async ({}) => {}),
  };
}

function makeTransactionRepo(existing?: Transaction): jest.Mocked<TransactionRepository> {
  return {
    saveTransaction: jest.fn(async (t) => t.id),
    getTransaction: jest.fn(async ({}) => existing ? [existing] : []),
    updateTransaction: jest.fn(async (t) => t.id),
    deleteTransaction: jest.fn(async ({}) => {}),
    findTransactions: jest.fn(async ({}) => []),
  };
}

function makeVendorRepo(): jest.Mocked<VendorRepository> {
  const fakeId = Id.rehydrate("aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa");
  return {
    saveVendor: jest.fn(async ({}) => fakeId),
    getVendors: jest.fn(async ({}) => []),
    getAllVendors: jest.fn(async () => []),
    updateVendor: jest.fn(async (v) => v.id),
    deleteVendor: jest.fn(async ({}) => {}),
    findVendors: jest.fn(async ({}) => []),
  };
}

function makeSavingsGoalRepo(goal?: SavingsGoal | null): jest.Mocked<SavingsGoalRepository> {
  return {
    create: jest.fn(async (g: SavingsGoal) => {}),
    findById: jest.fn(async (id: string) => goal ?? null),
    findAll: jest.fn(async () => []),
    update: jest.fn(async (g: SavingsGoal) => {}),
    linkTransaction: jest.fn(async (goalId: string, transactionId: string, type: "DEPOSIT" | "WITHDRAW") => {}),
    findLinkByTransactionId: jest.fn(
      async (tid: string): Promise<{ goalId: string; type: "DEPOSIT" | "WITHDRAW" } | null> => null
    ),
    deleteLink: jest.fn(async (tid: string) => {}),
  };
}

// ── createTransaction ─────────────────────────────────────────────────────────

describe("createTransaction — EXPENSE", () => {
  it("debits the account by the transaction amount", async () => {
    const account = makeAccount(500);
    const accountRepo = makeAccountRepo(account);
    const service = new SqliteFinancialTransactionService(
      makeDatabaseTransaction(),
      accountRepo,
      makeTransactionRepo(),
      makeVendorRepo(),
      makeSavingsGoalRepo(),
    );

    await service.createTransaction({
      transactionDate: new Date(),
      type: "EXPENSE",
      amount: 120,
      vendorName: null,
      vendor: null,
      category: null,
      description: null,
      spendingType: "ESSENTIAL",
    });

    expect(account.balance).toBe(380);
  });

  it("persists the transaction via the repository", async () => {
    const account = makeAccount(500);
    const transactionRepo = makeTransactionRepo();
    const service = new SqliteFinancialTransactionService(
      makeDatabaseTransaction(),
      makeAccountRepo(account),
      transactionRepo,
      makeVendorRepo(),
      makeSavingsGoalRepo(),
    );

    await service.createTransaction({
      transactionDate: new Date(),
      type: "EXPENSE",
      amount: 50,
      vendorName: null,
      vendor: null,
      category: null,
      description: null,
      spendingType: "ESSENTIAL",
    });

    expect(transactionRepo.saveTransaction).toHaveBeenCalledTimes(1);
  });

  it("updates the account after debiting", async () => {
    const account = makeAccount(500);
    const accountRepo = makeAccountRepo(account);
    const service = new SqliteFinancialTransactionService(
      makeDatabaseTransaction(),
      accountRepo,
      makeTransactionRepo(),
      makeVendorRepo(),
      makeSavingsGoalRepo(),
    );

    await service.createTransaction({
      transactionDate: new Date(),
      type: "EXPENSE",
      amount: 50,
      vendorName: null,
      vendor: null,
      category: null,
      description: null,
      spendingType: "ESSENTIAL",
    });

    expect(accountRepo.updateAccount).toHaveBeenCalledWith(account);
  });
});

describe("createTransaction — INCOME", () => {
  it("credits the account by the transaction amount", async () => {
    const account = makeAccount(100);
    const service = new SqliteFinancialTransactionService(
      makeDatabaseTransaction(),
      makeAccountRepo(account),
      makeTransactionRepo(),
      makeVendorRepo(),
      makeSavingsGoalRepo(),
    );

    await service.createTransaction({
      transactionDate: new Date(),
      type: "INCOME",
      amount: 300,
      vendorName: null,
      vendor: null,
      category: null,
      description: null,
      spendingType: "ESSENTIAL",
    });

    expect(account.balance).toBe(400);
  });
});

describe("createTransaction — vendor handling", () => {
  it("uses the provided Vendor entity id without creating a new vendor", async () => {
    const account = makeAccount(200);
    const vendorRepo = makeVendorRepo();
    const existingVendor = Vendor.create({ name: "Starbucks", defaultCategoryId: null });

    const service = new SqliteFinancialTransactionService(
      makeDatabaseTransaction(),
      makeAccountRepo(account),
      makeTransactionRepo(),
      vendorRepo,
      makeSavingsGoalRepo(),
    );

    await service.createTransaction({
      transactionDate: new Date(),
      type: "EXPENSE",
      amount: 10,
      vendorName: null,
      vendor: existingVendor,
      category: null,
      description: null,
      spendingType: "DISCRETIONARY",
    });

    expect(vendorRepo.saveVendor).not.toHaveBeenCalled();
  });

  it("creates a new vendor when only a vendorName is supplied", async () => {
    const account = makeAccount(200);
    const vendorRepo = makeVendorRepo();

    const service = new SqliteFinancialTransactionService(
      makeDatabaseTransaction(),
      makeAccountRepo(account),
      makeTransactionRepo(),
      vendorRepo,
      makeSavingsGoalRepo(),
    );

    await service.createTransaction({
      transactionDate: new Date(),
      type: "EXPENSE",
      amount: 10,
      vendorName: "New Cafe",
      vendor: null,
      category: null,
      description: null,
      spendingType: "DISCRETIONARY",
    });

    expect(vendorRepo.saveVendor).toHaveBeenCalledTimes(1);
  });
});

describe("createTransaction — error handling", () => {
  it("throws when no account exists", async () => {
    const accountRepo: jest.Mocked<AccountRepository> = {
      getAllAccounts: jest.fn(async () => []),
      getAccounts: jest.fn(async ({}) => []),
      saveAccount: jest.fn(),
      updateAccount: jest.fn(),
      deleteAccount: jest.fn(),
    };

    const service = new SqliteFinancialTransactionService(
      makeDatabaseTransaction(),
      accountRepo,
      makeTransactionRepo(),
      makeVendorRepo(),
      makeSavingsGoalRepo(),
    );

    await expect(service.createTransaction({
      transactionDate: new Date(),
      type: "EXPENSE",
      amount: 50,
      vendorName: null,
      vendor: null,
      category: null,
      description: null,
      spendingType: "ESSENTIAL",
    })).rejects.toThrow("Account not found");
  });
});

// ── deleteTransaction ─────────────────────────────────────────────────────────

describe("deleteTransaction — balance reversal", () => {
  it("credits the account when deleting an EXPENSE (reverses the debit)", async () => {
    const account = makeAccount(380); // balance after a 120 expense on 500
    const existing = makeTransaction("EXPENSE", 120);
    const accountRepo = makeAccountRepo(account);

    const transactionRepo = makeTransactionRepo(existing);
    transactionRepo.getTransaction = jest.fn(async ({}) => [existing]);

    const service = new SqliteFinancialTransactionService(
      makeDatabaseTransaction(),
      accountRepo,
      transactionRepo,
      makeVendorRepo(),
      makeSavingsGoalRepo(),
    );

    await service.deleteTransaction({ id: existing.id });

    expect(account.balance).toBe(500); // restored
  });

  it("debits the account when deleting an INCOME (reverses the credit)", async () => {
    const account = makeAccount(800); // balance after a 300 income on 500
    const existing = makeTransaction("INCOME", 300);

    const transactionRepo = makeTransactionRepo(existing);
    transactionRepo.getTransaction = jest.fn(async ({}) => [existing]);

    const accountRepo = makeAccountRepo(account);

    const service = new SqliteFinancialTransactionService(
      makeDatabaseTransaction(),
      accountRepo,
      transactionRepo,
      makeVendorRepo(),
      makeSavingsGoalRepo(),
    );

    await service.deleteTransaction({ id: existing.id });

    expect(account.balance).toBe(500); // restored
  });

  it("calls deleteTransaction on the repository", async () => {
    const account = makeAccount(100);
    const existing = makeTransaction("EXPENSE", 50);
    const transactionRepo = makeTransactionRepo(existing);
    transactionRepo.getTransaction = jest.fn(async ({}) => [existing]);

    const service = new SqliteFinancialTransactionService(
      makeDatabaseTransaction(),
      makeAccountRepo(account),
      transactionRepo,
      makeVendorRepo(),
      makeSavingsGoalRepo(),
    );

    await service.deleteTransaction({ id: existing.id });

    expect(transactionRepo.deleteTransaction).toHaveBeenCalledWith(existing.id);
  });

  it("throws when the transaction to delete does not exist", async () => {
    const account = makeAccount(100);
    const fakeId = makeTransaction("EXPENSE", 50).id;
    const transactionRepo = makeTransactionRepo();
    transactionRepo.getTransaction = jest.fn(async ({}) => []);

    const service = new SqliteFinancialTransactionService(
      makeDatabaseTransaction(),
      makeAccountRepo(account),
      transactionRepo,
      makeVendorRepo(),
      makeSavingsGoalRepo(),
    );

    await expect(
      service.deleteTransaction({ id: fakeId })
    ).rejects.toThrow("Transaction to delete not found");
  });
});

// ── deleteTransaction — savings goal balance reversal ─────────────────────────

describe("deleteTransaction — savings goal balance reversal", () => {
  it("withdraws from goal when deleting a DEPOSIT transaction", async () => {
    const account = makeAccount(600);
    const transaction = makeTransaction("INCOME", 100);
    const goal = SavingsGoal.rehydrate({
      id: "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa",
      name: "Vacation Fund",
      targetAmount: 1000,
      currentBalance: 100,
      targetDate: null,
      month: 1,
      year: 2026,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savingsGoalRepo = makeSavingsGoalRepo(goal);
    savingsGoalRepo.findLinkByTransactionId = jest.fn(
      async (_tid: string): Promise<{ goalId: string; type: "DEPOSIT" | "WITHDRAW" } | null> => ({
        goalId: "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa",
        type: "DEPOSIT" as const,
      })
    );

    const transactionRepo = makeTransactionRepo(transaction);
    transactionRepo.getTransaction = jest.fn(async ({}) => [transaction]);

    const service = new SqliteFinancialTransactionService(
      makeDatabaseTransaction(),
      makeAccountRepo(account),
      transactionRepo,
      makeVendorRepo(),
      savingsGoalRepo,
    );

    await service.deleteTransaction({ id: transaction.id });

    expect(goal.currentBalance).toBe(0);
    expect(savingsGoalRepo.update).toHaveBeenCalledWith(goal);
    expect(savingsGoalRepo.deleteLink).toHaveBeenCalledWith(transaction.id.getValue());
  });

  it("deposits to goal when deleting a WITHDRAW transaction", async () => {
    const account = makeAccount(400);
    const transaction = makeTransaction("EXPENSE", 100);
    const goal = SavingsGoal.rehydrate({
      id: "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb",
      name: "Vacation Fund",
      targetAmount: 1000,
      currentBalance: 400,
      targetDate: null,
      month: 1,
      year: 2026,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savingsGoalRepo = makeSavingsGoalRepo(goal);
    savingsGoalRepo.findLinkByTransactionId = jest.fn(
      async (_tid: string): Promise<{ goalId: string; type: "DEPOSIT" | "WITHDRAW" } | null> => ({
        goalId: "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb",
        type: "WITHDRAW" as const,
      })
    );

    const transactionRepo = makeTransactionRepo(transaction);
    transactionRepo.getTransaction = jest.fn(async ({}) => [transaction]);

    const service = new SqliteFinancialTransactionService(
      makeDatabaseTransaction(),
      makeAccountRepo(account),
      transactionRepo,
      makeVendorRepo(),
      savingsGoalRepo,
    );

    await service.deleteTransaction({ id: transaction.id });

    expect(goal.currentBalance).toBe(500);
    expect(savingsGoalRepo.update).toHaveBeenCalledWith(goal);
    expect(savingsGoalRepo.deleteLink).toHaveBeenCalledWith(transaction.id.getValue());
  });

  it("does not modify goal when transaction is not linked to a goal", async () => {
    const account = makeAccount(400);
    const transaction = makeTransaction("EXPENSE", 100);
    const goal = SavingsGoal.rehydrate({
      id: "ca3b5678-9abc-4def-8012-3456789abcde",
      name: "Vacation Fund",
      targetAmount: 1000,
      currentBalance: 500,
      targetDate: null,
      month: 1,
      year: 2026,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savingsGoalRepo = makeSavingsGoalRepo(goal);
    savingsGoalRepo.findLinkByTransactionId = jest.fn(
      async (_tid: string): Promise<{ goalId: string; type: "DEPOSIT" | "WITHDRAW" } | null> => null
    );

    const transactionRepo = makeTransactionRepo(transaction);
    transactionRepo.getTransaction = jest.fn(async ({}) => [transaction]);

    const service = new SqliteFinancialTransactionService(
      makeDatabaseTransaction(),
      makeAccountRepo(account),
      transactionRepo,
      makeVendorRepo(),
      savingsGoalRepo,
    );

    await service.deleteTransaction({ id: transaction.id });

    expect(goal.currentBalance).toBe(500);
    expect(savingsGoalRepo.update).not.toHaveBeenCalled();
    expect(savingsGoalRepo.deleteLink).not.toHaveBeenCalled();
  });

  it("handles case where linked goal no longer exists", async () => {
    const account = makeAccount(600);
    const transaction = makeTransaction("INCOME", 100);

    const savingsGoalRepo = makeSavingsGoalRepo(undefined);
    savingsGoalRepo.findLinkByTransactionId = jest.fn(
      async (_tid: string): Promise<{ goalId: string; type: "DEPOSIT" | "WITHDRAW" } | null> => ({
        goalId: "dddddddd-dddd-4ddd-dddd-dddddddddddd",
        type: "DEPOSIT" as const,
      })
    );

    const transactionRepo = makeTransactionRepo(transaction);
    transactionRepo.getTransaction = jest.fn(async ({}) => [transaction]);

    const service = new SqliteFinancialTransactionService(
      makeDatabaseTransaction(),
      makeAccountRepo(account),
      transactionRepo,
      makeVendorRepo(),
      savingsGoalRepo,
    );

    await service.deleteTransaction({ id: transaction.id });

    expect(savingsGoalRepo.update).not.toHaveBeenCalled();
    expect(savingsGoalRepo.deleteLink).toHaveBeenCalledWith(transaction.id.getValue());
  });
});