import { FinancialTransactionService, DeleteTransactionParams } from "@/src/domain/services/financial-transaction-service";
import { SavingsGoalRepository } from "@/src/domain/repository/savings-goal-repository";

export class DeleteTransactionUseCase {
  constructor(
    private readonly service: FinancialTransactionService,
    private readonly savingsGoalRepository: SavingsGoalRepository
  ) {}

  async execute(params: DeleteTransactionParams) {
    const link = await this.savingsGoalRepository.findLinkByTransactionId(params.id.getValue());
    
    await this.service.deleteTransaction(params);

    if (link) {
      const goal = await this.savingsGoalRepository.findById(link.goalId);
      if (goal) {
        if (link.type === "DEPOSIT") {
          goal.withdraw(0);
        } else {
          goal.deposit(0);
        }
        await this.savingsGoalRepository.update(goal);
      }
      await this.savingsGoalRepository.deleteLink(params.id.getValue());
    }
  }
}
