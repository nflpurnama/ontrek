import { Account } from "../entities/account";
import { Id } from "../value-objects/id";

export interface AccountRepository {
  getAccounts(ids: Id[]): Promise<Account[]>;
  save(account: Account): Promise<Id>;
  update(account: Account): Promise<Id>;
  delete(id: Id): Promise<void>;
}
