import { EntityMetadata } from "../value-objects/entity-metadata";
import { Id } from "../value-objects/id";

export class SavingsGoal {
  private constructor(
    private readonly _metadata: EntityMetadata,
    private _name: string,
    private _targetAmount: number,
    private _currentBalance: number,
    private _targetDate: Date | null,
    private _month: number,
    private _year: number,
  ) {}

  static create(params: {
    name: string;
    targetAmount: number;
    targetDate?: Date;
    month: number;
    year: number;
  }) {
    return new SavingsGoal(
      EntityMetadata.create(),
      SavingsGoal.validateName(params.name),
      SavingsGoal.validateAmount(params.targetAmount),
      0,
      params.targetDate ?? null,
      SavingsGoal.validateMonth(params.month),
      SavingsGoal.validateYear(params.year),
    );
  }

  static rehydrate(params: {
    id: string;
    name: string;
    targetAmount: number;
    currentBalance: number;
    targetDate: Date | null;
    month: number;
    year: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return new SavingsGoal(
      EntityMetadata.rehydrate({
        id: params.id,
        createdAt: params.createdAt,
        updatedAt: params.updatedAt,
      }),
      SavingsGoal.validateName(params.name),
      SavingsGoal.validateAmount(params.targetAmount),
      SavingsGoal.validateAmount(params.currentBalance),
      params.targetDate,
      SavingsGoal.validateMonth(params.month),
      SavingsGoal.validateYear(params.year),
    );
  }

  private static validateName(name: string): string {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error("Savings goal name cannot be empty.");
    }
    return trimmed;
  }

  private static validateAmount(amount: number): number {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error("Amount cannot be negative.");
    }
    return amount;
  }

  private static validateMonth(month: number): number {
    if (month < 1 || month > 12 || !Number.isInteger(month)) {
      throw new Error("Month must be between 1 and 12.");
    }
    return month;
  }

  private static validateYear(year: number): number {
    if (year < 2000 || year > 2100 || !Number.isInteger(year)) {
      throw new Error("Year must be between 2000 and 2100.");
    }
    return year;
  }

  get id(): Id {
    return this._metadata.id;
  }

  get createdAt(): Date {
    return this._metadata.createdAt;
  }

  get updatedAt(): Date {
    return this._metadata.updatedAt;
  }

  get name(): string {
    return this._name;
  }

  get targetAmount(): number {
    return this._targetAmount;
  }

  get currentBalance(): number {
    return this._currentBalance;
  }

  get targetDate(): Date | null {
    return this._targetDate;
  }

  get month(): number {
    return this._month;
  }

  get year(): number {
    return this._year;
  }

  get isCompleted(): boolean {
    return this._currentBalance >= this._targetAmount;
  }

  get progressPercentage(): number {
    if (this._targetAmount === 0) return 100;
    return Math.min(100, (this._currentBalance / this._targetAmount) * 100);
  }

  deposit(amount: number) {
    const validAmount = SavingsGoal.validateAmount(amount);
    this._currentBalance += validAmount;
    this._metadata.touch();
  }

  withdraw(amount: number) {
    const validAmount = SavingsGoal.validateAmount(amount);
    if (validAmount > this._currentBalance) {
      throw new Error("Cannot withdraw more than current balance.");
    }
    this._currentBalance -= validAmount;
    this._metadata.touch();
  }

  updateTargetAmount(newAmount: number) {
    this._targetAmount = SavingsGoal.validateAmount(newAmount);
    this._metadata.touch();
  }

  rename(newName: string) {
    this._name = SavingsGoal.validateName(newName);
    this._metadata.touch();
  }

  updateTargetDate(newDate: Date | null) {
    this._targetDate = newDate;
    this._metadata.touch();
  }
}
