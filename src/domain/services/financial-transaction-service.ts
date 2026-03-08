import { SpendingType } from "../constants/spending-type";
import { TransactionType } from "../constants/transaction-type";
import { Category } from "../entities/category";
import { Vendor } from "../entities/vendor";
import { Id } from "../value-objects/id";

export interface CreateTransactionParams {
  transactionDate: Date;
  type: TransactionType;
  amount: number;
  vendorName: string | null;
  vendor: Vendor | null;
  category: Category | null;
  description: string | null;
  spendingType: SpendingType;
}

export interface DeleteTransactionParams {
    id: Id
}

export interface FinancialTransactionService {
  createTransaction(params: CreateTransactionParams): Promise<void>;
  deleteTransaction(params: DeleteTransactionParams): Promise<void>;
}
