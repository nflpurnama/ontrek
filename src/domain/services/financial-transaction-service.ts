import { TransactionType } from "../constants/transaction-type";
import { Vendor } from "../entities/vendor";
import { Id } from "../value-objects/id";

export interface CreateTransactionParams {
  transactionDate: Date;
  type: TransactionType;
  amount: number;
  vendorName: string | null;
  vendor: Vendor | null;
  accountId: string;
  categoryId: string | null;
  description: string | null;
}

export interface DeleteTransactionParams {
  id: Id;
}

export interface FinancialTransactionService {
  createTransaction(params: CreateTransactionParams): Promise<void>;
  deleteTransaction(params: DeleteTransactionParams): Promise<void>;
}
