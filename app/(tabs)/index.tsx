import { Text, View, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import React, { useState, useCallback } from "react";
import { useFocusEffect, router } from "expo-router";

import { useDependencies } from "@/src/application/providers/dependency-provider";
import { DashboardData } from "@/src/application/types/dashboard";
import { PieChart } from "@/src/presentation/components/dashboard/pie-chart";
import { useTheme } from "@/src/presentation/theme/theme-provider";
import { formatCurrency, formatCurrencyShort } from "@/src/presentation/utility/formatter/currency";
import { TopBar } from "@/src/presentation/components/top-bar";

const TerminalCard = ({ title, children, theme }: { title: string; children: React.ReactNode; theme: ReturnType<typeof useTheme>["theme"] }) => (
  <View style={[styles.card, { marginBottom: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.border.radius }]}>
    <View style={[styles.cardHeader, { backgroundColor: theme.colors.card, paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.xs, borderTopLeftRadius: theme.border.radius, borderTopRightRadius: theme.border.radius }]}>
      <Text style={[styles.cardTitle, { fontFamily: theme.fonts.mono, fontSize: 12, color: theme.colors.secondary }]}>{theme.ascii?.tl ?? ""}{title}{theme.ascii?.tr ?? ""}</Text>
    </View>
    <View style={[styles.cardContent, { backgroundColor: theme.colors.card, padding: theme.spacing.lg }]}>
      {children}
    </View>
    {theme.ascii && (
      <Text style={[styles.cardFooter, { fontFamily: theme.fonts.mono, fontSize: 10, color: theme.colors.border, textAlign: "center" }]}>{theme.ascii.bl}{theme.ascii.h.repeat(20)}{theme.ascii.br}</Text>
    )}
  </View>
);

const TerminalRow = ({ label, value, valueColor, theme }: { label: string; value: string; valueColor?: string; theme: ReturnType<typeof useTheme>["theme"] }) => (
  <View style={[styles.row, { marginBottom: theme.spacing.sm }]}>
    <Text style={[styles.label, { fontFamily: theme.fonts.mono, fontSize: 13, color: theme.colors.secondary }]}>{label}</Text>
    <Text style={[styles.value, { fontFamily: theme.fonts.mono, fontSize: 14, color: valueColor ?? theme.colors.primary }]}>{value}</Text>
  </View>
);

export default function Index() {
  const { theme: t } = useTheme();
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
      <View style={[styles.loadingContainer, { backgroundColor: t.colors.background }]}>
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
    <View style={[styles.container, { backgroundColor: t.colors.background }]}>
      <TopBar
        title="ontrek"
        subtitle="@dashboard"
        rightAction={{
          label: "settings",
          onPress: () => router.push("/(tabs)/settings" as any),
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.content, { padding: t.spacing.lg, paddingTop: t.spacing.sm, paddingBottom: 100 }]}>
        <TerminalCard title="BALANCE" theme={t}>
          <Text style={[styles.balanceValue, { fontFamily: t.fonts.mono, fontSize: 28, color: t.colors.primary, textAlign: "center" }]}>
            Rp {formatCurrency(currentBalance)}
          </Text>
        </TerminalCard>

        <TerminalCard title="THIS MONTH" theme={t}>
          <TerminalRow
            label="INCOME"
            value={`+${formatCurrencyShort(currentMonth.totalIncome)}`}
            valueColor={t.colors.income}
            theme={t}
          />
          <TerminalRow
            label="EXPENSE"
            value={`-${formatCurrencyShort(currentMonth.totalExpenses)}`}
            valueColor={t.colors.expense}
            theme={t}
          />
          <View style={[styles.divider, { height: 1, backgroundColor: t.colors.border, marginVertical: t.spacing.sm }]} />
          <TerminalRow
            label="NET"
            value={`${currentMonth.net >= 0 ? "+" : ""}${formatCurrencyShort(currentMonth.net)}`}
            valueColor={currentMonth.net >= 0 ? t.colors.income : t.colors.expense}
            theme={t}
          />
        </TerminalCard>

        <TerminalCard title="CATEGORIES" theme={t}>
          {currentMonth.byCategory.length > 0 ? (
            <View style={[styles.chartContainer, { alignItems: "center", paddingVertical: t.spacing.sm }]}>
              <PieChart
                data={currentMonth.byCategory}
                size={180}
              />
            </View>
          ) : (
            <Text style={[styles.emptyText, { fontFamily: t.fonts.mono, fontSize: 14, color: t.colors.muted, textAlign: "center", paddingVertical: t.spacing.xl }]}>[ no data ]</Text>
          )}
        </TerminalCard>

        <TerminalCard title="VS LAST MONTH" theme={t}>
          <View style={[styles.comparisonContainer, { flexDirection: "row", justifyContent: "space-around", alignItems: "center", marginBottom: t.spacing.md }]}>
            <View style={styles.comparisonItem}>
              <Text style={[styles.comparisonLabel, { fontFamily: t.fonts.mono, fontSize: 10, color: t.colors.muted, marginBottom: t.spacing.xs }]}>LAST</Text>
              <Text style={[styles.comparisonValue, { fontFamily: t.fonts.mono, fontSize: 16, color: t.colors.primary }]}>
                {formatCurrency(previousMonth.net)}
              </Text>
            </View>
            <Text style={[styles.arrow, { fontFamily: t.fonts.mono, fontSize: 20, color: t.colors.muted }]}>→</Text>
            <View style={styles.comparisonItem}>
              <Text style={[styles.comparisonLabel, { fontFamily: t.fonts.mono, fontSize: 10, color: t.colors.muted, marginBottom: t.spacing.xs }]}>THIS</Text>
              <Text style={[styles.comparisonValue, { fontFamily: t.fonts.mono, fontSize: 16, color: t.colors.primary }]}>
                {formatCurrency(currentMonth.net)}
              </Text>
            </View>
          </View>
          <View style={[styles.deltaContainer, { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingTop: t.spacing.sm, borderTopWidth: 1, borderTopColor: t.colors.border }]}>
            <Text style={[styles.deltaLabel, { fontFamily: t.fonts.mono, fontSize: 12, color: t.colors.secondary, marginRight: t.spacing.sm }]}>DELTA:</Text>
            <Text style={[
              styles.deltaValue,
              { fontFamily: t.fonts.mono, fontSize: 14, color: netChange >= 0 ? t.colors.income : t.colors.expense }
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
  },
  scrollView: {
    flex: 1,
  },
  content: {},
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {},
  cardHeader: {},
  cardTitle: {},
  cardContent: {},
  cardFooter: {},
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {},
  value: {},
  balanceValue: {},
  divider: {},
  chartContainer: {},
  emptyText: {},
  comparisonContainer: {},
  comparisonItem: {
    alignItems: "center",
  },
  comparisonLabel: {},
  comparisonValue: {},
  arrow: {},
  deltaContainer: {},
  deltaLabel: {},
  deltaValue: {},
});
