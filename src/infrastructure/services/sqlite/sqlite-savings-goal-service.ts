import { SavingsGoalService } from "@/src/domain/services/savings-goal-service";
import { SavingsGoal } from "@/src/domain/entities/savings-goal";
import { SavingsGoalRepository } from "@/src/domain/repository/savings-goal-repository";
import { FinancialTransactionService } from "@/src/domain/services/financial-transaction-service";

export class SqliteSavingsGoalService implements SavingsGoalService {
  constructor(
    private readonly savingsGoalRepository: SavingsGoalRepository,
    private readonly financialTransactionService: FinancialTransactionService
  ) {}

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

  async depositToGoal(params: {
    goalId: string;
    amount: number;
  }): Promise<{ goal: SavingsGoal; transactionId: string }> {
    const goal = await this.savingsGoalRepository.findById(params.goalId);
    if (!goal) {
      throw new Error("Savings goal not found");
    }

    if (params.amount <= 0) {
      throw new Error("Deposit amount must be greater than zero");
    }

    const transactionId = await this.financialTransactionService.createTransaction({
      amount: params.amount,
      transactionDate: new Date(),
      type: "EXPENSE",
      vendorName: null,
      vendor: null,
      category: null,
      description: `Deposit from ${goal.name}`,
      spendingType: "ESSENTIAL",
    });

    goal.deposit(params.amount);
    await this.savingsGoalRepository.update(goal);
    await this.savingsGoalRepository.linkTransaction(
      params.goalId,
      transactionId,
      "DEPOSIT"
    );

    return { goal, transactionId };
  }

  async withdrawFromGoal(params: {
    goalId: string;
    amount: number;
  }): Promise<{ goal: SavingsGoal; transactionId: string }> {
    const goal = await this.savingsGoalRepository.findById(params.goalId);
    if (!goal) {
      throw new Error("Savings goal not found");
    }

    if (params.amount <= 0) {
      throw new Error("Withdraw amount must be greater than zero");
    }

    if (params.amount > goal.currentBalance) {
      throw new Error("Cannot withdraw more than current balance");
    }

    const transactionId = await this.financialTransactionService.createTransaction({
      amount: params.amount,
      transactionDate: new Date(),
      type: "INCOME",
      vendorName: null,
      vendor: null,
      category: null,
      description: `Withdrawal from ${goal.name}`,
      spendingType: "ESSENTIAL",
    });

    goal.withdraw(params.amount);
    await this.savingsGoalRepository.update(goal);
    await this.savingsGoalRepository.linkTransaction(
      params.goalId,
      transactionId,
      "WITHDRAW"
    );

    return { goal, transactionId };
  }
}