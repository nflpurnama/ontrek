import { Text, View, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import React, { useState, useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { useDependencies } from "@/src/application/providers/dependency-provider";
import { SavingsGoal } from "@/src/domain/entities/savings-goal";
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

const formatDate = (date: Date | null): string => {
  if (!date) return "No deadline";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

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

interface GoalCardProps {
  goal: SavingsGoal;
  onPress: () => void;
  onDeposit: () => void;
  onWithdraw: () => void;
}

const GoalCard = ({ goal, onPress, onDeposit, onWithdraw }: GoalCardProps) => {
  const progressPercent = goal.progressPercentage;
  const isCompleted = goal.isCompleted;
  
  return (
    <TouchableOpacity onPress={onPress} style={styles.goalCard}>
      <View style={styles.goalContent}>
        <View style={styles.goalHeader}>
          <Text style={[styles.goalName, isCompleted && styles.completedText]}>
            {goal.name}
          </Text>
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>COMPLETE</Text>
            </View>
          )}
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>{progressPercent.toFixed(0)}%</Text>
        </View>
        
        <View style={styles.goalFooter}>
          <Text style={styles.goalBalance}>
            {formatCurrency(goal.currentBalance)} / {formatCurrency(goal.targetAmount)}
          </Text>
          <Text style={styles.goalDate}>{formatDate(goal.targetDate)}</Text>
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.depositButton]} 
          onPress={(e) => {
            e.stopPropagation();
            onDeposit();
          }}
        >
          <Text style={styles.actionButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.withdrawButton]} 
          onPress={(e) => {
            e.stopPropagation();
            onWithdraw();
          }}
        >
          <Text style={styles.actionButtonText}>-</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default function Goals() {
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
    }, [loadGoals])
  );

  const handleAddGoal = () => {
    router.push("/goals/add");
  };

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
        <Text style={styles.terminalTitle}>ontrek@goals</Text>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {goals.length > 0 ? (
          goals.map((goal) => (
            <GoalCard
              key={goal.id.getValue()}
              goal={goal}
              onPress={() => router.push(`/goals/${goal.id.getValue()}`)}
              onDeposit={() => router.push(`/goals/${goal.id.getValue()}/deposit`)}
              onWithdraw={() => router.push(`/goals/${goal.id.getValue()}/withdraw`)}
            />
          ))
        ) : (
          <TerminalCard title="NO GOALS">
            <Text style={styles.emptyText}>
              [ no savings goals yet ]
            </Text>
            <Text style={styles.emptySubtext}>
              tap below to create your first goal
            </Text>
          </TerminalCard>
        )}
        
        <TouchableOpacity style={styles.addButton} onPress={handleAddGoal}>
          <Text style={styles.addButtonText}>+ NEW GOAL</Text>
        </TouchableOpacity>
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
  goalCard: {
    backgroundColor: t.colors.card,
    borderRadius: t.border.radius,
    padding: t.spacing.lg,
    marginBottom: t.spacing.md,
    borderWidth: 1,
    borderColor: t.colors.border,
    flexDirection: "row",
    alignItems: "center",
  },
  goalContent: {
    flex: 1,
  },
  actionButtons: {
    justifyContent: "space-between",
    marginLeft: t.spacing.md,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  depositButton: {
    backgroundColor: t.colors.expense,
    borderColor: t.colors.expense,
    marginBottom: 4,
  },
  withdrawButton: {
    backgroundColor: "transparent",
    borderColor: t.colors.income,
  },
  actionButtonText: {
    fontFamily: t.fonts.mono,
    fontSize: 20,
    fontWeight: "700",
    color: t.colors.background,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: t.spacing.md,
  },
  goalName: {
    fontFamily: t.fonts.mono,
    fontSize: 16,
    fontWeight: "600",
    color: t.colors.primary,
    flex: 1,
  },
  completedText: {
    color: t.colors.income,
  },
  completedBadge: {
    backgroundColor: t.colors.income,
    paddingHorizontal: t.spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  completedBadgeText: {
    fontFamily: t.fonts.mono,
    fontSize: 9,
    color: t.colors.background,
    fontWeight: "700",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: t.spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: t.colors.border,
    borderRadius: 4,
    overflow: "hidden",
    marginRight: t.spacing.md,
  },
  progressFill: {
    height: "100%",
    backgroundColor: t.colors.accent,
    borderRadius: 4,
  },
  progressText: {
    fontFamily: t.fonts.mono,
    fontSize: 12,
    fontWeight: "600",
    color: t.colors.primary,
    width: 40,
    textAlign: "right",
  },
  goalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goalBalance: {
    fontFamily: t.fonts.mono,
    fontSize: 13,
    color: t.colors.secondary,
  },
  goalDate: {
    fontFamily: t.fonts.mono,
    fontSize: 11,
    color: t.colors.muted,
  },
  emptyText: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    color: t.colors.muted,
    textAlign: "center",
    paddingVertical: t.spacing.md,
  },
  emptySubtext: {
    fontFamily: t.fonts.mono,
    fontSize: 11,
    color: t.colors.muted,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: t.colors.accent,
    borderRadius: t.border.radius,
    padding: t.spacing.lg,
    alignItems: "center",
    marginTop: t.spacing.md,
  },
  addButtonText: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    fontWeight: "700",
    color: t.colors.background,
  },
});
