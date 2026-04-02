import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { useDependencies } from "@/src/application/providers/dependency-provider";
import { SavingsGoal } from "@/src/domain/entities/savings-goal";
import { Id } from "@/src/domain/value-objects/id";
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
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).toUpperCase();
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

const TerminalRow = ({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, valueColor ? { color: valueColor } : null]}>{value}</Text>
  </View>
);

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getSavingsGoalByIdUseCase, deleteSavingsGoalUseCase } = useDependencies();

  const [goal, setGoal] = useState<SavingsGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const loadGoal = useCallback(async () => {
    setLoading(true);
    try {
      const found = await getSavingsGoalByIdUseCase.execute({
        id: Id.rehydrate(id),
      });
      setGoal(found);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  }, [id, getSavingsGoalByIdUseCase]);

  useEffect(() => {
    loadGoal();
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Goal",
      "Are you sure? This will remove the goal but won't delete linked transactions.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteSavingsGoalUseCase.execute({
                id: Id.rehydrate(id),
              });
              router.back();
            } catch (err: any) {
              Alert.alert("Error", err.message);
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={t.colors.primary} />
      </View>
    );
  }

  if (!goal) {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>[ goal not found ]</Text>
        </View>
      </View>
    );
  }

  const progressPercent = goal.progressPercentage;
  const isCompleted = goal.isCompleted;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← back</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>GOAL</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <TerminalCard title="DETAILS">
          <TerminalRow
            label="NAME"
            value={goal.name}
            valueColor={isCompleted ? t.colors.income : t.colors.primary}
          />
          <View style={styles.divider} />
          <TerminalRow
            label="TARGET"
            value={`Rp ${formatCurrency(goal.targetAmount)}`}
            valueColor={t.colors.secondary}
          />
          <View style={styles.divider} />
          <TerminalRow
            label="CURRENT"
            value={`Rp ${formatCurrency(goal.currentBalance)}`}
            valueColor={t.colors.income}
          />
          <View style={styles.divider} />
          <TerminalRow
            label="PROGRESS"
            value={`${progressPercent.toFixed(0)}%`}
            valueColor={t.colors.accent}
          />
          <View style={styles.divider} />
          <TerminalRow
            label="DEADLINE"
            value={formatDate(goal.targetDate)}
          />
        </TerminalCard>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        {isCompleted && (
          <View style={styles.completedBanner}>
            <Text style={styles.completedText}>GOAL COMPLETED</Text>
          </View>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/goals/${id}/deposit`)}
          >
            <Text style={styles.actionButtonText}>[ deposit ]</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/goals/${id}/withdraw`)}
          >
            <Text style={styles.actionButtonText}>[ withdraw ]</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]}
          onPress={handleDelete}
          disabled={deleting}
        >
          <Text style={styles.deleteText}>
            {deleting ? "deleting..." : "[ delete goal ]"}
          </Text>
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
    paddingBottom: 100,
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
  backButton: {
    paddingRight: t.spacing.md,
  },
  backText: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    color: t.colors.primary,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    color: t.colors.secondary,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    color: t.colors.muted,
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
    alignItems: "center",
    paddingVertical: t.spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: t.colors.border,
  },
  label: {
    fontFamily: t.fonts.mono,
    fontSize: 13,
    color: t.colors.muted,
  },
  value: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    fontWeight: "600",
    color: t.colors.secondary,
    textAlign: "right",
    maxWidth: "60%",
  },
  progressContainer: {
    marginBottom: t.spacing.lg,
  },
  progressBar: {
    height: 12,
    backgroundColor: t.colors.border,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: t.colors.accent,
    borderRadius: 6,
  },
  completedBanner: {
    backgroundColor: t.colors.income,
    padding: t.spacing.md,
    borderRadius: t.border.radius,
    alignItems: "center",
    marginBottom: t.spacing.lg,
  },
  completedText: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    fontWeight: "700",
    color: t.colors.background,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: t.spacing.lg,
  },
  actionButton: {
    flex: 1,
    backgroundColor: t.colors.card,
    borderWidth: 1,
    borderColor: t.colors.border,
    padding: t.spacing.md,
    borderRadius: t.border.radius,
    alignItems: "center",
    marginHorizontal: t.spacing.xs,
  },
  actionButtonText: {
    fontFamily: t.fonts.mono,
    fontSize: 13,
    color: t.colors.primary,
  },
  deleteButton: {
    backgroundColor: t.colors.card,
    borderWidth: 1,
    borderColor: t.colors.expense,
    padding: t.spacing.lg,
    borderRadius: t.border.radius,
    alignItems: "center",
    marginTop: t.spacing.md,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteText: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    color: t.colors.expense,
  },
});