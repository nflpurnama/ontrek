import React from "react";
import { GetDashboardUseCase } from "../use-case/account/get-dashboard.usecase";

export interface Dependencies {
    getDashboardUseCase: GetDashboardUseCase;
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
