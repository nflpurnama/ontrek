import { Dependencies } from "@/src/application/providers/dependency-provider";
import { EnsureDefaultAccountUseCase } from "@/src/application/use-case/account/ensure-default-account";
import { GetDashboardUseCase } from "@/src/application/use-case/account/get-dashboard.usecase";
import { CreateTransactionUseCase } from "@/src/application/use-case/transaction/create-transaction";
import { DeleteTransactionUseCase } from "@/src/application/use-case/transaction/delete-transaction";
import { ViewTransactionsUseCase } from "@/src/application/use-case/transaction/view-transaction";
import { CreateVendorUseCase } from "@/src/application/use-case/vendor/create-vendor";
import { FindVendorsUseCase } from "@/src/application/use-case/vendor/find-vendors";
import * as SQLite from "expo-sqlite";
import { SqliteTransaction } from "../database/sqlite/sqlite-transaction";
import { SqliteAccountRepository } from "../repository/sqlite/account-repository";
import { SqliteTransactionRepository } from "../repository/sqlite/transaction-repository";
import { SqliteVendorRepository } from "../repository/sqlite/vendor-repository";
import { SqliteFinancialTransactionService } from "../services/sqlite/sqlite-financial-transaction-service";

import { GetAllCategoriesUseCase } from "@/src/application/use-case/category/get-all-categories";
import { SqliteCategoryRepository } from "../repository/sqlite/category-repository";
import { EnsureDefaultCategoriesUseCase } from "@/src/application/use-case/category/ensure-default-categories";
import { SqliteBudgetRepository } from "../repository/sqlite/budget-repository";
import { SetMonthlyBudgetUseCase } from "@/src/application/use-case/budget/set-monthly-budget";
import { GetCurrentBudgetUseCase } from "@/src/application/use-case/budget/get-current-budget";
import { CopyBudgetToNextMonthUseCase } from "@/src/application/use-case/budget/copy-budget-to-next-month";

import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";

export async function createDependencies(
  db: SQLite.SQLiteDatabase,
  drizzleDb: ExpoSQLiteDatabase<any>,
): Promise<Dependencies> {
  const accountRepository = new SqliteAccountRepository(drizzleDb);
  const transactionRepository = new SqliteTransactionRepository(drizzleDb);
  const vendorRepository = new SqliteVendorRepository(drizzleDb);
  const categoryRepository = new SqliteCategoryRepository(drizzleDb);

  const ensureDefaultAccountUseCase = new EnsureDefaultAccountUseCase(
    accountRepository,
  );
  const ensureDefaultCategoriesUseCase = new EnsureDefaultCategoriesUseCase(
    categoryRepository,
  );

  await ensureDefaultAccountUseCase.execute();
  await ensureDefaultCategoriesUseCase.execute();

  const getDashboardUseCase = new GetDashboardUseCase(
    accountRepository,
    transactionRepository,
    categoryRepository,
  );

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

  const budgetRepository = new SqliteBudgetRepository(drizzleDb);
  const setMonthlyBudgetUseCase = new SetMonthlyBudgetUseCase(budgetRepository);
  const getCurrentBudgetUseCase = new GetCurrentBudgetUseCase(
    budgetRepository,
    transactionRepository,
    categoryRepository,
  );
  const copyBudgetToNextMonthUseCase = new CopyBudgetToNextMonthUseCase(
    budgetRepository,
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
    setMonthlyBudgetUseCase,
    getCurrentBudgetUseCase,
    copyBudgetToNextMonthUseCase,
  };
}
