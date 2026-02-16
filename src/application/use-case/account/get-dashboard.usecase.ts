import { AccountRepository } from "@/src/domain/repository/account-repository";

export class GetDashboardUseCase {
  constructor(private readonly accountRepo: AccountRepository) {}

  async execute() {
    const accounts = await this.accountRepo.getAll();
    const account = accounts[0]

    return {
      currentBalance: account.balance
    };
  }
}
