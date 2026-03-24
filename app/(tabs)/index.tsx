import { Text, View, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import React, { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";

import { useDependencies } from "@/src/application/providers/dependency-provider";
import { DashboardData } from "@/src/application/types/dashboard";
import { PieChart } from "@/src/presentation/components/dashboard/pie-chart";

const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}k`;
  }
  return amount.toLocaleString();
};

export default function Index() {
  const { getDashboardUseCase } = useDependencies();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  const load = useCallback(async () => {
    const data = await getDashboardUseCase.execute();
    setDashboard(data);
  }, [getDashboardUseCase]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!dashboard) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const { currentBalance, currentMonth, previousMonth } = dashboard;
  const netChange = currentMonth.net - previousMonth.net;
  const netChangeAbs = Math.abs(netChange);
  const netChangePercent = previousMonth.net !== 0
    ? Math.abs((netChange / Math.abs(previousMonth.net)) * 100).toFixed(0)
    : "0";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Current Balance */}
      <View style={styles.card}>
        <Text style={styles.label}>Current Balance</Text>
        <Text style={styles.balance}>
          Rp {currentBalance.toLocaleString()}
        </Text>
      </View>

      {/* This Month */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>This Month</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryValue, styles.income]}>
              +{formatCurrency(currentMonth.totalIncome)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={[styles.summaryValue, styles.expense]}>
              -{formatCurrency(currentMonth.totalExpenses)}
            </Text>
          </View>
        </View>
        <View style={styles.netRow}>
          <Text style={styles.netLabel}>Net</Text>
          <Text
            style={[
              styles.netValue,
              currentMonth.net >= 0 ? styles.income : styles.expense,
            ]}
          >
            {currentMonth.net >= 0 ? "+" : ""}
            {formatCurrency(currentMonth.net)}
          </Text>
        </View>
      </View>

      {/* Expenses by Category */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Expenses by Category</Text>
        {currentMonth.byCategory.length > 0 ? (
          <View style={styles.chartContainer}>
            <PieChart
              data={currentMonth.byCategory}
              size={200}
            />
          </View>
        ) : (
          <Text style={styles.emptyText}>No expenses this month</Text>
        )}
      </View>

      {/* vs Last Month */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>vs Last Month</Text>
        <View style={styles.comparisonRow}>
          <View style={styles.comparisonItem}>
            <Text style={styles.comparisonLabel}>This Month</Text>
            <Text style={styles.comparisonValue}>
              {formatCurrency(currentMonth.net)}
            </Text>
          </View>
          <View style={styles.comparisonItem}>
            <Text style={styles.comparisonLabel}>Last Month</Text>
            <Text style={styles.comparisonValue}>
              {formatCurrency(previousMonth.net)}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.deltaText,
            netChange >= 0 ? styles.income : styles.expense,
          ]}
        >
          {netChange >= 0 ? "+" : "-"}
          {formatCurrency(netChangeAbs)} ({netChangePercent}%)
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  balance: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  netRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  netLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  netValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  income: {
    color: "#10B981",
  },
  expense: {
    color: "#EF4444",
  },
  chartContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 14,
    paddingVertical: 40,
  },
  comparisonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  comparisonItem: {
    flex: 1,
    alignItems: "center",
  },
  comparisonLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  deltaText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
  },
});
