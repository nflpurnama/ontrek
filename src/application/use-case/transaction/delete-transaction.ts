import { FinancialTransactionService, DeleteTransactionParams } from "@/src/domain/services/financial-transaction-service";
import { SavingsGoalRepository } from "@/src/domain/repository/savings-goal-repository";

export class DeleteTransactionUseCase {
  constructor(
    private readonly service: FinancialTransactionService,
  ) {}

  async execute(params: DeleteTransactionParams) {
    await this.service.deleteTransaction(params);
  }
}
