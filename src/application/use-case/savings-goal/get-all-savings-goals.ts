import { SavingsGoal } from "@/src/domain/entities/savings-goal";
import { SavingsGoalService } from "@/src/domain/services/savings-goal-service";

export class GetAllSavingsGoalsUseCase {
  constructor(private readonly service: SavingsGoalService) {}

  async execute(): Promise<SavingsGoal[]> {
    return this.service.getAllGoals();
  }
}
