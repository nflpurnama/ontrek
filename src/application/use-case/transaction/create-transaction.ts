import { FinancialTransactionService, CreateTransactionParams } from "@/src/domain/services/financial-transaction-service";

export class CreateTransactionUseCase {
  constructor(private readonly service: FinancialTransactionService) {}

  async execute(params: CreateTransactionParams) {
    await this.service.createTransaction(params);
  }
}
