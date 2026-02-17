import { TransactionType } from "../transaction-type";
import { EntityMetadata } from "../value-objects/entity-metadata";

export class Transaction {
  private constructor(
    private readonly _metadata: EntityMetadata,
    private _vendorId: string,
    private _categoryId: string,
    private _transactionDate: Date,
    private _type: TransactionType,
    private _amount: number,
    private _description?: string,
  ) {}

  private static validateAmount(amount: number) {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error("Transaction amount cannot be negative.");
    }

    return amount;
  }

  private static validateVendorId(id: string) {
    return this.validateId(id, "Transaction vendor cannot be empty.");
  }

  private static validateCategoryId(id: string) {
    return this.validateId(id, "Transaction category cannot be empty.");
  }

  private static validateId(id: string, errorMessage: string) {
    const trimmed = this.formatId(id);
    if (!trimmed) {
      throw new Error(errorMessage);
    }

    return trimmed;
  }

  private static formatId(id: string) {
    return id.trim();
  }

  static create(params: {
    vendorId: string;
    categoryId: string;
    transactionDate: Date;
    type: TransactionType;
    amount: number;
    description?: string;
  }) {
    return new Transaction(
      EntityMetadata.create(),
      this.validateVendorId(params.vendorId),
      this.validateCategoryId(params.categoryId),
      params.transactionDate,
      params.type,
      Transaction.validateAmount(params.amount),
      params.description,
    );
  }

  static rehydrate(params: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    vendorId: string;
    categoryId: string;
    transactionDate: Date;
    type: TransactionType;
    amount: number;
    description?: string;
  }) {
    return new Transaction(
      EntityMetadata.rehydrate({
        id: params.id,
        createdAt: params.createdAt,
        updatedAt: params.updatedAt,
      }),
      this.validateVendorId(params.vendorId),
      this.validateCategoryId(params.categoryId),
      params.transactionDate,
      params.type,
      params.amount,
      params.description,
    );
  }

  get id() {
    return this._metadata.id;
  }
  get createdAt() {
    return this._metadata.createdAt;
  }
  get updatedAt() {
    return this._metadata.updatedAt;
  }
  get vendorId() {
    return this._vendorId;
  }

  updateVendor(newVendorId: string) {
    this._vendorId = Transaction.validateVendorId(newVendorId);
    this._metadata.touch();
  }

  get categoryId() {
    return this._categoryId;
  }

  updateCategory(newCategoryId: string) {
    this._categoryId = Transaction.validateCategoryId(newCategoryId);
    this._metadata.touch();
  }

  get transactionDate() {
    return this._transactionDate;
  }

  updateTransactionDate(newTransactionDate: Date) {
    this._transactionDate = newTransactionDate;
    this._metadata.touch();
  }

  get type() {
    return this._type;
  }

  updateType(newType: TransactionType) {
    this._type = newType;
    this._metadata.touch();
  }

  get amount() {
    return this._amount;
  }

  get signedAmount(): number {
    return this._type === TransactionType.DEBIT ? -this._amount : this._amount;
  }

  updateAmount(newAmount: number) {
    this._amount = Transaction.validateAmount(newAmount);
    this._metadata.touch();
  }

  get description() {
    return this._description;
  }

  updateDescription(newDescription: string) {
    this._description = newDescription.trim();
    this._metadata.touch();
  }

  clearDescription() {
    this._description = undefined;
    this._metadata.touch();
  }
}
