import * as SQLite from "expo-sqlite";
import { SQLITE_DB_NAME } from "@/src/config/database";
import { initializeDatabase } from "../database/sqlite/init";
import { SqliteAccountRepository } from "../repository/sqlite/account-repository";
import { SqliteTransactionRepository } from "../repository/sqlite/transaction-repository";
import { SqliteVendorRepository } from "../repository/sqlite/vendor-repository";
import { SqliteFinancialTransactionService } from "../services/sqlite/sqlite-financial-transaction-service";
import { SqliteTransaction } from "../database/sqlite/sqlite-transaction";
import { Dependencies } from "@/src/application/providers/dependency-provider";
import { GetDashboardUseCase } from "@/src/application/use-case/account/get-dashboard.usecase";
import { EnsureDefaultAccountUseCase } from "@/src/application/use-case/account/ensure-default-account";
import { CreateTransactionUseCase } from "@/src/application/use-case/transaction/create-transaction";
import { ViewTransactionsUseCase } from "@/src/application/use-case/transaction/view-transaction";
import { DeleteTransactionUseCase } from "@/src/application/use-case/transaction/delete-transaction";
import { CreateVendorUseCase } from "@/src/application/use-case/vendor/create-vendor";
import { FindVendorsUseCase } from "@/src/application/use-case/vendor/find-vendors";

import { drizzle } from "drizzle-orm/expo-sqlite"
import { SqliteCategoryRepository } from "../repository/sqlite/category-repository";

export async function createDependencies(): Promise<Dependencies> {
  //TODO: create migration
  await SQLite.deleteDatabaseAsync(SQLITE_DB_NAME);
  const db = await SQLite.openDatabaseAsync(SQLITE_DB_NAME);
  await initializeDatabase(db);
  const drizzleDb = drizzle(db)

  const accountRepository = new SqliteAccountRepository(db);
  const transactionRepository = new SqliteTransactionRepository(db);
  const vendorRepository = new SqliteVendorRepository(db);
  const categoryRepository = new SqliteCategoryRepository(drizzleDb);

  const ensureDefaultAccountUseCase = new EnsureDefaultAccountUseCase(accountRepository);
  await ensureDefaultAccountUseCase.execute();

  const getDashboardUseCase = new GetDashboardUseCase(accountRepository);

  const sqliteTransaction = new SqliteTransaction(db);
  const financialTransactionService = new SqliteFinancialTransactionService(sqliteTransaction, accountRepository, transactionRepository, vendorRepository);
  const createTransactionUseCase = new CreateTransactionUseCase(financialTransactionService);
  const deleteTransactionUseCase = new DeleteTransactionUseCase(financialTransactionService);

  const viewTransactionsUseCase = new ViewTransactionsUseCase(transactionRepository);

  const createVendorUseCase = new CreateVendorUseCase(vendorRepository);
  const findVendorsUseCase = new FindVendorsUseCase(vendorRepository);

  return {
    getDashboardUseCase,
    createTransactionUseCase,
    deleteTransactionUseCase,
    viewTransactionsUseCase,
    createVendorUseCase,
    findVendorsUseCase
  };
}
