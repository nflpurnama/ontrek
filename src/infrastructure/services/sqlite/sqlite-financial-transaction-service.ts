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
import { VendorRepository } from "@/src/domain/repository/vendor-repository";
import { Vendor } from "@/src/domain/entities/vendor";

export class SqliteFinancialTransactionService implements FinancialTransactionService {
  constructor(
    private readonly databaseTransaction: SqliteTransaction,
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly vendorRepository: VendorRepository
  ) {}

  async createTransaction(params: CreateTransactionParams): Promise<void> {
    await this.databaseTransaction.runInTransaction(async () => {
      const accounts = await this.accountRepository.getAll();
      if (!accounts.length) {
        throw new Error("Account not found");
      }
      const account = accounts[0];

      let vendorId = null;
      if (params.vendorName){
        const vendors = await this.vendorRepository.findVendors({name: params.vendorName});
        if (vendors.length > 0) {
          vendorId = vendors[0].id.getValue()
        }
        else{
          const newVendor = Vendor.create({name: params.vendorName, defaultCategoryId: null});
          vendorId = (await this.vendorRepository.saveVendor(newVendor)).getValue();
        }
      }

      let categoryId = null;
      if (params.categoryId){}

      const transaction = Transaction.create({
        amount: params.amount,
        transactionDate: params.transactionDate,
        type: params.type,
        vendorId: vendorId,
        categoryId: categoryId,
        description: params.description
      });

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
