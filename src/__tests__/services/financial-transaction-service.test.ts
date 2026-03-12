import { SqliteFinancialTransactionService } from "../../infrastructure/services/sqlite/sqlite-financial-transaction-service";
import { Account } from "../../domain/entities/account";
import { Transaction } from "../../domain/entities/transaction";
import { AccountRepository } from "../../domain/repository/account-repository";
import { TransactionRepository } from "../../domain/repository/transaction-repository";
import { VendorRepository } from "../../domain/repository/vendor-repository";
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
    );

    await expect(
      service.deleteTransaction({ id: fakeId })
    ).rejects.toThrow("Transaction to delete not found");
  });
});