import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDependencies } from "@/src/application/providers/dependency-provider";
import { Transaction } from "@/src/domain/entities/transaction";
import { Id } from "@/src/domain/value-objects/id";

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { viewTransactionsUseCase, deleteTransactionUseCase } = useDependencies();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const results = await viewTransactionsUseCase.execute({});
        const found = results.find((t) => t.id.getValue() === id) ?? null;
        setTransaction(found);
      } catch (err: any) {
        Alert.alert("Error", err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure? This will reverse the balance change.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteTransactionUseCase.execute({
                id: Id.rehydrate(id),
              });
              router.back();
            } catch (err: any) {
              Alert.alert("Error", err.message);
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.center}>
          <Text style={styles.errorText}>Transaction not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isExpense = transaction.type === "EXPENSE";

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Transaction Detail</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Amount</Text>
          <Text style={[styles.amount, isExpense ? styles.expense : styles.income]}>
            Rp {transaction.signedAmount.toLocaleString()}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Type</Text>
          <Text style={styles.value}>{transaction.type}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>
            {transaction.transactionDate.toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Vendor</Text>
          <Text style={styles.value}>
            {transaction.vendorId ?? "—"}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Category</Text>
          <Text style={styles.value}>
            {transaction.categoryId ?? "—"}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Note</Text>
          <Text style={styles.value}>
            {transaction.description ?? "—"}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]}
        onPress={handleDelete}
        disabled={deleting}
      >
        <Text style={styles.deleteText}>
          {deleting ? "Deleting..." : "Delete Transaction"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    color: "#555",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    color: "#1C2833",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
  },
  label: {
    fontSize: 15,
    color: "#777",
  },
  value: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1C2833",
    flexShrink: 1,
    textAlign: "right",
    marginLeft: 16,
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
  },
  expense: {
    color: "#EF4444",
  },
  income: {
    color: "#10B981",
  },
  errorText: {
    fontSize: 16,
    color: "#777",
  },
  deleteButton: {
    backgroundColor: "#C0392B",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
  },
  deleteButtonDisabled: {
    backgroundColor: "#E0A09A",
  },
  deleteText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});