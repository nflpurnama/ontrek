import React from "react";
import { GetDashboardUseCase } from "../use-case/account/get-dashboard.usecase";
import { CreateTransactionUseCase } from "../use-case/transaction/create-transaction";
import { DeleteTransactionUseCase } from "../use-case/transaction/delete-transaction";
import { ViewTransactionsUseCase } from "../use-case/transaction/view-transaction";
import { CreateVendorUseCase } from "../use-case/vendor/create-vendor";
import { FindVendorsUseCase } from "../use-case/vendor/find-vendors";
import { GetAllCategoriesUseCase } from "../use-case/category/get-all-categories";
import { EnsureDefaultAccountUseCase } from "../use-case/account/ensure-default-account";
import { EnsureDefaultCategoriesUseCase } from "../use-case/category/ensure-default-categories";

//TODO: explore if dependency is importing too many things
export interface Dependencies {
  ensureDefaultAccountUseCase: EnsureDefaultAccountUseCase,
  ensureDefaultCategoriesUseCase: EnsureDefaultCategoriesUseCase,
  getDashboardUseCase: GetDashboardUseCase;
  createTransactionUseCase: CreateTransactionUseCase;
  deleteTransactionUseCase: DeleteTransactionUseCase;
  viewTransactionsUseCase: ViewTransactionsUseCase;
  createVendorUseCase: CreateVendorUseCase;
  findVendorsUseCase: FindVendorsUseCase;
  getAllCategoriesUseCase: GetAllCategoriesUseCase;
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
