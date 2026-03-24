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
import { useDependencies } from "@/src/application/providers/dependency-provider";
import { terminalTheme } from "@/src/presentation/theme/terminal";

const t = terminalTheme;

const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}k`;
  }
  return amount.toLocaleString();
};

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
  transactions 
}: { 
  date: string; 
  transactions: Transaction[] 
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
              styles.transactionRow,
              index < transactions.length - 1 && styles.transactionBorder,
            ]}
            onPress={() =>
              router.navigate(`/transactions/${item.id.getValue()}`)
            }
          >
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
              {item.vendorId ?? "—"}
            </Text>
            <Text style={styles.separator}>  </Text>
            <Text style={styles.category}>
              {item.categoryId ?? "—"}
            </Text>
            {item.description && (
              <>
                <Text style={styles.separator}>  </Text>
                <Text style={styles.description} numberOfLines={1}>
                  {item.description}
                </Text>
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.cardFooter}>{t.ascii.bl}{t.ascii.h.repeat(20)}{t.ascii.br}</Text>
    </View>
  );
};

export default function TransactionsPage() {
  const { viewTransactionsUseCase } = useDependencies();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const filter = {};

  const load = useCallback(async () => {
    setLoading(true);
    const result = await viewTransactionsUseCase.execute(filter);
    setTransactions(result);
    setLoading(false);
  }, [viewTransactionsUseCase]);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

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
    width: 12,
    height: 12,
    borderRadius: 6,
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
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: t.spacing.sm,
    flexWrap: "wrap" as const,
  },
  transactionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: t.colors.border,
  },
  amount: {
    fontFamily: t.fonts.mono,
    fontSize: 13,
    fontWeight: "600",
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