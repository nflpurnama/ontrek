import { TransactionType } from "@/src/domain/constants/transaction-type";
import { Transaction } from "@/src/domain/entities/transaction";
import { AccountRepository } from "@/src/domain/repository/account-repository";
import { TransactionRepository } from "@/src/domain/repository/transaction-repository";
import {
  CreateTransactionParams,
  DeleteTransactionParams,
  FinancialTransactionService,
} from "@/src/domain/services/financial-transaction-service";
import { SqliteTransaction } from "../../database/sqlite/sqlite-transaction";

export class SqliteFinancialTransactionService implements FinancialTransactionService {
  constructor(
    private readonly databaseTransaction: SqliteTransaction,
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async createTransaction(params: CreateTransactionParams): Promise<void> {
    await this.databaseTransaction.runInTransaction(async () => {
      const accounts = await this.accountRepository.getAll();
      if (!accounts.length) {
        throw new Error("Account not found");
      }
      const account = accounts[0];

      const transaction = Transaction.create(params);

      if (transaction.type === TransactionType.CREDIT) {
        account.credit(transaction.amount);
      } else {
        account.debit(transaction.amount);
      }

      await this.transactionRepository.saveTransaction(transaction);
      await this.accountRepository.update(account);
    });
  }

  async deleteTransaction(params: DeleteTransactionParams): Promise<void> {
    await this.databaseTransaction.runInTransaction(async () => {
      const accounts = await this.accountRepository.getAll();
      if (!accounts.length) {
        throw new Error("Account not found");
      }
      const account = accounts[0];

      const transactions = await this.transactionRepository.getTransaction([params.id]);
      if (!transactions.length) {
        throw new Error("Transaction to delete not found");
      }
      const transaction = transactions[0];

      if (transaction.type === TransactionType.CREDIT) {
        account.debit(transaction.amount);
      } else {
        account.credit(transaction.amount);
      }

      await this.accountRepository.update(account);
      await this.transactionRepository.deleteTransaction(transaction.id);
    });
  }
}
