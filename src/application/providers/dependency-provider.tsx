import React from "react";
import { GetDashboardUseCase } from "../use-case/account/get-dashboard.usecase";
import { CreateTransactionUseCase } from "../use-case/transaction/create-transaction";
import { ViewTransactionsUseCase } from "../use-case/transaction/view-transaction";
import { DeleteTransactionUseCase } from "../use-case/transaction/delete-transaction";

export interface Dependencies {
    getDashboardUseCase: GetDashboardUseCase;
    createTransactionUseCase: CreateTransactionUseCase;
    deleteTransactionUseCase: DeleteTransactionUseCase;
    viewTransactionsUseCase: ViewTransactionsUseCase; 
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
