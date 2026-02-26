import { TransactionType } from "../constants/transaction-type";
import { Transaction } from "../entities/transaction";
import { Id } from "../value-objects/id";

export interface TransactionFilter {
  startDate?: Date;
  endDate?: Date;
  vendorId?: string;
  categoryId?: string;
  accountId?: string;
  transactionType?: TransactionType;
}

export interface TransactionRepository {
  getTransaction(ids: Id[]): Promise<Transaction[]>;
  saveTransaction(transaction: Transaction): Promise<Id>;
  updateTransaction(transaction: Transaction): Promise<Id>;
  deleteTransaction(id: Id): Promise<void>;
  findTransactions(filter: TransactionFilter): Promise<Transaction[]>;
}
