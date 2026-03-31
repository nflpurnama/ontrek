import { SavingsGoal } from "../entities/savings-goal";

export interface SavingsGoalRepository {
  create(goal: SavingsGoal): Promise<void>;
  findById(id: string): Promise<SavingsGoal | null>;
  findAll(): Promise<SavingsGoal[]>;
  update(goal: SavingsGoal): Promise<void>;
  linkTransaction(goalId: string, transactionId: string, type: "DEPOSIT" | "WITHDRAW"): Promise<void>;
}
