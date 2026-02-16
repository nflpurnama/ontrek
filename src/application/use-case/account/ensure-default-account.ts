import { Account } from "@/src/domain/entities/account";
import { AccountRepository } from "@/src/domain/repository/account-repository";

export class EnsureDefaultAccountUseCase {
  constructor(private readonly accountRepo: AccountRepository) {}

  async execute() {
    const accounts = await this.accountRepo.getAll();
    
    if (accounts.length < 1){
        const defaultAccount = Account.createDefault();
        this.accountRepo.save(defaultAccount);
    }

  }
}
