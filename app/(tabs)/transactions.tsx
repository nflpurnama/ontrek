import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Transaction } from "@/src/domain/entities/transaction";
import { Vendor } from "@/src/domain/entities/vendor";
import { Category } from "@/src/domain/entities/category";
import { useDependencies } from "@/src/application/providers/dependency-provider";
import { terminalTheme } from "@/src/presentation/theme/terminal";
import { formatCurrency } from "@/src/presentation/utility/formatter/currency";

const t = terminalTheme;

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).toUpperCase();
};

type TransactionGroup = {
  date: string;
  transactions: Transaction[];
};

const TransactionCard = ({ 
  date, 
  transactions,
  vendorMap,
  categoryMap,
}: { 
  date: string; 
  transactions: Transaction[];
  vendorMap: Map<string, string>;
  categoryMap: Map<string, string>;
}) => {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{t.ascii.tl}{date}{t.ascii.tr}</Text>
      </View>
      <View style={styles.cardContent}>
        {transactions.map((item, index) => (
          <TouchableOpacity
            key={item.id.getValue()}
            style={[
              styles.transactionContainer,
              index < transactions.length - 1 && styles.transactionBorder,
            ]}
            onPress={() =>
              router.navigate(`/transactions/${item.id.getValue()}`)
            }
          >
            <View style={styles.transactionRow}>
              <Text
                style={[
                  styles.amount,
                  item.type === "EXPENSE" ? styles.expense : styles.income,
                ]}
              >
                {item.type === "EXPENSE" ? "-" : "+"}Rp {formatCurrency(item.amount)}
              </Text>
              <Text style={styles.separator}>  </Text>
              <Text style={styles.vendor}>
                {item.vendorId ? vendorMap.get(item.vendorId) ?? "—" : "—"}
              </Text>
              <Text style={styles.separator}>  </Text>
              <Text style={styles.category}>
                {item.categoryId ? categoryMap.get(item.categoryId) ?? "—" : "—"}
              </Text>
            </View>
            {item.description && (
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.cardFooter}>{t.ascii.bl}{t.ascii.h.repeat(20)}{t.ascii.br}</Text>
    </View>
  );
};

export default function TransactionsPage() {
  const { viewTransactionsUseCase, getAllCategoriesUseCase, findVendorsUseCase } = useDependencies();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const filter = {};

  const load = useCallback(async () => {
    setLoading(true);
    const [transactionsResult, categoriesResult, vendorsResult] = await Promise.all([
      viewTransactionsUseCase.execute(filter),
      getAllCategoriesUseCase.execute(),
      findVendorsUseCase.execute({}),
    ]);
    setTransactions(transactionsResult);
    setCategories(categoriesResult);
    setVendors(vendorsResult);
    setLoading(false);
  }, [viewTransactionsUseCase, getAllCategoriesUseCase, findVendorsUseCase]);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  const vendorMap = useMemo(() => {
    const map = new Map<string, string>();
    vendors.forEach((v) => map.set(v.id.getValue(), v.name));
    return map;
  }, [vendors]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id.getValue(), c.name));
    return map;
  }, [categories]);

  const groupedTransactions = useMemo((): TransactionGroup[] => {
    const groups: { [key: string]: Transaction[] } = {};
    
    transactions.forEach((transaction) => {
      const dateKey = formatDate(transaction.transactionDate);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
    });

    return Object.entries(groups)
      .map(([date, items]) => ({ date, transactions: items }))
      .sort((a, b) => {
        const dateA = new Date(a.transactions[0].transactionDate);
        const dateB = new Date(b.transactions[0].transactionDate);
        return dateB.getTime() - dateA.getTime();
      });
  }, [transactions]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={t.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={[styles.dot, { backgroundColor: t.colors.expense }]} />
        <View style={[styles.dot, { backgroundColor: t.colors.income }]} />
        <View style={[styles.dot, { backgroundColor: t.colors.accent }]} />
        <Text style={styles.terminalTitle}>ontrek@transactions</Text>
      </View>

      {groupedTransactions.length > 0 ? (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          {groupedTransactions.map((group) => (
            <TransactionCard
              key={group.date}
              date={group.date}
              transactions={group.transactions}
              vendorMap={vendorMap}
              categoryMap={categoryMap}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>[ no transactions ]</Text>
        </View>
      )}
    </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: t.spacing.lg,
    paddingTop: t.spacing.md,
    paddingBottom: 100,
  },
  card: {
    marginBottom: t.spacing.lg,
  },
  cardHeader: {
    backgroundColor: t.colors.card,
    paddingHorizontal: t.spacing.md,
    paddingTop: t.spacing.sm,
    borderTopLeftRadius: t.border.radius,
    borderTopRightRadius: t.border.radius,
  },
  cardTitle: {
    fontFamily: t.fonts.mono,
    fontSize: 12,
    color: t.colors.secondary,
  },
  cardContent: {
    backgroundColor: t.colors.card,
    paddingVertical: t.spacing.md,
    paddingHorizontal: t.spacing.lg,
  },
  cardFooter: {
    fontFamily: t.fonts.mono,
    fontSize: 10,
    color: t.colors.border,
    textAlign: "center",
  },
  transactionContainer: {
    paddingVertical: t.spacing.sm,
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap" as const,
  },
  transactionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: t.colors.border,
  },
  amount: {
    fontFamily: t.fonts.mono,
    fontSize: 13,
  },
  expense: {
    color: t.colors.expense,
  },
  income: {
    color: t.colors.income,
  },
  separator: {
    fontFamily: t.fonts.mono,
  },
  vendor: {
    fontFamily: t.fonts.mono,
    fontSize: 13,
    color: t.colors.primary,
  },
  category: {
    fontFamily: t.fonts.mono,
    fontSize: 13,
    color: t.colors.accent,
  },
  description: {
    fontFamily: t.fonts.mono,
    fontSize: 13,
    color: t.colors.muted,
    flex: 1,
    width: "100%",
    marginTop: t.spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    color: t.colors.muted,
  },
});