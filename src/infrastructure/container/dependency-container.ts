import * as SQLite from "expo-sqlite";
import { SQLITE_DB_NAME } from "@/src/config/database";
import { Dependencies } from "@/src/application/providers/dependency-provider";
import { GetDashboardUseCase } from "@/src/application/use-case/account/get-dashboard.usecase";
import { EnsureDefaultAccountUseCase } from "@/src/application/use-case/account/ensure-default-account";
import { initializeDatabase } from "../database/sqlite/init";
import { SqliteAccountRepository } from "../repository/sqlite/account-repository";

export async function createDependencies(): Promise<Dependencies> {
  const db = await SQLite.openDatabaseAsync(SQLITE_DB_NAME);
  await initializeDatabase(db);

  const accountRepository = new SqliteAccountRepository(db);
  const getDashboardUseCase = new GetDashboardUseCase(accountRepository);
  const ensureDefaultAccountUseCase = new EnsureDefaultAccountUseCase(accountRepository);
  await ensureDefaultAccountUseCase.execute();

  return {
    getDashboardUseCase
  };
}
