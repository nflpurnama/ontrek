import React, { useEffect, useState } from "react";
import { StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDependencies } from "@/src/application/providers/dependency-provider";
import { Vendor } from "@/src/domain/entities/vendor";
import { Category } from "@/src/domain/entities/category";
import {TransactionForm, TransactionFormData} from "@/src/presentation/forms/transaction-form";

export default function AddTransactionScreen() {
  const {
    createTransactionUseCase,
    findVendorsUseCase,
    getAllCategoriesUseCase,
  } = useDependencies();

  const [vendorSuggestions, setVendorSuggestions] = useState<Vendor[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);

  const handleSubmit = async ({ amount, category, description, spendingType, transactionType, vendor, vendorName }: TransactionFormData) => {
    if (!amount) {
      Alert.alert("Error", "Amount is required");
      return;
    }

    try {
      await createTransactionUseCase.execute({
        vendorName: vendorName,
        vendor,
        category,
        transactionDate: new Date(),
        type: transactionType,
        amount,
        description,
        spendingType,
      });
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleSearch = async (vendorName: string) => {
    const result = await findVendorsUseCase.execute({name: vendorName});
    setVendorSuggestions(result)
  };

  useEffect(() => {
    const getCategories = async () => {
      const categoryList = await getAllCategoriesUseCase.execute();
      setCategoryList(categoryList);
    };

    getCategories();
  }, [getAllCategoriesUseCase]);

  return (
    <SafeAreaView style={styles.container}>
      <TransactionForm
        categoryOptions={categoryList}
        handleSubmit={handleSubmit}
        handleVendorSearch={handleSearch}
        vendorSuggestions={vendorSuggestions}
        contextType={"CREATE"}
      ></TransactionForm>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f8fafc",
  },
});
