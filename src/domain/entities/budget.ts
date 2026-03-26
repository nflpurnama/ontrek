import { EntityMetadata } from "../value-objects/entity-metadata";
import { Id } from "../value-objects/id";

export class BudgetAllocation {
  private constructor(
    private readonly _id: Id,
    private _categoryId: string,
    private _allocatedAmount: number,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(params: {
    categoryId: string;
    allocatedAmount: number;
  }) {
    return new BudgetAllocation(
      Id.create(),
      params.categoryId,
      BudgetAllocation.validateAmount(params.allocatedAmount),
      new Date(),
      new Date(),
    );
  }

  static rehydrate(params: {
    id: string;
    categoryId: string;
    allocatedAmount: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return new BudgetAllocation(
      Id.rehydrate(params.id),
      params.categoryId,
      BudgetAllocation.validateAmount(params.allocatedAmount),
      params.createdAt,
      params.updatedAt,
    );
  }

  private static validateAmount(amount: number): number {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error("Budget allocation amount cannot be negative.");
    }
    return amount;
  }

  get id(): Id {
    return this._id;
  }

  get categoryId(): string {
    return this._categoryId;
  }

  get allocatedAmount(): number {
    return this._allocatedAmount;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  updateAmount(newAmount: number) {
    this._allocatedAmount = BudgetAllocation.validateAmount(newAmount);
    this._updatedAt = new Date();
  }

  updateCategory(newCategoryId: string) {
    this._categoryId = newCategoryId.trim();
    this._updatedAt = new Date();
  }
}

export class Budget {
  private constructor(
    private readonly _metadata: EntityMetadata,
    private _totalAmount: number,
    private _month: number,
    private _year: number,
    private _allocations: BudgetAllocation[],
  ) {}

  static create(params: {
    totalAmount: number;
    month: number;
    year: number;
  }) {
    return new Budget(
      EntityMetadata.create(),
      Budget.validateAmount(params.totalAmount),
      Budget.validateMonth(params.month),
      Budget.validateYear(params.year),
      [],
    );
  }

  static rehydrate(params: {
    id: string;
    totalAmount: number;
    month: number;
    year: number;
    allocations: BudgetAllocation[];
    createdAt: Date;
    updatedAt: Date;
  }) {
    return new Budget(
      EntityMetadata.rehydrate({
        id: params.id,
        createdAt: params.createdAt,
        updatedAt: params.updatedAt,
      }),
      Budget.validateAmount(params.totalAmount),
      Budget.validateMonth(params.month),
      Budget.validateYear(params.year),
      params.allocations,
    );
  }

  private static validateAmount(amount: number): number {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error("Budget amount cannot be negative.");
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

  get id() {
    return this._metadata.id;
  }

  get createdAt(): Date {
    return this._metadata.createdAt;
  }

  get updatedAt(): Date {
    return this._metadata.updatedAt;
  }

  get totalAmount(): number {
    return this._totalAmount;
  }

  get month(): number {
    return this._month;
  }

  get year(): number {
    return this._year;
  }

  get allocations(): BudgetAllocation[] {
    return [...this._allocations];
  }

  get totalAllocated(): number {
    return this._allocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
  }

  get unallocatedAmount(): number {
    return this._totalAmount - this.totalAllocated;
  }

  updateTotalAmount(newAmount: number) {
    this._totalAmount = Budget.validateAmount(newAmount);
    this._metadata.touch();
  }

  addAllocation(allocation: BudgetAllocation) {
    this._allocations.push(allocation);
    this._metadata.touch();
  }

  removeAllocation(allocationId: Id) {
    this._allocations = this._allocations.filter(a => !a.id.equals(allocationId));
    this._metadata.touch();
  }

  updateAllocation(allocationId: Id, newAmount: number) {
    const allocation = this._allocations.find(a => a.id.equals(allocationId));
    if (allocation) {
      allocation.updateAmount(newAmount);
      this._metadata.touch();
    }
  }

  setAllocations(allocations: BudgetAllocation[]) {
    this._allocations = allocations;
    this._metadata.touch();
  }
}