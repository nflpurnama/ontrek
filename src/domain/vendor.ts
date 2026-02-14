import { EntityMetadata } from "./value-objects/entity-metadata";

export class Vendor {
  private constructor(
    private readonly _metadata: EntityMetadata,
    private _name: string,
    private _defaultCategoryId?: string,
  ) {}

  private static formatName(name: string) {
    const trimmed = name.trim();

    if (!trimmed) {
      throw new Error("Vendor name cannot be empty.");
    }

    return trimmed;
  }

  static create(params: { name: string; defaultCategoryId?: string }) {
    return new Vendor(
      EntityMetadata.create(),
      Vendor.formatName(params.name),
      params.defaultCategoryId,
    );
  }

  static rehydrate(params: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    defaultCategoryId?: string;
  }) {
    return new Vendor(
      EntityMetadata.rehydrate({
        id: params.id,
        createdAt: params.createdAt,
        updatedAt: params.updatedAt,
      }),
      Vendor.formatName(params.name),
      params.defaultCategoryId,
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

  get defaultCategoryId() {
    return this._defaultCategoryId;
  }

  get name() {
    return this._name;
  }

  rename(newName: string) {
    this._name = Vendor.formatName(newName);
    this._metadata.touch();
  }

  setDefaultCategory(newDefaultCategoryId: string) {
    this._defaultCategoryId = newDefaultCategoryId;
    this._metadata.touch();
  }

  clearDefaultCategory() {
    this._defaultCategoryId = undefined;
    this._metadata.touch();
  }
}
