import { TransactionType } from "../constants/transaction-type";
import { Id } from "../value-objects/id";

export interface CreateTransactionParams {
  transactionDate: Date;
  type: TransactionType;
  amount: number;
  vendorId?: string;
  categoryId?: string;
  description?: string;
}

export interface DeleteTransactionParams {
    id: Id
}

export interface FinancialTransactionService {
  createTransaction(params: CreateTransactionParams): Promise<void>;
  deleteTransaction(params: DeleteTransactionParams): Promise<void>;
}
