import { SavingsGoal } from "@/src/domain/entities/savings-goal";
import { Id } from "@/src/domain/value-objects/id";
import { SavingsGoalRepository } from "@/src/domain/repository/savings-goal-repository";

export interface GetSavingsGoalByIdParams {
  id: Id;
}

export class GetSavingsGoalByIdUseCase {
  constructor(private readonly repository: SavingsGoalRepository) {}

  async execute(params: GetSavingsGoalByIdParams): Promise<SavingsGoal | null> {
    return this.repository.findById(params.id.getValue());
  }
}