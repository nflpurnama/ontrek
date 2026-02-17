import { Transaction } from "../entities/transaction";
import { Id } from "../value-objects/id";

export interface TransactionRepository {
  getTransaction(ids: Id[]): Promise<Transaction[]>;
  getAllTransactions(): Promise<Transaction[]>;
  saveTransaction(transaction: Transaction): Promise<Id>;
  updateTransaction(transaction: Transaction): Promise<Id>;
  deleteTransaction(id: Id): Promise<void>;
}
