import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Transaction } from "@/src/domain/entities/transaction";
import { useDependencies } from "@/src/application/providers/dependency-provider";

export default function TransactionsPage() {
  const { viewTransactionsUseCase } = useDependencies();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const filter = {};

  const load = useCallback(async () => {
    setLoading(true);
    const result = await viewTransactionsUseCase.execute(filter);
    setTransactions(result);
    setLoading(false);
  }, [viewTransactionsUseCase]);

  const router = useRouter();

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transactions</Text>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.getValue()}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.navigate(`/transactions/${item.id.getValue()}`)
            }
          >
            <View style={styles.row}>
              <Text style={styles.description}>
                {item.description ?? "No description"}
              </Text>
              <Text
                style={[
                  styles.amount,
                  item.type === "EXPENSE" ? styles.expense : styles.income,
                ]}
              >
                Rp {item.signedAmount.toLocaleString()}
              </Text>
            </View>


              <Text style={styles.description}>
                {item.vendorId ?? "No Vendor"}
              </Text>
              <Text style={styles.description}>
                {item.categoryId || "No Category"}
              </Text>

            <Text style={styles.date}>
              {item.transactionDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    backgroundColor: "#F8FAFC",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  description: {
    fontSize: 16,
    fontWeight: "500",
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
  },
  expense: {
    color: "#EF4444",
  },
  income: {
    color: "#10B981",
  },
  date: {
    marginTop: 6,
    fontSize: 12,
    color: "#64748B",
  },
});
