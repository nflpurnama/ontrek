import { SavingsGoalService } from "@/src/domain/services/savings-goal-service";
import { SavingsGoal } from "@/src/domain/entities/savings-goal";
import { SavingsGoalRepository } from "@/src/domain/repository/savings-goal-repository";

export class SqliteSavingsGoalService implements SavingsGoalService {
  constructor(private readonly savingsGoalRepository: SavingsGoalRepository) {}

  async createGoal(params: {
    name: string;
    targetAmount: number;
    targetDate?: Date;
    month: number;
    year: number;
  }): Promise<SavingsGoal> {
    const goal = SavingsGoal.create(params);
    await this.savingsGoalRepository.create(goal);
    return goal;
  }

  async getAllGoals(): Promise<SavingsGoal[]> {
    return this.savingsGoalRepository.findAll();
  }
}