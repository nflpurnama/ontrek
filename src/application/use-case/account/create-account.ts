import { Account } from "@/src/domain/entities/account";
import { AccountRepository } from "@/src/domain/repository/account-repository";

export class CreateAccountUseCase {
  constructor(private readonly accountRepo: AccountRepository) {}

  async execute(params: { name: string; balance?: number }): Promise<void> {
    const account = Account.create({
      name: params.name,
      balance: params.balance || 0,
    });

    await this.accountRepo.save(account);
  }
}
