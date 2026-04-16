import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Alert, View, Text } from "react-native";
import { useDependencies } from "@/src/application/providers/dependency-provider";
import { Vendor } from "@/src/domain/entities/vendor";
import { Category } from "@/src/domain/entities/category";
import {TransactionForm, TransactionFormData} from "@/src/presentation/forms/transaction-form";
import { useFocusEffect, useRouter } from "expo-router";
import { terminalTheme } from "@/src/presentation/theme/terminal";
import { TopBar } from "@/src/presentation/components/top-bar";

const t = terminalTheme;

export default function AddTransactionScreen() {
  const {
    createTransactionUseCase,
    findVendorsUseCase,
    getAllCategoriesUseCase,
  } = useDependencies();


  const [key, setKey] = useState<number>(0);

  useFocusEffect(useCallback(()=>{setKey(prev => prev + 1)},[]))

  const [vendorSuggestions, setVendorSuggestions] = useState<Vendor[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const router = useRouter();

  const handleSubmit = async ({ amount, category, description, spendingType, transactionType, vendor, vendorName, transactionDate }: TransactionFormData) => {
    if (!amount) {
      Alert.alert("Error", "Amount is required");
      return;
    }

    try {
      await createTransactionUseCase.execute({
        vendorName: vendorName,
        vendor,
        category,
        transactionDate,
        type: transactionType,
        amount,
        description,
        spendingType,
      });
      router.back();
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
      const sorted = [...categoryList].sort((a, b) => a.name.localeCompare(b.name));
      setCategoryList(sorted);
    };

    getCategories();
  }, [getAllCategoriesUseCase]);

  return (
    <View style={styles.container}>
      <TopBar title="ontrek" subtitle="@add-transaction" />
      <TransactionForm
        key={key}
        categoryOptions={categoryList}
        handleSubmit={handleSubmit}
        handleVendorSearch={handleSearch}
        vendorSuggestions={vendorSuggestions}
        contextType={"CREATE"}
      ></TransactionForm>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
});
