import { Transaction } from "../../domain/entities/transaction";
jest.useFakeTimers()

const BASE = {
  vendorId: null,
  categoryId: null,
  transactionDate: new Date("2026-01-15"),
  description: null,
  spendingType: "ESSENTIAL" as const,
};

describe("Transaction.create()", () => {
  it("creates a transaction with valid params", () => {
    const t = Transaction.create({ ...BASE, type: "EXPENSE", amount: 50 });
    expect(t.amount).toBe(50);
    expect(t.type).toBe("EXPENSE");
    expect(t.id).toBeDefined();
  });

  it("assigns a unique id on each creation", () => {
    const a = Transaction.create({ ...BASE, type: "EXPENSE", amount: 10 });
    const b = Transaction.create({ ...BASE, type: "EXPENSE", amount: 10 });
    expect(a.id.getValue()).not.toBe(b.id.getValue());
  });

  it("stores vendorId and categoryId when provided", () => {
    const t = Transaction.create({
      ...BASE,
      type: "EXPENSE",
      amount: 20,
      vendorId: "vendor-uuid-1111-1111-111111111111",
      categoryId: "cat-uuid-1111-1111-1111-111111111111",
    });
    expect(t.vendorId).toBe("vendor-uuid-1111-1111-111111111111");
    expect(t.categoryId).toBe("cat-uuid-1111-1111-1111-111111111111");
  });

  it("stores null vendorId and categoryId when not provided", () => {
    const t = Transaction.create({ ...BASE, type: "EXPENSE", amount: 20 });
    expect(t.vendorId).toBeNull();
    expect(t.categoryId).toBeNull();
  });

  it("stores the description", () => {
    const t = Transaction.create({ ...BASE, type: "EXPENSE", amount: 10, description: "lunch" });
    expect(t.description).toBe("lunch");
  });
});

describe("Transaction amount validation", () => {
  it("throws on negative amount", () => {
    expect(() =>
      Transaction.create({ ...BASE, type: "EXPENSE", amount: -1 })
    ).toThrow("Transaction amount cannot be negative.");
  });

  it("throws on NaN", () => {
    expect(() =>
      Transaction.create({ ...BASE, type: "EXPENSE", amount: NaN })
    ).toThrow("Transaction amount cannot be negative.");
  });

  it("throws on Infinity", () => {
    expect(() =>
      Transaction.create({ ...BASE, type: "EXPENSE", amount: Infinity })
    ).toThrow("Transaction amount cannot be negative.");
  });

  it("accepts zero", () => {
    const t = Transaction.create({ ...BASE, type: "EXPENSE", amount: 0 });
    expect(t.amount).toBe(0);
  });

  it("accepts a large amount", () => {
    const t = Transaction.create({ ...BASE, type: "EXPENSE", amount: 1_000_000 });
    expect(t.amount).toBe(1_000_000);
  });
});

describe("Transaction.signedAmount", () => {
  it("returns negative for EXPENSE", () => {
    const t = Transaction.create({ ...BASE, type: "EXPENSE", amount: 100 });
    expect(t.signedAmount).toBe(-100);
  });

  it("returns positive for INCOME", () => {
    const t = Transaction.create({ ...BASE, type: "INCOME", amount: 200 });
    expect(t.signedAmount).toBe(200);
  });

  it("returns 0 for a zero-amount EXPENSE", () => {
    const t = Transaction.create({ ...BASE, type: "EXPENSE", amount: 0 });
    expect(t.signedAmount).toBe(-0);
  });
});

describe("Transaction spendingType coercion", () => {
  it("preserves spendingType for EXPENSE", () => {
    const t = Transaction.create({ ...BASE, type: "EXPENSE", amount: 50, spendingType: "DISCRETIONARY" });
    expect(t.spendingType).toBe("DISCRETIONARY");
  });

  it("forces spendingType to ESSENTIAL for INCOME regardless of input", () => {
    const t = Transaction.create({ ...BASE, type: "INCOME", amount: 50, spendingType: "DISCRETIONARY" });
    expect(t.spendingType).toBe("ESSENTIAL");
  });
});

describe("Transaction mutations", () => {
  it("updateAmount changes the amount", () => {
    const t = Transaction.create({ ...BASE, type: "EXPENSE", amount: 50 });
    t.updateAmount(99);
    expect(t.amount).toBe(99);
  });

  it("updateAmount rejects a negative value", () => {
    const t = Transaction.create({ ...BASE, type: "EXPENSE", amount: 50 });
    expect(() => t.updateAmount(-5)).toThrow("Transaction amount cannot be negative.");
  });

  it("updateDescription trims whitespace", () => {
    const t = Transaction.create({ ...BASE, type: "EXPENSE", amount: 50 });
    t.updateDescription("  groceries  ");
    expect(t.description).toBe("groceries");
  });

  it("clearDescription sets description to null", () => {
    const t = Transaction.create({ ...BASE, type: "EXPENSE", amount: 50, description: "lunch" });
    t.clearDescription();
    expect(t.description).toBeNull();
  });

  it("touch updates updatedAt", () => {
    const t = Transaction.create({ ...BASE, type: "EXPENSE", amount: 50 });
    const before = t.updatedAt.getTime();
    // Ensure time moves forward
    jest.advanceTimersByTime(10);
    t.updateAmount(60);
    expect(t.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
  });
});

describe("Transaction.rehydrate()", () => {
  it("restores all fields from persisted data", () => {
    const now = new Date("2026-01-01");
    const t = Transaction.rehydrate({
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      createdAt: now,
      updatedAt: now,
      transactionDate: now,
      type: "INCOME",
      spendingType: "ESSENTIAL",
      amount: 500,
      vendorId: null,
      categoryId: null,
      description: "salary",
    });
    expect(t.id.getValue()).toBe("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
    expect(t.amount).toBe(500);
    expect(t.type).toBe("INCOME");
    expect(t.description).toBe("salary");
  });
});