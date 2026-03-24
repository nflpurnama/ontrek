import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Alert, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDependencies } from "@/src/application/providers/dependency-provider";
import { Vendor } from "@/src/domain/entities/vendor";
import { Category } from "@/src/domain/entities/category";
import {TransactionForm, TransactionFormData} from "@/src/presentation/forms/transaction-form";
import { useFocusEffect, useRouter } from "expo-router";
import { terminalTheme } from "@/src/presentation/theme/terminal";

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
      setCategoryList(categoryList);
    };

    getCategories();
  }, [getAllCategoriesUseCase]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View style={[styles.dot, { backgroundColor: t.colors.expense }]} />
        <View style={[styles.dot, { backgroundColor: t.colors.income }]} />
        <View style={[styles.dot, { backgroundColor: t.colors.accent }]} />
        <Text style={styles.terminalTitle}>ontrek@add-transaction</Text>
      </View>
      <TransactionForm
        key={key}
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
    backgroundColor: t.colors.background,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: t.spacing.lg,
    paddingTop: 50,
    paddingBottom: t.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.border,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  terminalTitle: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    color: t.colors.secondary,
    marginLeft: t.spacing.md,
  },
});
