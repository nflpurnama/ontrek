import { TransactionType } from "@/src/domain/constants/transaction-type";
import { Transaction } from "@/src/domain/entities/transaction";
import { TransactionRepository } from "@/src/domain/repository/transaction-repository";

export class CreateTransactionUseCase {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(params: {
    transactionDate: Date;
    type: TransactionType;
    amount: number;
    vendorId?: string;
    categoryId?: string;
    description?: string;
  }) {
    const transactionToSave = Transaction.create(params);
    await this.transactionRepository.saveTransaction(transactionToSave);
  }
}
