import { SavingsGoal } from "@/src/domain/entities/savings-goal";
import { SavingsGoalService } from "@/src/domain/services/savings-goal-service";

export class DepositToSavingsGoalUseCase {
  constructor(private readonly service: SavingsGoalService) {}

  async execute(params: {
    goalId: string;
    amount: number;
  }): Promise<{ goal: SavingsGoal; transactionId: string }> {
    return this.service.depositToGoal(params);
  }
}
