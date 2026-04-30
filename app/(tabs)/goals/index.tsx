import { Text, View, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import React, { useState, useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { useDependencies } from "@/src/application/providers/dependency-provider";
import { SavingsGoal } from "@/src/domain/entities/savings-goal";
import { useTheme } from "@/src/presentation/theme/theme-provider";
import { TopBar } from "@/src/presentation/components/top-bar";
import { formatCurrencyShort } from "@/src/presentation/utility/formatter/currency";

const BLOCK_FILL = "█";
const BLOCK_EMPTY = "░";

const formatDate = (date: Date | null): string => {
  if (!date) return "No deadline";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const TerminalCard = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { marginBottom: theme.spacing.lg, backgroundColor: theme.colors.card, borderRadius: theme.border.radius, borderWidth: 1, borderColor: theme.colors.border }]}>
      <View style={[styles.cardHeader, { backgroundColor: theme.colors.card, paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.sm, borderTopLeftRadius: theme.border.radius, borderTopRightRadius: theme.border.radius }]}>
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
};

interface GoalCardProps {
  goal: SavingsGoal;
  onPress: () => void;
  onDeposit: () => void;
  onWithdraw: () => void;
}

const GoalCard = ({ goal, onPress, onDeposit, onWithdraw }: GoalCardProps) => {
  const { theme } = useTheme();
  const progressPercent = goal.progressPercentage;
  const fillChar = theme.ascii?.fill ?? BLOCK_FILL;
  const emptyChar = theme.ascii?.empty ?? BLOCK_EMPTY;
  const filled = fillChar.repeat(Math.max(0, Math.round((progressPercent / 100) * 20)));
  const empty = emptyChar.repeat(Math.max(0, 20 - Math.round((progressPercent / 100) * 20)));

  return (
    <TouchableOpacity onPress={onPress} style={[styles.goalCard, { backgroundColor: theme.colors.card, borderRadius: theme.border.radius, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border }]}>
      <View style={[styles.goalContent, { padding: theme.spacing.md }]}>
        <View style={[styles.goalHeader, { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.md }]}>
          <Text style={[styles.goalName, { fontFamily: theme.fonts.mono, fontSize: 16, color: theme.colors.primary, flex: 1 }]}>
            {goal.name}
          </Text>
        </View>

        <View style={[styles.progressContainer, { alignItems: "center", marginBottom: theme.spacing.sm }]}>
          <Text style={[styles.progressBar, { fontFamily: theme.fonts.mono, fontSize: 16, color: theme.colors.accent, letterSpacing: 1, flex: 1 }]}>
            {filled}{empty}
          </Text>
        </View>

        <View style={styles.balanceAbsolute}>
          <Text style={[styles.goalBalance, { fontFamily: theme.fonts.mono, fontSize: 10, color: theme.colors.secondary, backgroundColor: theme.colors.card, paddingHorizontal: theme.spacing.sm, paddingVertical: 2 }]}>
            {formatCurrencyShort(goal.currentBalance)} / {formatCurrencyShort(goal.targetAmount)}
          </Text>
        </View>

        <View style={[styles.goalFooter, { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: theme.spacing.sm }]}>
          <Text style={[styles.goalDateLabel, { fontFamily: theme.fonts.mono, fontSize: 9, color: theme.colors.muted, letterSpacing: 1 }]}>TARGET DATE</Text>
          <Text style={[styles.goalDate, { fontFamily: theme.fonts.mono, fontSize: 13, color: theme.colors.primary }]}>{formatDate(goal.targetDate)}</Text>
        </View>
      </View>

      <View style={[styles.actionButtons, { marginLeft: theme.spacing.md }]}>
        <TouchableOpacity
          style={[styles.actionButton, styles.depositButton, { backgroundColor: "transparent", borderLeftWidth: 1, borderBottomWidth: 1, borderColor: theme.colors.border, borderTopRightRadius: 2 }]}
          onPress={(e) => {
            e.stopPropagation();
            onDeposit();
          }}
        >
          <Text style={[styles.actionButtonText, { fontFamily: theme.fonts.mono, fontSize: 12, color: theme.colors.expense }]}>DEPOSIT</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.withdrawButton, { backgroundColor: "transparent", borderLeftWidth: 1, borderTopWidth: 1, borderColor: theme.colors.border, borderBottomRightRadius: 2 }]}
          onPress={(e) => {
            e.stopPropagation();
            onWithdraw();
          }}
        >
          <Text style={[styles.actionButtonText, { fontFamily: theme.fonts.mono, fontSize: 12, color: theme.colors.income }]}>WITHDRAW</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default function Goals() {
  const { theme } = useTheme();
  const { getAllSavingsGoalsUseCase } = useDependencies();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadGoals = useCallback(async () => {
    setLoading(true);
    const data = await getAllSavingsGoalsUseCase.execute();
    setGoals(data);
    setLoading(false);
  }, [getAllSavingsGoalsUseCase]);

  useFocusEffect(
    useCallback(() => {
      loadGoals();
      return () => {};
    }, [loadGoals])
  );

  const handleAddGoal = () => {
    router.push("/goals/add" as any);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TopBar title="ontrek" subtitle="@goals" />

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.content, { padding: theme.spacing.lg, paddingTop: 60, paddingBottom: 100 }]}>
        {goals.length > 0 ? (
          goals.map((goal) => (
            <GoalCard
              key={goal.id.getValue()}
              goal={goal}
              onPress={() => router.push(`/goals/${goal.id.getValue()}` as any)}
              onDeposit={() => router.push(`/goals/${goal.id.getValue()}/deposit` as any)}
              onWithdraw={() => router.push(`/goals/${goal.id.getValue()}/withdraw` as any)}
            />
          ))
        ) : (
          <TerminalCard title="NO GOALS">
            <Text style={[styles.emptyText, { fontFamily: theme.fonts.mono, fontSize: 14, color: theme.colors.muted, textAlign: "center", paddingVertical: theme.spacing.md }]}>
              [ no savings goals yet ]
            </Text>
            <Text style={[styles.emptySubtext, { fontFamily: theme.fonts.mono, fontSize: 11, color: theme.colors.muted, textAlign: "center" }]}>
              tap below to create your first goal
            </Text>
          </TerminalCard>
        )}

        <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.colors.accent, borderRadius: theme.border.radius, padding: theme.spacing.lg, alignItems: "center", marginTop: theme.spacing.md }]} onPress={handleAddGoal}>
          <Text style={[styles.addButtonText, { fontFamily: theme.fonts.mono, fontSize: 14, color: theme.colors.background }]}>+ NEW GOAL</Text>
        </TouchableOpacity>
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
  goalCard: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  goalContent: {
    flex: 2,
  },
  actionButtons: {
    flex: 1,
    flexDirection: "column",
  },
  actionButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  depositButton: {
    flex: 1,
  },
  withdrawButton: {
    flex: 1,
  },
  actionButtonText: {},
  goalHeader: {},
  goalName: {},
  completedText: {},
  completedBadge: {},
  completedBadgeText: {},
  progressContainer: {},
  progressBar: {},
  progressFill: {},
  progressText: {},
  goalFooter: {},
  balanceAbsolute: {
    position: "absolute",
    top: "45%",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1,
  },
  goalBalance: {},
  goalDateLabel: {},
  goalDate: {},
  emptyText: {},
  emptySubtext: {},
  addButton: {},
  addButtonText: {},
});
