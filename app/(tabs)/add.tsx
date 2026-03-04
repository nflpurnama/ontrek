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
import TransactionForm from "@/src/presentation/forms/transaction-form";

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

  return (
    <SafeAreaView style={styles.container}>
      <TransactionForm
        amount={amount}
        categoryId={categoryId}
        categoryOptions={categoryList}
        description={description}
        handleSubmit={handleSubmit}
        setAmount={setAmount}
        setCategoryId={setCategoryId}
        setDescription={setDescription}
        setSelectedVendor={setSelectedVendor}
        setSpendingType={setSpendingType}
        setType={setType}
        setVendorQuery={setVendorQuery}
        spendingType={spendingType}
        type={type}
        vendorQuery={vendorQuery}
        vendorSuggestions={vendorSuggestions}
      ></TransactionForm>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f8fafc",
  }
});
