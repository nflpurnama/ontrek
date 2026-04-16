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
import { terminalTheme } from "@/src/presentation/theme/terminal";
import { formatCurrency } from "@/src/presentation/utility/formatter/currency";
import { TopBar } from "@/src/presentation/components/top-bar";

const t = terminalTheme;

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
}) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>
        {t.ascii.tl}
        {title}
        {t.ascii.tr}
      </Text>
    </View>
    <View style={styles.cardContent}>{children}</View>
    <Text style={styles.cardFooter}>
      {t.ascii.bl}
      {t.ascii.h.repeat(20)}
      {t.ascii.br}
    </Text>
  </View>
);

const getBlockChar = (percentage: number): string => {
  if (percentage >= 100) return t.ascii.fill;
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
  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const overBudget = spent > budget;
  const barColor = overBudget ? t.colors.expense : color;
  const totalBlocks = 20;
  const filledBlocks = Math.round((percentage / 100) * totalBlocks);

  const filled = t.ascii.fill.repeat(filledBlocks) + getBlockChar(percentage);
  const empty = t.ascii.empty.repeat(totalBlocks - filledBlocks);

  return (
    <View style={styles.progressContainer}>
      <Text style={[styles.progressBar, { color: barColor }]}>
        {filled}{empty}
      </Text>
      <Text
        style={[
          styles.progressText,
          overBudget && { color: t.colors.expense },
        ]}
      >
        {percentage.toFixed(0)}%
      </Text>
    </View>
  );
};

export default function BudgetScreen() {
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={t.colors.primary} />
      </View>
    );
  }

  const { month, year, hasBudget, budget } = budgetData ?? {};
  const monthLabel = month && year ? `${MONTH_NAMES[month - 1]} ${year}` : "";

  return (
    <View style={styles.container}>
      <TopBar title="ontrek" subtitle="@budget" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.monthLabel}>{monthLabel}</Text>

        {!hasBudget ? (
          <TerminalCard title="NO BUDGET SET">
            <Text style={styles.emptyText}>
              Set a monthly budget to track your spending
            </Text>
            <TouchableOpacity style={styles.setButton} onPress={handleEditBudget}>
              <Text style={styles.setButtonText}>SET BUDGET</Text>
            </TouchableOpacity>
          </TerminalCard>
        ) : (
          <>
            <TerminalCard title="TOTAL BUDGET">
              <View style={styles.totalRow}>
                <View style={styles.totalItem}>
                  <Text style={styles.totalLabel}>BUDGET</Text>
                  <Text style={styles.totalValue}>
                    Rp {formatCurrency(budget?.totalAmount ?? 0)}
                  </Text>
                </View>
                <View style={styles.totalItem}>
                  <Text style={styles.totalLabel}>SPENT</Text>
                  <Text
                    style={[
                      styles.totalValue,
                      {
                        color:
                          (budgetData?.totalSpent ?? 0) > (budget?.totalAmount ?? 0)
                            ? t.colors.expense
                            : t.colors.income,
                      },
                    ]}
                  >
                    Rp {formatCurrency(budgetData?.totalSpent ?? 0)}
                  </Text>
                </View>
              </View>
              <ProgressBar
                spent={budgetData?.totalSpent ?? 0}
                budget={budget?.totalAmount ?? 0}
                color={t.colors.primary}
              />
              <View style={styles.remainingRow}>
                <Text style={styles.remainingLabel}>REMAINING:</Text>
                <Text
                  style={[
                    styles.remainingValue,
                    {
                      color:
                        (budget?.totalAmount ?? 0) - (budgetData?.totalSpent ?? 0) >=
                        0
                          ? t.colors.income
                          : t.colors.expense,
                    },
                  ]}
                >
                  Rp{" "}
                  {formatCurrency(
                    (budget?.totalAmount ?? 0) - (budgetData?.totalSpent ?? 0)
                  )}
                </Text>
              </View>
            </TerminalCard>

            {budgetData?.categoryAllocations &&
              budgetData.categoryAllocations.length > 0 && (
                <TerminalCard title="CATEGORY ALLOCATIONS">
                  {budgetData.categoryAllocations.map((cat, index) => (
                    <View key={cat.categoryId} style={styles.categoryRow}>
                      <View style={styles.categoryInfo}>
                        <Text style={styles.categoryName}>{cat.categoryName}</Text>
                        <Text style={styles.categoryBudget}>
                          Rp {formatCurrency(cat.allocatedAmount)}
                        </Text>
                      </View>
                      <ProgressBar
                        spent={cat.spentAmount}
                        budget={cat.allocatedAmount}
                        color={t.colors.accent}
                      />
                      <Text style={styles.categoryRemaining}>
                        Rp {formatCurrency(cat.remainingAmount)} left
                      </Text>
                    </View>
                  ))}
                </TerminalCard>
              )}

            <TerminalCard title="UNALLOCATED">
              <View style={styles.unallocatedRow}>
                <View style={styles.unallocatedItem}>
                  <Text style={styles.unallocatedLabel}>BUDGET</Text>
                  <Text style={styles.unallocatedValue}>
                    Rp {formatCurrency(budgetData?.unallocatedBudget ?? 0)}
                  </Text>
                </View>
                <View style={styles.unallocatedItem}>
                  <Text style={styles.unallocatedLabel}>SPENT</Text>
                  <Text style={styles.unallocatedValue}>
                    Rp {formatCurrency(budgetData?.unallocatedSpent ?? 0)}
                  </Text>
                </View>
              </View>
            </TerminalCard>

            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditBudget}
            >
              <Text style={styles.editButtonText}>EDIT BUDGET</Text>
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
    backgroundColor: t.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: t.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: t.spacing.lg,
    paddingBottom: 150,
  },
  monthLabel: {
    fontFamily: t.fonts.mono,
    fontSize: 24,
    color: t.colors.primary,
    textAlign: "center",
    marginBottom: t.spacing.lg,
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
  emptyText: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    color: t.colors.muted,
    textAlign: "center",
    marginBottom: t.spacing.lg,
  },
  setButton: {
    backgroundColor: t.colors.primary,
    padding: t.spacing.md,
    borderRadius: t.border.radius,
    alignItems: "center",
  },
  setButtonText: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    color: t.colors.background,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: t.spacing.md,
  },
  totalItem: {
    flex: 1,
    alignItems: "center",
  },
  totalLabel: {
    fontFamily: t.fonts.mono,
    fontSize: 10,
    color: t.colors.muted,
    marginBottom: t.spacing.xs,
  },
  totalValue: {
    fontFamily: t.fonts.mono,
    fontSize: 18,
    color: t.colors.primary,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: t.spacing.sm,
  },
  progressBar: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    letterSpacing: 1,
  },
  progressText: {
    fontFamily: t.fonts.mono,
    fontSize: 12,
    color: t.colors.secondary,
    marginLeft: t.spacing.sm,
    width: 40,
    textAlign: "right",
  },
  remainingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: t.spacing.sm,
    paddingTop: t.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
  },
  remainingLabel: {
    fontFamily: t.fonts.mono,
    fontSize: 12,
    color: t.colors.secondary,
  },
  remainingValue: {
    fontFamily: t.fonts.mono,
    fontSize: 16,
    color: t.colors.income,
  },
  categoryRow: {
    marginBottom: t.spacing.md,
    paddingBottom: t.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.border,
  },
  categoryInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: t.spacing.xs,
  },
  categoryName: {
    fontFamily: t.fonts.mono,
    fontSize: 13,
    color: t.colors.secondary,
  },
  categoryBudget: {
    fontFamily: t.fonts.mono,
    fontSize: 13,
    color: t.colors.primary,
  },
  categoryRemaining: {
    fontFamily: t.fonts.mono,
    fontSize: 11,
    color: t.colors.muted,
    marginTop: t.spacing.xs,
  },
  unallocatedRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  unallocatedItem: {
    alignItems: "center",
  },
  unallocatedLabel: {
    fontFamily: t.fonts.mono,
    fontSize: 10,
    color: t.colors.muted,
    marginBottom: t.spacing.xs,
  },
  unallocatedValue: {
    fontFamily: t.fonts.mono,
    fontSize: 16,
    color: t.colors.secondary,
  },
  editButton: {
    backgroundColor: t.colors.card,
    borderWidth: 1,
    borderColor: t.colors.primary,
    padding: t.spacing.md,
    borderRadius: t.border.radius,
    alignItems: "center",
    marginBottom: t.spacing.md,
  },
  editButtonText: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    color: t.colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: t.colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: t.spacing.xl,
    paddingBottom: 40,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalTitle: {
    fontFamily: t.fonts.mono,
    fontSize: 18,
    color: t.colors.primary,
    textAlign: "center",
    marginBottom: t.spacing.xl,
  },
  errorContainer: {
    backgroundColor: t.colors.expense + "20",
    borderWidth: 1,
    borderColor: t.colors.expense,
    borderRadius: t.border.radius,
    padding: t.spacing.md,
    marginBottom: t.spacing.lg,
  },
  errorText: {
    fontFamily: t.fonts.mono,
    fontSize: 12,
    color: t.colors.expense,
  },
  inputLabel: {
    fontFamily: t.fonts.mono,
    fontSize: 11,
    color: t.colors.muted,
    marginBottom: t.spacing.xs,
  },
  input: {
    backgroundColor: t.colors.background,
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: t.border.radius,
    padding: t.spacing.md,
    fontFamily: t.fonts.mono,
    fontSize: 14,
    color: t.colors.secondary,
    marginBottom: t.spacing.md,
  },
  allocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: t.spacing.sm,
  },
  categoryInput: {
    flex: 2,
    marginRight: t.spacing.sm,
    marginBottom: 0,
    position: "relative",
  },
  amountInput: {
    flex: 1,
    marginBottom: 0,
  },
  removeButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: t.spacing.sm,
  },
  removeButtonText: {
    fontFamily: t.fonts.mono,
    fontSize: 20,
    color: t.colors.expense,
  },
  addButton: {
    padding: t.spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: t.border.radius,
    borderStyle: "dashed",
    marginVertical: t.spacing.md,
  },
  addButtonText: {
    fontFamily: t.fonts.mono,
    fontSize: 12,
    color: t.colors.muted,
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: t.spacing.lg,
  },
  cancelButton: {
    flex: 1,
    padding: t.spacing.md,
    alignItems: "center",
    marginRight: t.spacing.sm,
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: t.border.radius,
  },
  cancelButtonText: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    color: t.colors.muted,
  },
  saveButton: {
    flex: 1,
    padding: t.spacing.md,
    alignItems: "center",
    backgroundColor: t.colors.primary,
    borderRadius: t.border.radius,
    marginLeft: t.spacing.sm,
  },
  saveButtonText: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    color: t.colors.background,
  },
  allocationContainer: {
    marginBottom: t.spacing.sm,
    zIndex: 1,
  },
  categoryText: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    color: t.colors.secondary,
  },
  categoryPlaceholder: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    color: t.colors.muted,
  },
  categoryTextInput: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    color: t.colors.secondary,
    padding: 0,
    flex: 1,
  },
  categorySuggestions: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: t.colors.card,
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: t.border.radius,
    marginTop: 4,
    zIndex: 10,
  },
  categorySuggestionsAbove: {
    backgroundColor: t.colors.card,
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: t.border.radius,
    marginBottom: 4,
    zIndex: 10,
  },
  categorySuggestion: {
    padding: t.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.border,
  },
  categorySuggestionText: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    color: t.colors.secondary,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  pickerContainer: {
    backgroundColor: t.colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: t.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.border,
  },
  pickerTitle: {
    fontFamily: t.fonts.mono,
    fontSize: 16,
    color: t.colors.primary,
  },
  pickerClose: {
    fontFamily: t.fonts.mono,
    fontSize: 28,
    color: t.colors.muted,
  },
  pickerList: {
    paddingBottom: 40,
  },
  pickerOption: {
    padding: t.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.border,
  },
  pickerOptionText: {
    fontFamily: t.fonts.mono,
    fontSize: 16,
    color: t.colors.secondary,
  },
});
