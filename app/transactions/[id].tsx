import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDependencies } from "@/src/application/providers/dependency-provider";
import { Transaction } from "@/src/domain/entities/transaction";
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

const formatDate = (date: Date): string => {
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

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { viewTransactionsUseCase, deleteTransactionUseCase } = useDependencies();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const results = await viewTransactionsUseCase.execute({});
        const found = results.find((t) => t.id.getValue() === id) ?? null;
        setTransaction(found);
      } catch (err: any) {
        Alert.alert("Error", err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure? This will reverse the balance change.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteTransactionUseCase.execute({
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

  if (!transaction) {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>[ transaction not found ]</Text>
        </View>
      </View>
    );
  }

  const isExpense = transaction.type === "EXPENSE";

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← back</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>TRANSACTION</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <TerminalCard title="DETAILS">
          <TerminalRow 
            label="AMOUNT" 
            value={`${isExpense ? "-" : "+"}Rp ${formatCurrency(transaction.amount)}`}
            valueColor={isExpense ? t.colors.expense : t.colors.income}
          />
          <View style={styles.divider} />
          <TerminalRow 
            label="DATE" 
            value={formatDate(transaction.transactionDate)}
          />
          <View style={styles.divider} />
          <TerminalRow 
            label="TYPE" 
            value={transaction.type}
            valueColor={isExpense ? t.colors.expense : t.colors.income}
          />
        </TerminalCard>

        <TerminalCard title="INFO">
          <TerminalRow 
            label="VENDOR" 
            value={transaction.vendorId ?? "—"}
            valueColor={transaction.vendorId ? t.colors.primary : undefined}
          />
          <View style={styles.divider} />
          <TerminalRow 
            label="CATEGORY" 
            value={transaction.categoryId ?? "—"}
            valueColor={transaction.categoryId ? t.colors.accent : undefined}
          />
          <View style={styles.divider} />
          <TerminalRow 
            label="NOTE" 
            value={transaction.description ?? "—"}
            valueColor={transaction.description ? t.colors.secondary : undefined}
          />
        </TerminalCard>

        <TouchableOpacity
          style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]}
          onPress={handleDelete}
          disabled={deleting}
        >
          <Text style={styles.deleteText}>
            {deleting ? "deleting..." : "[ delete transaction ]"}
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