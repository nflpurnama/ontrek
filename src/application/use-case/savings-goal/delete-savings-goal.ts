import { SavingsGoalService } from "@/src/domain/services/savings-goal-service";
import { Id } from "@/src/domain/value-objects/id";

export class DeleteSavingsGoalUseCase {
  constructor(private readonly service: SavingsGoalService) {}

  async execute(params: { id: Id }): Promise<void> {
    return this.service.deleteGoal(params);
  }
}
