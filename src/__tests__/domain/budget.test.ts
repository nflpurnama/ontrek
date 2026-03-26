import { Budget, BudgetAllocation } from "../../domain/entities/budget";

jest.useFakeTimers();

describe("BudgetAllocation.create()", () => {
  it("creates an allocation with valid params", () => {
    const allocation = BudgetAllocation.create({
      categoryId: "cat-uuid-1111-1111-1111-111111111111",
      allocatedAmount: 500,
    });
    expect(allocation.categoryId).toBe("cat-uuid-1111-1111-1111-111111111111");
    expect(allocation.allocatedAmount).toBe(500);
    expect(allocation.id).toBeDefined();
  });

  it("assigns a unique id on each creation", () => {
    const a = BudgetAllocation.create({ categoryId: "cat-1", allocatedAmount: 100 });
    const b = BudgetAllocation.create({ categoryId: "cat-1", allocatedAmount: 100 });
    expect(a.id).not.toBe(b.id);
  });

  it("throws on negative amount", () => {
    expect(() =>
      BudgetAllocation.create({ categoryId: "cat-1", allocatedAmount: -1 })
    ).toThrow("Budget allocation amount cannot be negative.");
  });

  it("throws on NaN", () => {
    expect(() =>
      BudgetAllocation.create({ categoryId: "cat-1", allocatedAmount: NaN })
    ).toThrow("Budget allocation amount cannot be negative.");
  });

  it("throws on Infinity", () => {
    expect(() =>
      BudgetAllocation.create({ categoryId: "cat-1", allocatedAmount: Infinity })
    ).toThrow("Budget allocation amount cannot be negative.");
  });

  it("accepts zero", () => {
    const allocation = BudgetAllocation.create({ categoryId: "cat-1", allocatedAmount: 0 });
    expect(allocation.allocatedAmount).toBe(0);
  });

  it("accepts a large amount", () => {
    const allocation = BudgetAllocation.create({ categoryId: "cat-1", allocatedAmount: 1_000_000 });
    expect(allocation.allocatedAmount).toBe(1_000_000);
  });
});

describe("BudgetAllocation.rehydrate()", () => {
  it("restores all fields from persisted data", () => {
    const now = new Date("2026-01-01");
    const allocation = BudgetAllocation.rehydrate({
      id: "aaaaaaaa-aaaa-1aaa-8aaa-aaaaaaaaaaaa",
      categoryId: "bbbbbbbb-bbbb-1bbb-8bbb-bbbbbbbbbbbb",
      allocatedAmount: 300,
      createdAt: now,
      updatedAt: now,
    });
    expect(allocation.id.getValue()).toBe("aaaaaaaa-aaaa-1aaa-8aaa-aaaaaaaaaaaa");
    expect(allocation.categoryId).toBe("bbbbbbbb-bbbb-1bbb-8bbb-bbbbbbbbbbbb");
    expect(allocation.allocatedAmount).toBe(300);
    expect(allocation.createdAt).toEqual(now);
    expect(allocation.updatedAt).toEqual(now);
  });
});

describe("BudgetAllocation mutations", () => {
  it("updateAmount changes the amount", () => {
    const allocation = BudgetAllocation.create({
      categoryId: "cat-1",
      allocatedAmount: 500,
    });
    allocation.updateAmount(750);
    expect(allocation.allocatedAmount).toBe(750);
  });

  it("updateAmount rejects a negative value", () => {
    const allocation = BudgetAllocation.create({
      categoryId: "cat-1",
      allocatedAmount: 500,
    });
    expect(() => allocation.updateAmount(-50)).toThrow(
      "Budget allocation amount cannot be negative."
    );
  });

  it("updateCategory changes the categoryId", () => {
    const allocation = BudgetAllocation.create({
      categoryId: "cat-1",
      allocatedAmount: 100,
    });
    allocation.updateCategory("cat-2");
    expect(allocation.categoryId).toBe("cat-2");
  });

  it("updateCategory trims whitespace", () => {
    const allocation = BudgetAllocation.create({
      categoryId: "cat-1",
      allocatedAmount: 100,
    });
    allocation.updateCategory("  cat-2  ");
    expect(allocation.categoryId).toBe("cat-2");
  });
});

describe("Budget.create()", () => {
  it("creates a budget with valid params", () => {
    const budget = Budget.create({
      totalAmount: 5000,
      month: 3,
      year: 2026,
    });
    expect(budget.totalAmount).toBe(5000);
    expect(budget.month).toBe(3);
    expect(budget.year).toBe(2026);
    expect(budget.id).toBeDefined();
    expect(budget.allocations).toEqual([]);
  });

  it("assigns a unique id on each creation", () => {
    const a = Budget.create({ totalAmount: 1000, month: 1, year: 2026 });
    const b = Budget.create({ totalAmount: 1000, month: 1, year: 2026 });
    expect(a.id.getValue()).not.toBe(b.id.getValue());
  });

  it("throws on negative totalAmount", () => {
    expect(() =>
      Budget.create({ totalAmount: -1, month: 1, year: 2026 })
    ).toThrow("Budget amount cannot be negative.");
  });

  it("throws on invalid month (0)", () => {
    expect(() =>
      Budget.create({ totalAmount: 1000, month: 0, year: 2026 })
    ).toThrow("Month must be between 1 and 12.");
  });

  it("throws on invalid month (13)", () => {
    expect(() =>
      Budget.create({ totalAmount: 1000, month: 13, year: 2026 })
    ).toThrow("Month must be between 1 and 12.");
  });

  it("throws on invalid year (1999)", () => {
    expect(() =>
      Budget.create({ totalAmount: 1000, month: 1, year: 1999 })
    ).toThrow("Year must be between 2000 and 2100.");
  });

  it("throws on invalid year (2101)", () => {
    expect(() =>
      Budget.create({ totalAmount: 1000, month: 1, year: 2101 })
    ).toThrow("Year must be between 2000 and 2100.");
  });
});

describe("Budget.derived getters", () => {
  it("totalAllocated returns sum of allocation amounts", () => {
    const budget = Budget.create({ totalAmount: 5000, month: 1, year: 2026 });
    const a1 = BudgetAllocation.create({ categoryId: "cat-1", allocatedAmount: 1000 });
    const a2 = BudgetAllocation.create({ categoryId: "cat-2", allocatedAmount: 2000 });
    const a3 = BudgetAllocation.create({ categoryId: "cat-3", allocatedAmount: 500 });
    budget.setAllocations([a1, a2, a3]);
    expect(budget.totalAllocated).toBe(3500);
  });

  it("unallocatedAmount returns total minus allocated", () => {
    const budget = Budget.create({ totalAmount: 5000, month: 1, year: 2026 });
    const a1 = BudgetAllocation.create({ categoryId: "cat-1", allocatedAmount: 3000 });
    budget.setAllocations([a1]);
    expect(budget.unallocatedAmount).toBe(2000);
  });

  it("allocations returns a copy (not the original array)", () => {
    const budget = Budget.create({ totalAmount: 5000, month: 1, year: 2026 });
    const a1 = BudgetAllocation.create({ categoryId: "cat-1", allocatedAmount: 1000 });
    budget.setAllocations([a1]);
    const alloc1 = budget.allocations;
    const alloc2 = budget.allocations;
    expect(alloc1).not.toBe(alloc2);
    expect(alloc1).not.toBe(budget["_allocations"]);
  });
});

describe("Budget.rehydrate()", () => {
  it("restores all fields including allocations", () => {
    const now = new Date("2026-01-01");
    const allocation = BudgetAllocation.rehydrate({
      id: "aaaaaaaa-aaaa-1aaa-8aaa-aaaaaaaaaaaa",
      categoryId: "bbbbbbbb-bbbb-1bbb-8bbb-bbbbbbbbbbbb",
      allocatedAmount: 500,
      createdAt: now,
      updatedAt: now,
    });
    const budget = Budget.rehydrate({
      id: "cccccccc-cccc-1ccc-8ccc-cccccccccccc",
      totalAmount: 3000,
      month: 6,
      year: 2026,
      allocations: [allocation],
      createdAt: now,
      updatedAt: now,
    });
    expect(budget.id.getValue()).toBe("cccccccc-cccc-1ccc-8ccc-cccccccccccc");
    expect(budget.totalAmount).toBe(3000);
    expect(budget.month).toBe(6);
    expect(budget.year).toBe(2026);
    expect(budget.allocations).toHaveLength(1);
    expect(budget.allocations[0].allocatedAmount).toBe(500);
  });
});

describe("Budget mutations", () => {
  it("updateTotalAmount changes the amount", () => {
    const budget = Budget.create({ totalAmount: 5000, month: 1, year: 2026 });
    budget.updateTotalAmount(7500);
    expect(budget.totalAmount).toBe(7500);
  });

  it("updateTotalAmount rejects a negative value", () => {
    const budget = Budget.create({ totalAmount: 5000, month: 1, year: 2026 });
    expect(() => budget.updateTotalAmount(-100)).toThrow(
      "Budget amount cannot be negative."
    );
  });

  it("addAllocation adds to allocations array", () => {
    const budget = Budget.create({ totalAmount: 5000, month: 1, year: 2026 });
    const allocation = BudgetAllocation.create({ categoryId: "cat-1", allocatedAmount: 1000 });
    budget.addAllocation(allocation);
    expect(budget.allocations).toHaveLength(1);
    expect(budget.allocations[0].categoryId).toBe("cat-1");
  });

  it("removeAllocation removes by id", () => {
    const budget = Budget.create({ totalAmount: 5000, month: 1, year: 2026 });
    const a1 = BudgetAllocation.create({ categoryId: "cat-1", allocatedAmount: 1000 });
    const a2 = BudgetAllocation.create({ categoryId: "cat-2", allocatedAmount: 2000 });
    budget.setAllocations([a1, a2]);
    expect(budget.allocations).toHaveLength(2);
    budget.removeAllocation(a1.id);
    expect(budget.allocations).toHaveLength(1);
    expect(budget.allocations[0].categoryId).toBe("cat-2");
  });

  it("updateAllocation updates existing allocation amount", () => {
    const budget = Budget.create({ totalAmount: 5000, month: 1, year: 2026 });
    const allocation = BudgetAllocation.create({ categoryId: "cat-1", allocatedAmount: 1000 });
    budget.addAllocation(allocation);
    budget.updateAllocation(allocation.id, 2500);
    expect(budget.allocations[0].allocatedAmount).toBe(2500);
  });

  it("setAllocations replaces all allocations", () => {
    const budget = Budget.create({ totalAmount: 5000, month: 1, year: 2026 });
    budget.addAllocation(BudgetAllocation.create({ categoryId: "cat-1", allocatedAmount: 500 }));
    expect(budget.allocations).toHaveLength(1);
    const newAllocations = [
      BudgetAllocation.create({ categoryId: "cat-2", allocatedAmount: 1000 }),
      BudgetAllocation.create({ categoryId: "cat-3", allocatedAmount: 2000 }),
    ];
    budget.setAllocations(newAllocations);
    expect(budget.allocations).toHaveLength(2);
    expect(budget.allocations[0].categoryId).toBe("cat-2");
    expect(budget.allocations[1].categoryId).toBe("cat-3");
  });
});
