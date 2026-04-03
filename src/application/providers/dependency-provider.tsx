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
import { VendorRepository } from "@/src/domain/repository/vendor-repository";
import { CategoryRepository } from "@/src/domain/repository/category-repository";

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
  vendorRepository: VendorRepository;
  categoryRepository: CategoryRepository;
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
