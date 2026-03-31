import { SavingsGoal } from "../entities/savings-goal";

export interface SavingsGoalService {
  createGoal(params: {
    name: string;
    targetAmount: number;
    targetDate?: Date;
    month: number;
    year: number;
  }): Promise<SavingsGoal>;

  getAllGoals(): Promise<SavingsGoal[]>;

  depositToGoal(params: {
    goalId: string;
    amount: number;
  }): Promise<{ goal: SavingsGoal; transactionId: string }>;

  withdrawFromGoal(params: {
    goalId: string;
    amount: number;
  }): Promise<{ goal: SavingsGoal; transactionId: string }>;
}
