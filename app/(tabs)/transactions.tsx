import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Transaction } from "@/src/domain/entities/transaction";
import { TransactionType } from "@/src/domain/constants/transaction-type";
import { useDependencies } from "@/src/application/providers/dependency-provider";
import { Ionicons } from "@expo/vector-icons";
import { Id } from "@/src/domain/value-objects/id";

export default function TransactionsPage() {
  const { viewTransactionsUseCase, deleteTransactionUseCase } =
    useDependencies();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Example filter (can be controlled by UI later)
  const filter = {
    // type: TransactionType.DEBIT,
  };

  const load = async () => {
    setLoading(true);
    const result = await viewTransactionsUseCase.execute(filter);
    setTransactions(result);
    setLoading(false);
  };

  const handleDelete = async (id: Id) => {
    await deleteTransactionUseCase.execute({ id: id });
    load();
  };

  useFocusEffect(() => {
    load();
  });

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
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.description}>
                {item.description ?? "No description"}
              </Text>
              <Text
                style={[
                  styles.amount,
                  item.type === TransactionType.DEBIT
                    ? styles.expense
                    : styles.income,
                ]}
              >
                Rp {item.signedAmount.toLocaleString()}
              </Text>
            </View>

            <Text style={styles.date}>
              {item.transactionDate.toLocaleDateString()}
            </Text>

            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Ionicons name="trash"></Ionicons>
            </TouchableOpacity>
          </View>
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
