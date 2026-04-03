import { FinancialTransactionService, UpdateTransactionParams } from "@/src/domain/services/financial-transaction-service";

export class UpdateTransactionUseCase {
  constructor(private readonly service: FinancialTransactionService) {}

  async execute(params: UpdateTransactionParams) {
    await this.service.updateTransaction(params);
  }
}
