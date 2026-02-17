import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useDependencies } from "@/src/application/providers/dependency-provider";
import { TransactionType } from "@/src/domain/constants/transaction-type";

export default function AddTransactionScreen() {
  const { createTransactionUseCase } = useDependencies();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TransactionType>(TransactionType.DEBIT);

  const handleSubmit = async () => {
    if (!amount) {
      Alert.alert("Error", "Amount is required");
      return;
    }

    try {
      await createTransactionUseCase.execute({
        // vendorId: "default-vendor-id",      // replace later
        // categoryId: "default-category-id",  // replace later
        transactionDate: new Date(),
        type,
        amount: Number(amount),
        description,
      });

      Alert.alert("Success", "Transaction added");
      setAmount("");
      setDescription("");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Add Transaction</Text>

      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            type === TransactionType.DEBIT && styles.activeExpense,
          ]}
          onPress={() => setType(TransactionType.DEBIT)}
        >
          <Text style={styles.typeText}>Expense</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            type === TransactionType.CREDIT && styles.activeIncome,
          ]}
          onPress={() => setType(TransactionType.CREDIT)}
        >
          <Text style={styles.typeText}>Income</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
      />

      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Save Transaction</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    elevation: 2,
  },
  typeRow: {
    flexDirection: "row",
    marginBottom: 20,
    justifyContent: "space-between",
  },
  typeButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 5,
    alignItems: "center",
  },
  activeExpense: {
    backgroundColor: "#fecaca",
  },
  activeIncome: {
    backgroundColor: "#bbf7d0",
  },
  typeText: {
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#111827",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
