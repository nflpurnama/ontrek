import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Alert, View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDependencies } from "@/src/application/providers/dependency-provider";
import { Vendor } from "@/src/domain/entities/vendor";
import { Category } from "@/src/domain/entities/category";
import { TransactionForm, TransactionFormData } from "@/src/presentation/forms/transaction-form";
import { useFocusEffect, useRouter, useLocalSearchParams } from "expo-router";
import { terminalTheme } from "@/src/presentation/theme/terminal";
import { Transaction } from "@/src/domain/entities/transaction";
import { Id } from "@/src/domain/value-objects/id";

const t = terminalTheme;

export default function EditTransactionScreen() {
  const {
    updateTransactionUseCase,
    viewTransactionsUseCase,
    findVendorsUseCase,
    getAllCategoriesUseCase,
    vendorRepository,
    categoryRepository,
  } = useDependencies();

  const { id } = useLocalSearchParams<{ id: string }>();

  const [key, setKey] = useState<number>(0);
  const [vendorSuggestions, setVendorSuggestions] = useState<Vendor[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<TransactionFormData | null>(null);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      setKey(prev => prev + 1);
    }, [])
  );

  useEffect(() => {
    async function loadData() {
      try {
        const transactions = await viewTransactionsUseCase.execute({});
        const transaction = transactions.find(t => t.id.getValue() === id);

        if (!transaction) {
          Alert.alert("Error", "Transaction not found");
          router.back();
          return;
        }

        let vendorName = "";
        if (transaction.vendorId) {
          const vendors = await vendorRepository.getVendors([Id.rehydrate(transaction.vendorId)]);
          if (vendors.length > 0) {
            vendorName = vendors[0].name;
          }
        }

        let category: Category | null = null;
        if (transaction.categoryId) {
          const categories = await categoryRepository.getCategory([Id.rehydrate(transaction.categoryId)]);
          if (categories.length > 0) {
            category = categories[0];
          }
        }

        setInitialData({
          amount: transaction.amount,
          transactionType: transaction.type,
          spendingType: transaction.spendingType,
          category,
          vendor: null,
          vendorName,
          description: transaction.description ?? "",
          transactionDate: transaction.transactionDate,
        });
      } catch (err: any) {
        Alert.alert("Error", err.message);
        router.back();
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  const handleSubmit = async (formData: TransactionFormData) => {
    if (!formData.amount) {
      Alert.alert("Error", "Amount is required");
      return;
    }

    try {
      await updateTransactionUseCase.execute({
        id: Id.rehydrate(id),
        transactionDate: formData.transactionDate,
        vendorName: formData.vendorName,
        vendor: formData.vendor,
        category: formData.category,
        type: formData.transactionType,
        amount: formData.amount,
        description: formData.description,
        spendingType: formData.spendingType,
      });
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleSearch = async (vendorName: string) => {
    const result = await findVendorsUseCase.execute({ name: vendorName });
    setVendorSuggestions(result);
  };

  useEffect(() => {
    const getCategories = async () => {
      const categoryList = await getAllCategoriesUseCase.execute();
      const sorted = [...categoryList].sort((a, b) => a.name.localeCompare(b.name));
      setCategoryList(sorted);
    };

    getCategories();
  }, [getAllCategoriesUseCase]);

  if (loading || !initialData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={t.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View style={[styles.dot, { backgroundColor: t.colors.expense }]} />
        <View style={[styles.dot, { backgroundColor: t.colors.income }]} />
        <View style={[styles.dot, { backgroundColor: t.colors.accent }]} />
        <Text style={styles.terminalTitle}>ontrek@edit-transaction</Text>
      </View>
      <TransactionForm
        key={key}
        categoryOptions={categoryList}
        handleSubmit={handleSubmit}
        handleVendorSearch={handleSearch}
        vendorSuggestions={vendorSuggestions}
        contextType={"EDIT"}
        initialData={initialData}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
