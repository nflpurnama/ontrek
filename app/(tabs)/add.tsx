import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDependencies } from "@/src/application/providers/dependency-provider";
import { TransactionType } from "@/src/domain/constants/transaction-type";
import { AmountInput } from "@/src/presentation/components/inputs/amount-input";
import { TransactionTypeInput } from "@/src/presentation/components/inputs/transaction-type-input";
import { Vendor } from "@/src/domain/entities/vendor";

export default function AddTransactionScreen() {
  const { createTransactionUseCase, findVendorsUseCase } = useDependencies();

  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
  const [type, setType] = useState<TransactionType>(TransactionType.DEBIT);

  const [vendorName, setVendorName] = useState<string>("");
  const [vendorSuggestions, setVendorSuggestions] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount) {
      Alert.alert("Error", "Amount is required");
      return;
    }

    try {
      await createTransactionUseCase.execute({
        vendorName: vendorName, // replace later
        categoryId: null, // replace later
        transactionDate: new Date(),
        type,
        amount: amount,
        description,
      });

      setAmount(0);
      setDescription("");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  useEffect(() => {
    if (!vendorName.trim()) {
      setVendorSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      const results = await findVendorsUseCase.execute({ name: vendorName });
      setVendorSuggestions(results);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [findVendorsUseCase, vendorName]);

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.title}>Add Transaction</Text>

        <AmountInput value={amount} onChange={setAmount} />

        <TransactionTypeInput type={type} setType={setType} />

        <TextInput
          placeholder="Vendor"
          value={vendorName}
          onChangeText={setVendorName}
          style={styles.input}
        />

        {(loading || vendorSuggestions.length > 0) && (
          <View style={styles.dropdown}>
            {loading ? (
              <Text style={styles.loadingText}>Searching...</Text>
            ) : (
              vendorSuggestions.map((vendor: Vendor) => (
                <TouchableOpacity
                  key={vendor.id.getValue()}
                  onPress={() => {
                    setVendorName(vendor.name);
                    setVendorSuggestions([]);
                  }}
                  style={styles.item}
                >
                  <Text>{vendor.name}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        <TextInput
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Save Transaction</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  loadingText: {
  paddingVertical: 14,
  paddingHorizontal: 16,
  fontSize: 14,
  color: "#888",
},
  input: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    elevation: 2,
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
  dropdown: {
    position: "absolute",
    top: 52, // input height + spacing
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    elevation: 4, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 1000,
  },

  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});
