import { TransactionType } from "../constants/transaction-type";

export interface FinancialTransactionService{
    createTransaction(params: {
        transactionDate: Date;
        type: TransactionType;
        amount: number;
        vendorId?: string;
        categoryId?: string;
        description?: string;
      }): Promise<void>
}