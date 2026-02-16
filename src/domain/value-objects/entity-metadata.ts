import { Id } from "./id";

export class EntityMetadata {
  private constructor(
    protected readonly _id: Id,
    protected readonly _createdAt: Date,
    protected _updatedAt: Date,
  ) {}

  static create(): EntityMetadata {
    return new EntityMetadata(
      Id.create(),
      EntityMetadata.generateNow(),
      EntityMetadata.generateNow(),
    );
  }

  static rehydrate(params: { id: string; createdAt: Date; updatedAt: Date }) {
    return new EntityMetadata(
      Id.rehydrate(params.id),
      params.createdAt,
      params.updatedAt,
    );
  }

  get id() {
    return this._id;
  }

  get createdAt() {
    return this._createdAt;
  }

  get updatedAt() {
    return this._updatedAt;
  }

  static generateNow() {
    return new Date();
  }

  touch() {
    this._updatedAt = EntityMetadata.generateNow();
  }
}
