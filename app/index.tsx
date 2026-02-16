import { Text, View, ActivityIndicator, StyleSheet } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { SqliteAccountRepository } from "@/src/infrastructure/repository/sqlite/account-repository";
import { createDependencies } from "@/src/infrastructure/container/dependency-container";
import { useDependencies } from "@/src/application/providers/dependency-provider";

export default function Index() {
  const { getDashboardUseCase } = useDependencies();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const { currentBalance } = await getDashboardUseCase.execute();
      setBalance(currentBalance);
    };

    load();
  }, []);

  if (balance === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Current Balance</Text>
        <Text style={styles.balance}>
          Rp {balance.toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  label: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 8,
  },
  balance: {
    fontSize: 36,
    fontWeight: "700",
    color: "#111827",
  },
});
