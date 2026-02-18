import { TransactionType } from "../constants/transaction-type";

export interface CreateTransactionParams {
  transactionDate: Date;
  type: TransactionType;
  amount: number;
  vendorId?: string;
  categoryId?: string;
  description?: string;
}

export interface FinancialTransactionService {
  createTransaction(params: CreateTransactionParams): Promise<void>;
}
