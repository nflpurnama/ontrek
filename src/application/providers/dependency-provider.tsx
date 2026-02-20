import React from "react";
import { GetDashboardUseCase } from "../use-case/account/get-dashboard.usecase";
import { CreateTransactionUseCase } from "../use-case/transaction/create-transaction";
import { ViewTransactionsUseCase } from "../use-case/transaction/view-transaction";
import { DeleteTransactionUseCase } from "../use-case/transaction/delete-transaction";
import { CreateVendorUseCase } from "../use-case/vendor/create-vendor";
import { FindVendorsUseCase } from "../use-case/vendor/find-vendors";

export interface Dependencies {
    getDashboardUseCase: GetDashboardUseCase;
    createTransactionUseCase: CreateTransactionUseCase;
    deleteTransactionUseCase: DeleteTransactionUseCase;
    viewTransactionsUseCase: ViewTransactionsUseCase;
    createVendorUseCase: CreateVendorUseCase;
    findVendorsUseCase: FindVendorsUseCase;
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
