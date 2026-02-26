import { AccountRepository } from "@/src/domain/repository/account-repository";
import { Id } from "@/src/domain/value-objects/id";

export class GetDashboardUseCase {
  constructor(private readonly accountRepo: AccountRepository) {}

  async execute(accountId?: string) {
    let account;

    if (accountId) {
      const accounts = await this.accountRepo.get([Id.rehydrate(accountId)]);
      if (!accounts.length) {
        throw new Error("Account not found");
      }
      account = accounts[0];
    } else {
      const accounts = await this.accountRepo.getAll();
      if (!accounts.length) {
        throw new Error("No accounts found");
      }
      account = accounts[0];
    }

    return {
      account,
      currentBalance: account.balance,
    };
  }
}
