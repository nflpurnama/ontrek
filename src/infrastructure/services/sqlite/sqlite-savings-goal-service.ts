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
    try {
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
        description: `Deposit to ${goal.name}`,
        spendingType: "ESSENTIAL",
      });

      goal.deposit(params.amount);
      await this.savingsGoalRepository.update(goal);
      
      try {
        await this.savingsGoalRepository.linkTransaction(
          params.goalId,
          transactionId,
          "DEPOSIT"
        );
      } catch (e: any) {
        console.log("Link transaction error:", e?.message || e);
      }

      return { goal, transactionId };
    } catch (e: any) {
      console.log("Deposit error:", e?.message || e);
      throw e;
    }
  }

  async withdrawFromGoal(params: {
    goalId: string;
    amount: number;
  }): Promise<{ goal: SavingsGoal; transactionId: string }> {
    try {
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
        description: `Withdraw from ${goal.name}`,
        spendingType: "ESSENTIAL",
      });

      goal.withdraw(params.amount);
      await this.savingsGoalRepository.update(goal);
      
      try {
        await this.savingsGoalRepository.linkTransaction(
          params.goalId,
          transactionId,
          "WITHDRAW"
        );
      } catch (e: any) {
        console.log("Link transaction error:", e?.message || e);
      }

      return { goal, transactionId };
    } catch (e: any) {
      console.log("Withdraw error:", e?.message || e);
      throw e;
    }
  }
}