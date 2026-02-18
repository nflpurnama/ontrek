import { TransactionFilter, TransactionRepository } from "@/src/domain/repository/transaction-repository";

export class ViewTransactionsUseCase {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(filter: TransactionFilter) {
    return await this.transactionRepository.findTransactions(filter);
  }
}
