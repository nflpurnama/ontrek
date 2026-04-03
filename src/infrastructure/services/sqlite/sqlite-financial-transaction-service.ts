import { Transaction } from "@/src/domain/entities/transaction";
import { AccountRepository } from "@/src/domain/repository/account-repository";
import { TransactionRepository } from "@/src/domain/repository/transaction-repository";
import {
  CreateTransactionParams,
  DeleteTransactionParams,
  FinancialTransactionService,
  UpdateTransactionParams,
} from "@/src/domain/services/financial-transaction-service";
import { DatabaseTransaction } from "@/src/domain/database/database-transaction";
import { VendorRepository } from "@/src/domain/repository/vendor-repository";
import { Vendor } from "@/src/domain/entities/vendor";
import { SavingsGoalRepository } from "@/src/domain/repository/savings-goal-repository";

export class SqliteFinancialTransactionService implements FinancialTransactionService {
  constructor(
    private readonly databaseTransaction: DatabaseTransaction,
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly vendorRepository: VendorRepository,
    private readonly savingsGoalRepository: SavingsGoalRepository,
  ) {}

  async createTransaction(params: CreateTransactionParams): Promise<string> {
    let createdTransactionId: string = "";
    await this.databaseTransaction.runInTransaction(async () => {
      const accounts = await this.accountRepository.getAllAccounts();
      if (!accounts.length) {
        throw new Error("Account not found");
      }
      const account = accounts[0];

      let vendorId = null;
      if (params.vendor) {
        vendorId = params.vendor.id.getValue();
      } else if (params.vendorName) {
        vendorId = (
          await this.vendorRepository.saveVendor(
            Vendor.create({ name: params.vendorName, defaultCategoryId: null }),
          )
        ).getValue();
      }

      let categoryId = params.category?.id.getValue() ?? null;

      const transaction = Transaction.create({
        amount: params.amount,
        transactionDate: params.transactionDate,
        type: params.type,
        vendorId: vendorId,
        categoryId: categoryId,
        description: params.description,
        spendingType: params.spendingType,
      });

      if (transaction.type === "INCOME") {
        account.credit(transaction.amount);
      } else {
        account.debit(transaction.amount);
      }

      await this.transactionRepository.saveTransaction(transaction);
      await this.accountRepository.updateAccount(account);
      createdTransactionId = transaction.id.getValue();
    });
    return createdTransactionId;
  }

  async updateTransaction(params: UpdateTransactionParams): Promise<void> {
    await this.databaseTransaction.runInTransaction(async () => {
      const accounts = await this.accountRepository.getAllAccounts();
      if (!accounts.length) {
        throw new Error("Account not found");
      }
      const account = accounts[0];

      const transactions = await this.transactionRepository.getTransaction([params.id]);
      if (!transactions.length) {
        throw new Error("Transaction not found");
      }
      const existing = transactions[0];

      const originalSignedAmount = existing.signedAmount;
      if (existing.type === "INCOME") {
        account.debit(existing.amount);
      } else {
        account.credit(existing.amount);
      }

      if (params.amount !== undefined) {
        existing.updateAmount(params.amount);
      }
      if (params.type !== undefined) {
        existing.updateType(params.type);
      }
      if (params.transactionDate !== undefined) {
        existing.updateTransactionDate(params.transactionDate);
      }
      if (params.description !== undefined && params.description !== null) {
        const trimmed = params.description.trim();
        if (trimmed) {
          existing.updateDescription(trimmed);
        } else {
          existing.clearDescription();
        }
      }
      if (params.category !== undefined) {
        if (params.category) {
          existing.updateCategory(params.category.id.getValue());
        }
      }
      if (params.vendorName !== undefined || params.vendor !== undefined) {
        let vendorId = params.vendor?.id.getValue() ?? null;
        if (!vendorId && params.vendorName) {
          vendorId = (
            await this.vendorRepository.saveVendor(
              Vendor.create({ name: params.vendorName, defaultCategoryId: null }),
            )
          ).getValue();
        }
        if (vendorId) {
          existing.updateVendor(vendorId);
        }
      }

      const newSignedAmount = existing.signedAmount;
      if (existing.type === "INCOME") {
        account.credit(existing.amount);
      } else {
        account.debit(existing.amount);
      }

      await this.transactionRepository.updateTransaction(existing);
      await this.accountRepository.updateAccount(account);
    });
  }

  async deleteTransaction(params: DeleteTransactionParams): Promise<void> {
    await this.databaseTransaction.runInTransaction(async () => {
      const accounts = await this.accountRepository.getAllAccounts();
      if (!accounts.length) {
        throw new Error("Account not found");
      }
      const account = accounts[0];

      const transactions = await this.transactionRepository.getTransaction([
        params.id,
      ]);
      if (!transactions.length) {
        throw new Error("Transaction to delete not found");
      }
      const transaction = transactions[0];

      if (transaction.type === "INCOME") {
        account.debit(transaction.amount);
      } else {
        account.credit(transaction.amount);
      }

      const link = await this.savingsGoalRepository.findLinkByTransactionId(
        params.id.getValue(),
      );
      if (link) {
        const goal = await this.savingsGoalRepository.findById(link.goalId);
        if (goal) {
          if (link.type === "DEPOSIT") {
            goal.withdraw(transaction.amount);
          } else {
            goal.deposit(transaction.amount);
          }
          await this.savingsGoalRepository.update(goal);
        }
        await this.savingsGoalRepository.deleteLink(params.id.getValue());
      }

      await this.accountRepository.updateAccount(account);
      await this.transactionRepository.deleteTransaction(transaction.id);
    });
  }
}
