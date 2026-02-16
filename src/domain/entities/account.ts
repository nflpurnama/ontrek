import { EntityMetadata } from "../value-objects/entity-metadata";

export class Account {
  private constructor(
    private readonly _metadata: EntityMetadata,
    private _name: string,
    private _balance: number,
  ) {}

  private static formatName(name: string) {
    const trimmed = name.trim();

    if (!trimmed) {
      throw new Error("Account name cannot be empty.");
    }

    return trimmed;
  }

  static create(params: { name: string; balance: number }) {
    return new Account(
      EntityMetadata.create(),
      Account.formatName(params.name),
      params.balance,
    );
  }

  static createDefault() {
    return Account.create({ name: "Default Account", balance: 0 });
  }

  static rehydrate(params: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    balance: number;
  }) {
    return new Account(
      EntityMetadata.rehydrate({
        id: params.id,
        createdAt: params.createdAt,
        updatedAt: params.updatedAt,
      }),
      Account.formatName(params.name),
      params.balance,
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

  get balance() {
    return this._balance;
  }

  get name() {
    return this._name;
  }

  rename(newName: string) {
    this._name = Account.formatName(newName);
    this._metadata.touch();
  }

  credit(amount: number) {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error("Credit amount must be positive.");
    }

    this._balance += amount;
    this._metadata.touch();
  }

  debit(amount: number) {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error("Debit amount must be positive.");
    }

    this._balance -= amount;
    this._metadata.touch();
  }
}
