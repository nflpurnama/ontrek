import { Account } from "@/src/domain/entities/account";
import { AccountRepository } from "@/src/domain/repository/account-repository";

export class GetAllAccountsUseCase {
  constructor(private readonly accountRepo: AccountRepository) {}

  async execute(): Promise<Account[]> {
    return await this.accountRepo.getAll();
  }
}
