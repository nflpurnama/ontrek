import { EntityMetadata } from "./entity-metadata";

export class Category {
  private constructor(
    private _name: string,
    private readonly _metadata: EntityMetadata,
  ) {}

  static create(params: { name: string }) {
    return new Category(
      Category.formatName(params.name),
      EntityMetadata.create(),
    );
  }

  static rehydrate(params: {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return new Category(
      this.formatName(params.name),
      EntityMetadata.rehydrate({
        id: params.id,
        createdAt: params.createdAt,
        updatedAt: params.updatedAt,
      }),
    );
  }

  private static formatName(name: string) {
    const trimmed = name.trim();

    if (!trimmed) {
      throw new Error("Category name cannot be empty.");
    }

    return trimmed;
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

  get name() {
    return this._name;
  }

  rename(newValue: string) {
    this._name = Category.formatName(newValue);
    this._metadata.touch();
  }
}
