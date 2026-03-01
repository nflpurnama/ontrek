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
import {
  TransactionType,
  TransactionTypes,
} from "@/src/domain/constants/transaction-type";
import { AmountInput } from "@/src/presentation/components/inputs/amount-input";
import { Vendor } from "@/src/domain/entities/vendor";
import { VendorInput } from "@/src/presentation/components/inputs/vendor-input";
import {
  SpendingType,
  SpendingTypes,
} from "@/src/domain/constants/spending-type";
import { SegmentedControl } from "@/src/presentation/components/inputs/segmented-input";
import { Category } from "@/src/domain/entities/category";
import { HorizontalPillSelector } from "@/src/presentation/components/pill-selector-input";

export default function AddTransactionScreen() {
  const {
    createTransactionUseCase,
    findVendorsUseCase,
    getAllCategoriesUseCase,
  } = useDependencies();

  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [spendingType, setSpendingType] = useState<SpendingType>("ESSENTIAL");

  const [vendorQuery, setVendorQuery] = useState<string>("");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendorSuggestions, setVendorSuggestions] = useState<Vendor[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  // const [loading, setLoading] = useState(false);

  const clearAll = () => {
    setAmount(0);
    setDescription("");
    setType("EXPENSE");
    setVendorQuery("");
    setSpendingType("ESSENTIAL");
    setCategoryId(null);
  };

  const handleSubmit = async () => {
    if (!amount) {
      Alert.alert("Error", "Amount is required");
      return;
    }

    try {
      await createTransactionUseCase.execute({
        vendorName: vendorQuery,
        vendor: selectedVendor,
        categoryId: categoryId,
        transactionDate: new Date(),
        type,
        amount: amount,
        description,
        spendingType: spendingType,
      });

      clearAll();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  useEffect(() => {
    if (!vendorQuery.trim()) {
      setVendorSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      const results = await findVendorsUseCase.execute({ name: vendorQuery });
      setVendorSuggestions(results);
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [findVendorsUseCase, vendorQuery]);

  useEffect(() => {
    const getCategories = async () => {
      const categoryList = await getAllCategoriesUseCase.execute();
      setCategoryList(categoryList);
    };

    getCategories();
  }, []);

  const SegmentedTransactionTypeInput = SegmentedControl<TransactionType>;
  const SegmentedSpendingTypeInput = SegmentedControl<SpendingType>;

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.title}>Add Transaction</Text>
        <AmountInput value={amount} onChange={setAmount} />
        <SegmentedTransactionTypeInput
          value={type}
          onChange={setType}
          options={TransactionTypes}
          style={{ marginBottom: 12 }}
        />
        {type === "EXPENSE" && (
          <SegmentedSpendingTypeInput
            value={spendingType}
            onChange={setSpendingType}
            options={SpendingTypes}
            style={{ marginBottom: 12 }}
          />
        )}
        {(categoryList?.length > 0) && (
          <HorizontalPillSelector
            value={categoryId}
            onChange={setCategoryId}
            options={categoryList.map((c) => ({
              label: c.name,
              value: c.id.getValue(),
            }))}
          />
        )}
        <VendorInput
          query={vendorQuery}
          setQuery={setVendorQuery}
          queryResults={vendorSuggestions}
          setVendor={setSelectedVendor}
        ></VendorInput>
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
    // backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    // elevation: 2,
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
