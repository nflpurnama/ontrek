import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useState, useCallback } from "react";
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
import { useTheme } from "@/src/presentation/theme/theme-provider";
import { TopBar } from "@/src/presentation/components/top-bar";
import { formatCurrencyShort } from "@/src/presentation/utility/formatter/currency";

const formatDate = (date: Date | null): string => {
  if (!date) return "No deadline";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).toUpperCase();
};

const TerminalCard = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { marginBottom: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.border.radius }]}>
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

const TerminalRow = ({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.row, { paddingVertical: theme.spacing.sm }]}>
      <Text style={[styles.label, { fontFamily: theme.fonts.mono, fontSize: 13, color: theme.colors.muted }]}>{label}</Text>
      <Text style={[styles.value, { fontFamily: theme.fonts.mono, fontSize: 14, color: theme.colors.secondary, textAlign: "right", maxWidth: "60%" }, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
};

export default function GoalDetailScreen() {
  const { theme } = useTheme();
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

  useFocusEffect(
    useCallback(() => {
      loadGoal();
      return () => {};
    }, [loadGoal])
  );

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
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!goal) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <TopBar title="ontrek" subtitle="@goal/not-found" />
        <View style={styles.center}>
          <Text style={[styles.errorText, { fontFamily: theme.fonts.mono, fontSize: 14, color: theme.colors.muted }]}>[ goal not found ]</Text>
        </View>
      </View>
    );
  }

  const progressPercent = goal.progressPercentage;
  const isCompleted = goal.isCompleted;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TopBar title="ontrek" subtitle={`@goal/${goal.name}`} />

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.content, { padding: theme.spacing.lg, paddingBottom: 100 }]}>
        <TerminalCard title="DETAILS">
          <TerminalRow
            label="NAME"
            value={goal.name}
            valueColor={isCompleted ? theme.colors.income : theme.colors.primary}
          />
          <View style={[styles.divider, { height: 1, backgroundColor: theme.colors.border }]} />
          <TerminalRow
            label="TARGET"
            value={`Rp ${formatCurrencyShort(goal.targetAmount)}`}
            valueColor={theme.colors.secondary}
          />
          <View style={[styles.divider, { height: 1, backgroundColor: theme.colors.border }]} />
          <TerminalRow
            label="CURRENT"
            value={`Rp ${formatCurrencyShort(goal.currentBalance)}`}
            valueColor={theme.colors.income}
          />
          <View style={[styles.divider, { height: 1, backgroundColor: theme.colors.border }]} />
          <TerminalRow
            label="PROGRESS"
            value={`${progressPercent.toFixed(0)}%`}
            valueColor={theme.colors.accent}
          />
          <View style={[styles.divider, { height: 1, backgroundColor: theme.colors.border }]} />
          <TerminalRow
            label="DEADLINE"
            value={formatDate(goal.targetDate)}
          />
        </TerminalCard>

        <View style={[styles.progressContainer, { marginBottom: theme.spacing.lg }]}>
          <View style={[styles.progressBar, { height: 12, backgroundColor: theme.colors.border, borderRadius: 6, overflow: "hidden" }]}>
            <View style={[styles.progressFill, { width: `${progressPercent}%`, height: "100%", backgroundColor: theme.colors.accent, borderRadius: 6 }]} />
          </View>
        </View>

        {isCompleted && (
          <View style={[styles.completedBanner, { backgroundColor: theme.colors.income, padding: theme.spacing.md, borderRadius: theme.border.radius, alignItems: "center", marginBottom: theme.spacing.lg }]}>
            <Text style={[styles.completedText, { fontFamily: theme.fonts.mono, fontSize: 14, color: theme.colors.background }]}>GOAL COMPLETED</Text>
          </View>
        )}

        <View style={[styles.actionRow, { flexDirection: "row", justifyContent: "space-between", marginBottom: theme.spacing.lg }]}>
          <TouchableOpacity
            style={[styles.actionButton, { flex: 1, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.md, borderRadius: theme.border.radius, alignItems: "center", marginHorizontal: theme.spacing.xs }]}
            onPress={() => router.push(`/goals/${id}/deposit` as any)}
          >
            <Text style={[styles.actionButtonText, { fontFamily: theme.fonts.mono, fontSize: 13, color: theme.colors.primary }]}>[ deposit ]</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { flex: 1, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.md, borderRadius: theme.border.radius, alignItems: "center", marginHorizontal: theme.spacing.xs }]}
            onPress={() => router.push(`/goals/${id}/withdraw` as any)}
          >
            <Text style={[styles.actionButtonText, { fontFamily: theme.fonts.mono, fontSize: 13, color: theme.colors.primary }]}>[ withdraw ]</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.expense, padding: theme.spacing.lg, borderRadius: theme.border.radius, alignItems: "center", marginTop: theme.spacing.md }, deleting && { opacity: 0.5 }]}
          onPress={handleDelete}
          disabled={deleting}
        >
          <Text style={[styles.deleteText, { fontFamily: theme.fonts.mono, fontSize: 14, color: theme.colors.expense }]}>
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {},
  card: {},
  cardHeader: {},
  cardTitle: {},
  cardContent: {},
  cardFooter: {},
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  divider: {},
  label: {},
  value: {},
  progressContainer: {},
  progressBar: {},
  progressFill: {},
  completedBanner: {},
  completedText: {},
  actionRow: {},
  actionButton: {},
  actionButtonText: {},
  deleteButton: {},
  deleteButtonDisabled: {},
  deleteText: {},
});
