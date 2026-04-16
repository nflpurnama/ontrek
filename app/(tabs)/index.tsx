import { Text, View, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import React, { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";

import { useDependencies } from "@/src/application/providers/dependency-provider";
import { DashboardData } from "@/src/application/types/dashboard";
import { PieChart } from "@/src/presentation/components/dashboard/pie-chart";
import { terminalTheme } from "@/src/presentation/theme/terminal";
import { formatCurrency, formatCurrencyShort } from "@/src/presentation/utility/formatter/currency";

const t = terminalTheme;

const TerminalCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{t.ascii.tl}{title}{t.ascii.tr}</Text>
    </View>
    <View style={styles.cardContent}>
      {children}
    </View>
    <Text style={styles.cardFooter}>{t.ascii.bl}{t.ascii.h.repeat(20)}{t.ascii.br}</Text>
  </View>
);

const TerminalRow = ({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, valueColor ? { color: valueColor } : null]}>{value}</Text>
  </View>
);

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
        <ActivityIndicator size="large" color={t.colors.primary} />
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
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={[styles.dot, { backgroundColor: t.colors.expense }]} />
        <View style={[styles.dot, { backgroundColor: t.colors.income }]} />
        <View style={[styles.dot, { backgroundColor: t.colors.accent }]} />
        <Text style={styles.terminalTitle}>ontrek@dashboard</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <TerminalCard title="BALANCE">
          <Text style={styles.balanceValue}>
            Rp {formatCurrency(currentBalance)}
          </Text>
        </TerminalCard>

        <TerminalCard title="THIS MONTH">
          <TerminalRow
            label="INCOME"
            value={`+${formatCurrencyShort(currentMonth.totalIncome)}`}
            valueColor={t.colors.income}
          />
          <TerminalRow
            label="EXPENSE"
            value={`-${formatCurrencyShort(currentMonth.totalExpenses)}`}
            valueColor={t.colors.expense}
          />
          <View style={styles.divider} />
          <TerminalRow
            label="NET"
            value={`${currentMonth.net >= 0 ? "+" : ""}${formatCurrencyShort(currentMonth.net)}`}
            valueColor={currentMonth.net >= 0 ? t.colors.income : t.colors.expense}
          />
        </TerminalCard>

        <TerminalCard title="CATEGORIES">
          {currentMonth.byCategory.length > 0 ? (
            <View style={styles.chartContainer}>
              <PieChart
                data={currentMonth.byCategory}
                size={180}
              />
            </View>
          ) : (
            <Text style={styles.emptyText}>[ no data ]</Text>
          )}
        </TerminalCard>

        <TerminalCard title="VS LAST MONTH">
          <View style={styles.comparisonContainer}>
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>LAST</Text>
              <Text style={styles.comparisonValue}>
                {formatCurrency(previousMonth.net)}
              </Text>
            </View>
            <Text style={styles.arrow}>→</Text>
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>THIS</Text>
              <Text style={styles.comparisonValue}>
                {formatCurrency(currentMonth.net)}
              </Text>
            </View>
          </View>
          <View style={styles.deltaContainer}>
            <Text style={styles.deltaLabel}>DELTA:</Text>
            <Text style={[
              styles.deltaValue,
              { color: netChange >= 0 ? t.colors.income : t.colors.expense }
            ]}>
              {netChange >= 0 ? "+" : "-"}{formatCurrencyShort(netChangeAbs)} ({netChangePercent}%)
            </Text>
          </View>
        </TerminalCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: t.spacing.lg,
    paddingTop: t.spacing.sm,
    paddingBottom: 100,
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
    padding: t.spacing.lg,
  },
  cardFooter: {
    fontFamily: t.fonts.mono,
    fontSize: 10,
    color: t.colors.border,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: t.spacing.sm,
  },
  label: {
    fontFamily: t.fonts.mono,
    fontSize: 13,
    color: t.colors.secondary,
  },
  value: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    color: t.colors.primary,
  },
  balanceValue: {
    fontFamily: t.fonts.mono,
    fontSize: 28,
    color: t.colors.primary,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: t.colors.border,
    marginVertical: t.spacing.sm,
  },
  chartContainer: {
    alignItems: "center",
    paddingVertical: t.spacing.sm,
  },
  emptyText: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    color: t.colors.muted,
    textAlign: "center",
    paddingVertical: t.spacing.xl,
  },
  comparisonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: t.spacing.md,
  },
  comparisonItem: {
    alignItems: "center",
  },
  comparisonLabel: {
    fontFamily: t.fonts.mono,
    fontSize: 10,
    color: t.colors.muted,
    marginBottom: t.spacing.xs,
  },
  comparisonValue: {
    fontFamily: t.fonts.mono,
    fontSize: 16,
    color: t.colors.primary,
  },
  arrow: {
    fontFamily: t.fonts.mono,
    fontSize: 20,
    color: t.colors.muted,
  },
  deltaContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: t.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
  },
  deltaLabel: {
    fontFamily: t.fonts.mono,
    fontSize: 12,
    color: t.colors.secondary,
    marginRight: t.spacing.sm,
  },
  deltaValue: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
  },
});