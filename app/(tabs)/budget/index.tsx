import {
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState, useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { useDependencies } from "@/src/application/providers/dependency-provider";
import { CurrentBudgetData } from "@/src/application/use-case/budget/get-current-budget";
import { useTheme } from "@/src/presentation/theme/theme-provider";
import { formatCurrency } from "@/src/presentation/utility/formatter/currency";
import { TopBar } from "@/src/presentation/components/top-bar";

const BLOCK_FILL = "█";
const BLOCK_EMPTY = "░";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const TerminalCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { marginBottom: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.border.radius }]}>
      <View style={[styles.cardHeader, { backgroundColor: theme.colors.card, paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.sm, borderTopLeftRadius: theme.border.radius, borderTopRightRadius: theme.border.radius }]}>
        <Text style={[styles.cardTitle, { fontFamily: theme.fonts.mono, fontSize: 12, color: theme.colors.secondary }]}>
          {theme.ascii?.tl ?? ""}{title}{theme.ascii?.tr ?? ""}
        </Text>
      </View>
      <View style={[styles.cardContent, { backgroundColor: theme.colors.card, padding: theme.spacing.lg }]}>{children}</View>
      {theme.ascii && (
        <Text style={[styles.cardFooter, { fontFamily: theme.fonts.mono, fontSize: 10, color: theme.colors.border, textAlign: "center" }]}>{theme.ascii.bl}{theme.ascii.h.repeat(20)}{theme.ascii.br}</Text>
      )}
    </View>
  );
};

const getBlockChar = (percentage: number): string => {
  if (percentage >= 100) return BLOCK_FILL;
  if (percentage >= 87.5) return "▓";
  if (percentage >= 75) return "▒";
  if (percentage >= 62.5) return "▒";
  if (percentage >= 50) return "▒";
  if (percentage >= 37.5) return "░";
  if (percentage >= 25) return "░";
  if (percentage >= 12.5) return "░";
  return " ";
};

const ProgressBar = ({
  spent,
  budget,
  color,
}: {
  spent: number;
  budget: number;
  color: string;
}) => {
  const { theme } = useTheme();
  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const overBudget = spent > budget;
  const barColor = overBudget ? theme.colors.expense : color;
  const totalBlocks = 20;
  const filledBlocks = Math.round((percentage / 100) * totalBlocks);

  const fillChar = theme.ascii?.fill ?? BLOCK_FILL;
  const emptyChar = theme.ascii?.empty ?? BLOCK_EMPTY;
  const filled = fillChar.repeat(filledBlocks) + getBlockChar(percentage);
  const empty = emptyChar.repeat(totalBlocks - filledBlocks);

  return (
    <View style={[styles.progressContainer, { marginVertical: theme.spacing.sm }]}>
      <Text style={[styles.progressBar, { fontFamily: theme.fonts.mono, fontSize: 14, letterSpacing: 1, color: barColor }]}>
        {filled}{empty}
      </Text>
      <Text
        style={[
          styles.progressText,
          { fontFamily: theme.fonts.mono, fontSize: 12, color: theme.colors.secondary, marginLeft: theme.spacing.sm, width: 40, textAlign: "right" },
          overBudget && { color: theme.colors.expense },
        ]}
      >
        {percentage.toFixed(0)}%
      </Text>
    </View>
  );
};

export default function BudgetScreen() {
  const { theme } = useTheme();
  const {
    getCurrentBudgetUseCase,
    copyBudgetToNextMonthUseCase
  } = useDependencies();
  const router = useRouter();

  const [budgetData, setBudgetData] = useState<CurrentBudgetData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBudget = useCallback(async () => {
    setLoading(true);
    try {
      let data = await getCurrentBudgetUseCase.execute();

      if (!data.budget) {
        await copyBudgetToNextMonthUseCase.execute();
        data = await getCurrentBudgetUseCase.execute();
      }

      setBudgetData(data);
    } catch (error) {
      console.error("Failed to load budget:", error);
    } finally {
      setLoading(false);
    }
  }, [getCurrentBudgetUseCase, copyBudgetToNextMonthUseCase]);

  useFocusEffect(
    useCallback(() => {
      loadBudget();
    }, [loadBudget])
  );

  const handleEditBudget = () => {
    router.push("/budget/edit");
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const { month, year, hasBudget, budget, daysRemaining, dailyAllowance } = budgetData ?? {};
  const monthLabel = month && year ? `${MONTH_NAMES[month - 1]} ${year}` : "";

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TopBar title="ontrek" subtitle="@budget" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { padding: theme.spacing.lg, paddingBottom: 150 }]}
      >
        <Text style={[styles.monthLabel, { fontFamily: theme.fonts.mono, fontSize: 24, color: theme.colors.primary, textAlign: "center", marginBottom: theme.spacing.lg }]}>{monthLabel}</Text>

        {!hasBudget ? (
          <TerminalCard title="NO BUDGET SET">
            <Text style={[styles.emptyText, { fontFamily: theme.fonts.mono, fontSize: 14, color: theme.colors.muted, textAlign: "center", marginBottom: theme.spacing.lg }]}>
              Set a monthly budget to track your spending
            </Text>
            <TouchableOpacity style={[styles.setButton, { backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.border.radius, alignItems: "center" }]} onPress={handleEditBudget}>
              <Text style={[styles.setButtonText, { fontFamily: theme.fonts.mono, fontSize: 14, color: theme.colors.background }]}>SET BUDGET</Text>
            </TouchableOpacity>
          </TerminalCard>
        ) : (
          <>
            <TerminalCard title="TOTAL BUDGET">
              <View style={styles.totalRow}>
                <View style={styles.totalItem}>
                  <Text style={[styles.totalLabel, { fontFamily: theme.fonts.mono, fontSize: 10, color: theme.colors.muted, marginBottom: theme.spacing.xs }]}>BUDGET</Text>
                  <Text style={[styles.totalValue, { fontFamily: theme.fonts.mono, fontSize: 18, color: theme.colors.primary }]}>
                    Rp {formatCurrency(budget?.totalAmount ?? 0)}
                  </Text>
                </View>
                <View style={styles.totalItem}>
                  <Text style={[styles.totalLabel, { fontFamily: theme.fonts.mono, fontSize: 10, color: theme.colors.muted, marginBottom: theme.spacing.xs }]}>SPENT</Text>
                  <Text
                    style={[
                      styles.totalValue,
                      { fontFamily: theme.fonts.mono, fontSize: 18, color: (budgetData?.totalSpent ?? 0) > (budget?.totalAmount ?? 0) ? theme.colors.expense : theme.colors.income },
                    ]}
                  >
                    Rp {formatCurrency(budgetData?.totalSpent ?? 0)}
                  </Text>
                </View>
              </View>
              <ProgressBar
                spent={budgetData?.totalSpent ?? 0}
                budget={budget?.totalAmount ?? 0}
                color={theme.colors.primary}
              />
              <View style={[styles.remainingRow, { marginTop: theme.spacing.sm, paddingTop: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
                <Text style={[styles.remainingLabel, { fontFamily: theme.fonts.mono, fontSize: 12, color: theme.colors.secondary }]}>REMAINING:</Text>
                <Text
                  style={[
                    styles.remainingValue,
                    { fontFamily: theme.fonts.mono, fontSize: 16, color: (budget?.totalAmount ?? 0) - (budgetData?.totalSpent ?? 0) >= 0 ? theme.colors.income : theme.colors.expense },
                  ]}
                >
                  Rp{" "}
                  {formatCurrency(
                    (budget?.totalAmount ?? 0) - (budgetData?.totalSpent ?? 0)
                  )}
                </Text>
              </View>
              <View style={[styles.remainingRow, { marginTop: theme.spacing.sm, paddingTop: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
                <Text style={[styles.remainingLabel, { fontFamily: theme.fonts.mono, fontSize: 12, color: theme.colors.secondary }]}>DAILY ALLOWANCE:</Text>
                <Text
                  style={[
                    styles.remainingValue,
                    { fontFamily: theme.fonts.mono, fontSize: 16, color: (dailyAllowance ?? 0) >= 0 ? theme.colors.accent : theme.colors.expense },
                  ]}
                >
                  Rp {formatCurrency(dailyAllowance ?? 0)} / {daysRemaining ?? 0}d
                </Text>
              </View>
            </TerminalCard>

            {budgetData?.categoryAllocations &&
              budgetData.categoryAllocations.length > 0 && (
                <TerminalCard title="CATEGORY ALLOCATIONS">
                  {budgetData.categoryAllocations.map((cat) => (
                    <View key={cat.categoryId} style={[styles.categoryRow, { marginBottom: theme.spacing.md, paddingBottom: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}>
                      <View style={[styles.categoryInfo, { flexDirection: "row", justifyContent: "space-between", marginBottom: theme.spacing.xs }]}>
                        <Text style={[styles.categoryName, { fontFamily: theme.fonts.mono, fontSize: 13, color: theme.colors.secondary }]}>{cat.categoryName}</Text>
                        <Text style={[styles.categoryBudget, { fontFamily: theme.fonts.mono, fontSize: 13, color: theme.colors.primary }]}>
                          Rp {formatCurrency(cat.allocatedAmount)}
                        </Text>
                      </View>
                      <ProgressBar
                        spent={cat.spentAmount}
                        budget={cat.allocatedAmount}
                        color={theme.colors.accent}
                      />
                      <Text style={[styles.categoryRemaining, { fontFamily: theme.fonts.mono, fontSize: 11, color: theme.colors.muted, marginTop: theme.spacing.xs }]}>
                        Rp {formatCurrency(cat.remainingAmount)} left
                      </Text>
                    </View>
                  ))}
                </TerminalCard>
              )}

            <TerminalCard title="UNALLOCATED">
              <View style={styles.unallocatedRow}>
                <View style={styles.unallocatedItem}>
                  <Text style={[styles.unallocatedLabel, { fontFamily: theme.fonts.mono, fontSize: 10, color: theme.colors.muted, marginBottom: theme.spacing.xs }]}>BUDGET</Text>
                  <Text style={[styles.unallocatedValue, { fontFamily: theme.fonts.mono, fontSize: 16, color: theme.colors.secondary }]}>
                    Rp {formatCurrency(budgetData?.unallocatedBudget ?? 0)}
                  </Text>
                </View>
                <View style={styles.unallocatedItem}>
                  <Text style={[styles.unallocatedLabel, { fontFamily: theme.fonts.mono, fontSize: 10, color: theme.colors.muted, marginBottom: theme.spacing.xs }]}>SPENT</Text>
                  <Text style={[styles.unallocatedValue, { fontFamily: theme.fonts.mono, fontSize: 16, color: theme.colors.secondary }]}>
                    Rp {formatCurrency(budgetData?.unallocatedSpent ?? 0)}
                  </Text>
                </View>
              </View>
            </TerminalCard>

            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.border.radius, alignItems: "center", marginBottom: theme.spacing.md }]}
              onPress={handleEditBudget}
            >
              <Text style={[styles.editButtonText, { fontFamily: theme.fonts.mono, fontSize: 14, color: theme.colors.primary }]}>EDIT BUDGET</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
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
  monthLabel: {},
  card: {},
  cardHeader: {},
  cardTitle: {},
  cardContent: {},
  cardFooter: {},
  emptyText: {},
  setButton: {},
  setButtonText: {},
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalItem: {
    flex: 1,
    alignItems: "center",
  },
  totalLabel: {},
  totalValue: {},
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {},
  progressText: {},
  remainingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  remainingLabel: {},
  remainingValue: {},
  categoryRow: {},
  categoryInfo: {},
  categoryName: {},
  categoryBudget: {},
  categoryRemaining: {},
  unallocatedRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  unallocatedItem: {
    alignItems: "center",
  },
  unallocatedLabel: {},
  unallocatedValue: {},
  editButton: {},
  editButtonText: {},
});
