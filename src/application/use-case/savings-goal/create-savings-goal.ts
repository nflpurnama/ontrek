import { SavingsGoal } from "@/src/domain/entities/savings-goal";
import { SavingsGoalService } from "@/src/domain/services/savings-goal-service";

export class CreateSavingsGoalUseCase {
  constructor(private readonly service: SavingsGoalService) {}

  async execute(params: {
    name: string;
    targetAmount: number;
    targetDate?: Date;
    month: number;
    year: number;
  }): Promise<SavingsGoal> {
    return this.service.createGoal(params);
  }
}
