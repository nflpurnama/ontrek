import { Dependencies } from "@/src/application/providers/dependency-provider";
import { EnsureDefaultAccountUseCase } from "@/src/application/use-case/account/ensure-default-account";
import { GetDashboardUseCase } from "@/src/application/use-case/account/get-dashboard.usecase";
import { CreateTransactionUseCase } from "@/src/application/use-case/transaction/create-transaction";
import { DeleteTransactionUseCase } from "@/src/application/use-case/transaction/delete-transaction";
import { ViewTransactionsUseCase } from "@/src/application/use-case/transaction/view-transaction";
import { CreateVendorUseCase } from "@/src/application/use-case/vendor/create-vendor";
import { FindVendorsUseCase } from "@/src/application/use-case/vendor/find-vendors";
import { SQLITE_DB_NAME } from "@/src/config/database";
import * as SQLite from "expo-sqlite";
import { initializeDatabase } from "../database/sqlite/init";
import { SqliteTransaction } from "../database/sqlite/sqlite-transaction";
import { SqliteAccountRepository } from "../repository/sqlite/account-repository";
import { SqliteTransactionRepository } from "../repository/sqlite/transaction-repository";
import { SqliteVendorRepository } from "../repository/sqlite/vendor-repository";
import { SqliteFinancialTransactionService } from "../services/sqlite/sqlite-financial-transaction-service";

import { GetAllCategoriesUseCase } from "@/src/application/use-case/category/get-all-categories";
import { SqliteCategoryRepository } from "../repository/sqlite/category-repository";
import { EnsureDefaultCategoriesUseCase } from "@/src/application/use-case/category/ensure-default-categories";

import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";

export async function createDependencies(db: SQLite.SQLiteDatabase, drizzleDb: ExpoSQLiteDatabase<any>): Promise<Dependencies> {
  //TODO: create migration

  await initializeDatabase(db);
  const accountRepository = new SqliteAccountRepository(db);
  const transactionRepository = new SqliteTransactionRepository(db);
  const vendorRepository = new SqliteVendorRepository(db);
  const categoryRepository = new SqliteCategoryRepository(drizzleDb);

  const ensureDefaultAccountUseCase = new EnsureDefaultAccountUseCase(
    accountRepository,
  );
  const ensureDefaultCategoriesUseCase = new EnsureDefaultCategoriesUseCase(
    categoryRepository,
  );

  await ensureDefaultAccountUseCase.execute();
  await ensureDefaultCategoriesUseCase.execute();

  const getDashboardUseCase = new GetDashboardUseCase(accountRepository);

  const sqliteTransaction = new SqliteTransaction(db);
  const financialTransactionService = new SqliteFinancialTransactionService(
    sqliteTransaction,
    accountRepository,
    transactionRepository,
    vendorRepository,
  );
  const createTransactionUseCase = new CreateTransactionUseCase(
    financialTransactionService,
  );
  const deleteTransactionUseCase = new DeleteTransactionUseCase(
    financialTransactionService,
  );

  const viewTransactionsUseCase = new ViewTransactionsUseCase(
    transactionRepository,
  );

  const createVendorUseCase = new CreateVendorUseCase(vendorRepository);
  const findVendorsUseCase = new FindVendorsUseCase(vendorRepository);

  const getAllCategoriesUseCase = new GetAllCategoriesUseCase(
    categoryRepository,
  );

  return {
    ensureDefaultAccountUseCase,
    ensureDefaultCategoriesUseCase,
    getDashboardUseCase,
    createTransactionUseCase,
    deleteTransactionUseCase,
    viewTransactionsUseCase,
    createVendorUseCase,
    findVendorsUseCase,
    getAllCategoriesUseCase,
  };
}
