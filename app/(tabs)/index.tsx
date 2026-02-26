import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useSelectedAccount } from "@/src/application/providers/account-provider";
import { useDependencies } from "@/src/application/providers/dependency-provider";
import { Account } from "@/src/domain/entities/account";

export default function Index() {
  const { getDashboardUseCase, getAllAccountsUseCase } = useDependencies();
  const { selectedAccountId, setSelectedAccountId } = useSelectedAccount();
  const [balance, setBalance] = useState<number | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      // Load all accounts
      const allAccounts = await getAllAccountsUseCase.execute();
      setAccounts(allAccounts);

      // Load dashboard for selected account or first account
      const accountId =
        selectedAccountId ||
        (allAccounts.length > 0 ? allAccounts[0].id.getValue() : null);
      if (accountId) {
        const { currentBalance } = await getDashboardUseCase.execute(accountId);
        setBalance(currentBalance);
        if (!selectedAccountId && allAccounts.length > 0) {
          setSelectedAccountId(allAccounts[0].id.getValue());
        }
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [
    getDashboardUseCase,
    getAllAccountsUseCase,
    selectedAccountId,
    setSelectedAccountId,
  ]);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard]),
  );

  const handleSelectAccount = async (accountId: string) => {
    setSelectedAccountId(accountId);
    setLoading(true);
    try {
      const { currentBalance } = await getDashboardUseCase.execute(accountId);
      setBalance(currentBalance);
    } finally {
      setLoading(false);
    }
  };

  if (loading && balance === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const currentAccount = accounts.find(
    (acc) => acc.id.getValue() === selectedAccountId,
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={styles.mainCard}>
        <Text style={styles.label}>Current Balance</Text>
        {currentAccount && (
          <Text style={styles.accountName}>{currentAccount.name}</Text>
        )}
        <Text style={styles.balance}>Rp {(balance ?? 0).toLocaleString()}</Text>
      </View>

      {accounts.length > 1 && (
        <View style={styles.accountsSection}>
          <Text style={styles.sectionTitle}>Your Accounts</Text>
          <FlatList
            data={accounts}
            keyExtractor={(item) => item.id.getValue()}
            scrollEnabled={false}
            renderItem={({ item }) => {
              const isSelected = selectedAccountId === item.id.getValue();
              return (
                <TouchableOpacity
                  style={[
                    styles.accountItem,
                    isSelected && styles.accountItemActive,
                  ]}
                  onPress={() => handleSelectAccount(item.id.getValue())}
                >
                  <View style={styles.accountItemContent}>
                    <Text
                      style={[
                        styles.accountItemName,
                        isSelected && styles.accountItemNameActive,
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.accountItemBalance,
                        isSelected && styles.accountItemBalanceActive,
                      ]}
                    >
                      Rp {item.balance.toLocaleString()}
                    </Text>
                  </View>
                  {isSelected && <View style={styles.activeIndicator} />}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 24,
  },
  mainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginTop: 24,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 8,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563EB",
    marginBottom: 8,
  },
  balance: {
    fontSize: 36,
    fontWeight: "700",
    color: "#1F2937",
  },
  accountsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  accountItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  accountItemActive: {
    borderColor: "#2563EB",
    backgroundColor: "#F0F9FF",
  },
  accountItemContent: {
    flex: 1,
  },
  accountItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  accountItemNameActive: {
    color: "#2563EB",
  },
  accountItemBalance: {
    fontSize: 12,
    color: "#6B7280",
  },
  accountItemBalanceActive: {
    color: "#2563EB",
  },
  activeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2563EB",
  },
});
//     borderRadius: 20,
//     paddingVertical: 32,
//     paddingHorizontal: 24,
//     shadowColor: "#000",
//     shadowOpacity: 0.08,
//     shadowRadius: 20,
//     shadowOffset: { width: 0, height: 10 },
//     elevation: 8,
//   },
//   label: {
//     fontSize: 16,
//     color: "#6B7280",
//     marginBottom: 8,
//   },
//   balance: {
//     fontSize: 36,
//     fontWeight: "700",
//     color: "#111827",
//   },
// });
