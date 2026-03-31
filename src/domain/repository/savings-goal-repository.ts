import { SavingsGoal } from "../entities/savings-goal";

export interface SavingsGoalRepository {
  create(goal: SavingsGoal): Promise<void>;
  findById(id: string): Promise<SavingsGoal | null>;
  findAll(): Promise<SavingsGoal[]>;
}
