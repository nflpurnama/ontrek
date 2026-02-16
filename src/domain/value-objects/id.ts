import { randomUUID } from 'expo-crypto'

export class Id {
  private constructor(private readonly value: string) {}

  private static isValidUUID(value: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  public static rehydrate(value: string): Id {
    if (!value || value.trim().length === 0) {
      throw new Error("AccountId cannot be empty");
    } else if (!Id.isValidUUID(value)) {
        throw new Error("AccountId must be UUID");
    }

    return new Id(value);
  }

  public static create(): Id {
    return new Id(randomUUID());
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: Id): boolean {
    return this.value === other.value;
  }
}
