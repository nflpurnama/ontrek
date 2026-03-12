import { Account } from "../../domain/entities/account";

describe("Account.create()", () => {
  it("creates an account with the given name and balance", () => {
    const a = Account.create({ name: "Savings", balance: 1000 });
    expect(a.name).toBe("Savings");
    expect(a.balance).toBe(1000);
    expect(a.id).toBeDefined();
  });

  it("trims whitespace from the name", () => {
    const a = Account.create({ name: "  Cash  ", balance: 0 });
    expect(a.name).toBe("Cash");
  });

  it("throws when name is empty", () => {
    expect(() => Account.create({ name: "", balance: 0 }))
      .toThrow("Account name cannot be empty.");
  });

  it("throws when name is only whitespace", () => {
    expect(() => Account.create({ name: "   ", balance: 0 }))
      .toThrow("Account name cannot be empty.");
  });
});

describe("Account.createDefault()", () => {
  it("creates an account named 'Default Account' with zero balance", () => {
    const a = Account.createDefault();
    expect(a.name).toBe("Default Account");
    expect(a.balance).toBe(0);
  });
});

describe("Account.credit()", () => {
  it("increases the balance", () => {
    const a = Account.create({ name: "Main", balance: 100 });
    a.credit(50);
    expect(a.balance).toBe(150);
  });

  it("can credit from zero", () => {
    const a = Account.create({ name: "Main", balance: 0 });
    a.credit(200);
    expect(a.balance).toBe(200);
  });

  it("throws on negative credit amount", () => {
    const a = Account.create({ name: "Main", balance: 100 });
    expect(() => a.credit(-10)).toThrow("Credit amount must be positive.");
  });

  it("throws on NaN", () => {
    const a = Account.create({ name: "Main", balance: 100 });
    expect(() => a.credit(NaN)).toThrow("Credit amount must be positive.");
  });

  it("throws on Infinity", () => {
    const a = Account.create({ name: "Main", balance: 100 });
    expect(() => a.credit(Infinity)).toThrow("Credit amount must be positive.");
  });

  it("accumulates multiple credits correctly", () => {
    const a = Account.create({ name: "Main", balance: 0 });
    a.credit(100);
    a.credit(50);
    a.credit(25);
    expect(a.balance).toBe(175);
  });
});

describe("Account.debit()", () => {
  it("decreases the balance", () => {
    const a = Account.create({ name: "Main", balance: 200 });
    a.debit(80);
    expect(a.balance).toBe(120);
  });

  it("allows balance to go negative (no floor enforced)", () => {
    // The domain entity itself does not enforce a floor — that's a business
    // rule applied at the service level. This test documents the current behaviour.
    const a = Account.create({ name: "Main", balance: 50 });
    a.debit(100);
    expect(a.balance).toBe(-50);
  });

  it("throws on negative debit amount", () => {
    const a = Account.create({ name: "Main", balance: 100 });
    expect(() => a.debit(-10)).toThrow("Debit amount must be positive.");
  });

  it("throws on NaN", () => {
    const a = Account.create({ name: "Main", balance: 100 });
    expect(() => a.debit(NaN)).toThrow("Debit amount must be positive.");
  });

  it("throws on Infinity", () => {
    const a = Account.create({ name: "Main", balance: 100 });
    expect(() => a.debit(Infinity)).toThrow("Debit amount must be positive.");
  });

  it("accumulates multiple debits correctly", () => {
    const a = Account.create({ name: "Main", balance: 500 });
    a.debit(100);
    a.debit(50);
    expect(a.balance).toBe(350);
  });
});

describe("Account credit/debit symmetry", () => {
  it("credit then debit of same amount returns to original balance", () => {
    const a = Account.create({ name: "Main", balance: 100 });
    a.credit(75);
    a.debit(75);
    expect(a.balance).toBe(100);
  });

  it("debit then credit of same amount returns to original balance", () => {
    const a = Account.create({ name: "Main", balance: 100 });
    a.debit(40);
    a.credit(40);
    expect(a.balance).toBe(100);
  });
});

describe("Account.rename()", () => {
  it("updates the name", () => {
    const a = Account.create({ name: "Old", balance: 0 });
    a.rename("New");
    expect(a.name).toBe("New");
  });

  it("throws when renaming to empty string", () => {
    const a = Account.create({ name: "Old", balance: 0 });
    expect(() => a.rename("")).toThrow("Account name cannot be empty.");
  });
});