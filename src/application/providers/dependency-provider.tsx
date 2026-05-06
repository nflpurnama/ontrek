import React from "react";
import { GetDashboardUseCase } from "../use-case/account/get-dashboard.usecase";
import { CreateTransactionUseCase } from "../use-case/transaction/create-transaction";
import { DeleteTransactionUseCase } from "../use-case/transaction/delete-transaction";
import { UpdateTransactionUseCase } from "../use-case/transaction/update-transaction";
import { ViewTransactionsUseCase } from "../use-case/transaction/view-transaction";
import { CreateVendorUseCase } from "../use-case/vendor/create-vendor";
import { FindVendorsUseCase } from "../use-case/vendor/find-vendors";
import { GetAllCategoriesUseCase } from "../use-case/category/get-all-categories";
import { EnsureDefaultAccountUseCase } from "../use-case/account/ensure-default-account";
import { EnsureDefaultCategoriesUseCase } from "../use-case/category/ensure-default-categories";
import { SetMonthlyBudgetUseCase } from "../use-case/budget/set-monthly-budget";
import { GetCurrentBudgetUseCase } from "../use-case/budget/get-current-budget";
import { CopyBudgetToNextMonthUseCase } from "../use-case/budget/copy-budget-to-next-month";
import { CreateSavingsGoalUseCase } from "../use-case/savings-goal/create-savings-goal";
import { GetAllSavingsGoalsUseCase } from "../use-case/savings-goal/get-all-savings-goals";
import { GetSavingsGoalByIdUseCase } from "../use-case/savings-goal/get-savings-goal-by-id";
import { DepositToSavingsGoalUseCase } from "../use-case/savings-goal/deposit-to-savings-goal";
import { WithdrawFromSavingsGoalUseCase } from "../use-case/savings-goal/withdraw-from-savings-goal";
import { DeleteSavingsGoalUseCase } from "../use-case/savings-goal/delete-savings-goal";
import { CreateCategoryUseCase } from "../use-case/category/create-category";
import { UpdateCategoryUseCase } from "../use-case/category/update-category";
import { DeleteCategoryUseCase } from "../use-case/category/delete-category";
import { ExportUseCase } from "../use-case/data/export-data";
import { ImportUseCase } from "../use-case/data/import-data";
import { DataExportService } from "@/src/infrastructure/services/data-export-service";
import { ProcessRecurringTransactionsUseCase } from "../use-case/recurring-transaction/process-recurring-transactions";
import { SetBudgetGoalAllocationsUseCase } from "../use-case/budget/set-budget-goal-allocations";
import { GetBudgetGoalAllocationsUseCase } from "../use-case/budget/get-budget-goal-allocations";
import { VendorRepository } from "@/src/domain/repository/vendor-repository";
import { CategoryRepository } from "@/src/domain/repository/category-repository";
import { RecurringTransactionRepository } from "@/src/domain/repository/recurring-transaction-repository";
import { BudgetGoalAllocationRepository } from "@/src/domain/repository/budget-goal-allocation-repository";

export interface Dependencies {
  ensureDefaultAccountUseCase: EnsureDefaultAccountUseCase,
  ensureDefaultCategoriesUseCase: EnsureDefaultCategoriesUseCase,
  getDashboardUseCase: GetDashboardUseCase;
  createTransactionUseCase: CreateTransactionUseCase;
  updateTransactionUseCase: UpdateTransactionUseCase;
  deleteTransactionUseCase: DeleteTransactionUseCase;
  viewTransactionsUseCase: ViewTransactionsUseCase;
  createVendorUseCase: CreateVendorUseCase;
  findVendorsUseCase: FindVendorsUseCase;
  getAllCategoriesUseCase: GetAllCategoriesUseCase;
  setMonthlyBudgetUseCase: SetMonthlyBudgetUseCase;
  getCurrentBudgetUseCase: GetCurrentBudgetUseCase;
  copyBudgetToNextMonthUseCase: CopyBudgetToNextMonthUseCase;
  createSavingsGoalUseCase: CreateSavingsGoalUseCase;
  getAllSavingsGoalsUseCase: GetAllSavingsGoalsUseCase;
  getSavingsGoalByIdUseCase: GetSavingsGoalByIdUseCase;
  depositToSavingsGoalUseCase: DepositToSavingsGoalUseCase;
  withdrawFromSavingsGoalUseCase: WithdrawFromSavingsGoalUseCase;
  deleteSavingsGoalUseCase: DeleteSavingsGoalUseCase;
  createCategoryUseCase: CreateCategoryUseCase;
  updateCategoryUseCase: UpdateCategoryUseCase;
  deleteCategoryUseCase: DeleteCategoryUseCase;
  exportUseCase: ExportUseCase;
  importUseCase: ImportUseCase;
  dataExportService: DataExportService;
  processRecurringTransactionsUseCase: ProcessRecurringTransactionsUseCase;
  setBudgetGoalAllocationsUseCase: SetBudgetGoalAllocationsUseCase;
  getBudgetGoalAllocationsUseCase: GetBudgetGoalAllocationsUseCase;
  vendorRepository: VendorRepository;
  categoryRepository: CategoryRepository;
  recurringTransactionRepository: RecurringTransactionRepository;
  budgetGoalAllocationRepository: BudgetGoalAllocationRepository;
}

export const DependencyContext = React.createContext<Dependencies | null>(null);

export const useDependencies = () => {
  const context = React.useContext(DependencyContext);

  if (!context) {
    throw new Error("Dependencies not initialized");
  }

  return context;
};

export const DependencyProvider = ({
  dependencies,
  children,
}: {
  dependencies: Dependencies;
  children: React.ReactNode;
}) => {
  return (
    <DependencyContext.Provider value={dependencies}>
      {children}
    </DependencyContext.Provider>
  );
};
