import { Account } from "../entities/account";
import { Id } from "../value-objects/id";

export interface AccountRepository {
  getAccounts(ids: Id[]): Promise<Account[]>;
  getAllAccounts(): Promise<Account[]>;
  saveAccount(account: Account): Promise<Id>;
  updateAccount(account: Account): Promise<Id>;
  deleteAccount(id: Id): Promise<void>;
}
