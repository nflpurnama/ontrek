import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Transaction } from "@/src/domain/entities/transaction";
import { Vendor } from "@/src/domain/entities/vendor";
import { Category } from "@/src/domain/entities/category";
import { TransactionFilter } from "@/src/domain/repository/transaction-repository";
import { MonthlyHeatmap } from "@/src/application/types/heatmap";
import { useDependencies } from "@/src/application/providers/dependency-provider";
import { useTheme } from "@/src/presentation/theme/theme-provider";
import { formatCurrency } from "@/src/presentation/utility/formatter/currency";
import { TopBar } from "@/src/presentation/components/top-bar";
import { HeatmapCalendar } from "@/src/presentation/components/calendar/heatmap-calendar";

type FilterMode = "day" | "month" | "all";

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).toUpperCase();
};

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const startOfMonth = (d: Date): Date => {
  const r = new Date(d.getFullYear(), d.getMonth(), 1);
  r.setHours(0, 0, 0, 0);
  return r;
};

const endOfMonth = (d: Date): Date => {
  const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return new Date(d.getFullYear(), d.getMonth(), daysInMonth, 23, 59, 59, 999);
};

const startOfDay = (d: Date): Date => {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
};

const endOfDay = (d: Date): Date => {
  const r = new Date(d);
  r.setHours(23, 59, 59, 999);
  return r;
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
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.card, { marginBottom: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.border.radius }]}>
      <View style={[styles.cardHeader, { backgroundColor: theme.colors.card, paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.sm, borderTopLeftRadius: theme.border.radius, borderTopRightRadius: theme.border.radius }]}>
        <Text style={[styles.cardTitle, { fontFamily: theme.fonts.mono, fontSize: 12, color: theme.colors.secondary }]}>{theme.ascii?.tl ?? ""}{date}{theme.ascii?.tr ?? ""}</Text>
      </View>
      <View style={[styles.cardContent, { backgroundColor: theme.colors.card, paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.lg }]}>
        {transactions.map((item, index) => (
          <TouchableOpacity
            key={item.id.getValue()}
            style={[
              styles.transactionContainer,
              { paddingVertical: theme.spacing.sm },
              index < transactions.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
            ]}
            onPress={() =>
              router.navigate(`/transactions/${item.id.getValue()}` as any)
            }
          >
            <View style={styles.transactionRow}>
              <Text
                style={[
                  styles.amount,
                  { fontFamily: theme.fonts.mono, fontSize: 13, color: item.type === "EXPENSE" ? theme.colors.expense : theme.colors.income },
                ]}
              >
                {item.type === "EXPENSE" ? "-" : "+"}Rp {formatCurrency(item.amount)}
              </Text>
              <Text style={[styles.separator, { fontFamily: theme.fonts.mono }]}>  </Text>
              <Text style={[styles.vendor, { fontFamily: theme.fonts.mono, fontSize: 13, color: theme.colors.primary }]}>
                {item.vendorId ? vendorMap.get(item.vendorId) ?? "—" : "—"}
              </Text>
              <Text style={[styles.separator, { fontFamily: theme.fonts.mono }]}>  </Text>
              <Text style={[styles.category, { fontFamily: theme.fonts.mono, fontSize: 13, color: theme.colors.accent }]}>
                {item.categoryId ? categoryMap.get(item.categoryId) ?? "—" : "—"}
              </Text>
            </View>
            {item.description && (
              <Text style={[styles.description, { fontFamily: theme.fonts.mono, fontSize: 13, color: theme.colors.muted, flex: 1, width: "100%", marginTop: theme.spacing.xs }]} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
      {theme.ascii && (
        <Text style={[styles.cardFooter, { fontFamily: theme.fonts.mono, fontSize: 10, color: theme.colors.border, textAlign: "center" }]}>{theme.ascii.bl}{theme.ascii.h.repeat(20)}{theme.ascii.br}</Text>
      )}
    </View>
  );
};

export default function TransactionsPage() {
  const { theme } = useTheme();
  const { viewTransactionsUseCase, getMonthlyHeatmapUseCase, getAllCategoriesUseCase, findVendorsUseCase } = useDependencies();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heatmap, setHeatmap] = useState<MonthlyHeatmap | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>("month");

  const load = useCallback(async () => {
    setLoading(true);
    let filter: TransactionFilter = {};
    if (filterMode === "day" && selectedDay) {
      filter = { startDate: startOfDay(selectedDay), endDate: endOfDay(selectedDay) };
    } else if (filterMode === "month") {
      filter = { startDate: startOfMonth(selectedMonth), endDate: endOfMonth(selectedMonth) };
    }
    const [transactionsResult, categoriesResult, vendorsResult, heatmapResult] = await Promise.all([
      viewTransactionsUseCase.execute(filter),
      getAllCategoriesUseCase.execute(),
      findVendorsUseCase.execute({}),
      getMonthlyHeatmapUseCase.execute({ year: selectedMonth.getFullYear(), month: selectedMonth.getMonth() }),
    ]);
    setTransactions(transactionsResult);
    setCategories(categoriesResult);
    setVendors(vendorsResult);
    setHeatmap(heatmapResult);
    setLoading(false);
  }, [viewTransactionsUseCase, getMonthlyHeatmapUseCase, getAllCategoriesUseCase, findVendorsUseCase, filterMode, selectedDay, selectedMonth]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

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

  const handlePrevMonth = useCallback(() => {
    setSelectedMonth((prev) => {
      const d = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      d.setHours(0, 0, 0, 0);
      return d;
    });
    setSelectedDay(null);
    setFilterMode("month");
  }, []);

  const handleNextMonth = useCallback(() => {
    setSelectedMonth((prev) => {
      const d = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      d.setHours(0, 0, 0, 0);
      return d;
    });
    setSelectedDay(null);
    setFilterMode("month");
  }, []);

  const handleDayPress = useCallback((date: Date) => {
    if (selectedDay && isSameDay(selectedDay, date)) {
      setSelectedDay(null);
      setFilterMode("month");
    } else {
      setSelectedDay(date);
      setFilterMode("day");
    }
  }, [selectedDay]);

  const handleClearSelection = useCallback(() => {
    setSelectedDay(null);
    setFilterMode("month");
  }, []);

  const handleShowAllTime = useCallback(() => {
    setSelectedDay(null);
    setFilterMode("all");
  }, []);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TopBar title="ontrek" subtitle="@transactions" />

      <HeatmapCalendar
        heatmap={heatmap}
        selectedDay={selectedDay}
        filterMode={filterMode}
        onDayPress={handleDayPress}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onClearSelection={handleClearSelection}
        onShowAllTime={handleShowAllTime}
      />

      {groupedTransactions.length > 0 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { padding: theme.spacing.lg, paddingTop: 0, paddingBottom: 100 }]}
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
          <Text style={[styles.emptyText, { fontFamily: theme.fonts.mono, fontSize: 14, color: theme.colors.muted }]}>[ no transactions ]</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {},
  card: {},
  cardHeader: {},
  cardTitle: {},
  cardContent: {},
  cardFooter: {},
  transactionContainer: {},
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  transactionBorder: {},
  amount: {},
  expense: {},
  income: {},
  separator: {},
  vendor: {},
  category: {},
  description: {},
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {},
});