import React, { createContext, useState } from "react";

interface AccountContextType {
  selectedAccountId: string | null;
  setSelectedAccountId: (accountId: string) => void;
}

export const AccountContext = createContext<AccountContextType | null>(null);

export const useSelectedAccount = () => {
  const context = React.useContext(AccountContext);

  if (!context) {
    throw new Error("useSelectedAccount must be used within AccountProvider");
  }

  return context;
};

export const AccountProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );

  return (
    <AccountContext.Provider
      value={{ selectedAccountId, setSelectedAccountId }}
    >
      {children}
    </AccountContext.Provider>
  );
};
