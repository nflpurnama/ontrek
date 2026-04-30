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
import { useDependencies } from "@/src/application/providers/dependency-provider";
import { Transaction } from "@/src/domain/entities/transaction";
import { Id } from "@/src/domain/value-objects/id";
import { useTheme } from "@/src/presentation/theme/theme-provider";
import { TopBar } from "@/src/presentation/components/top-bar";
import { formatCurrencyShort } from "@/src/presentation/utility/formatter/currency";

const formatDate = (date: Date): string => {
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

export default function TransactionDetailScreen() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { viewTransactionsUseCase, deleteTransactionUseCase, vendorRepository, categoryRepository } = useDependencies();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [vendorName, setVendorName] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const handleEdit = () => {
    router.push(`/transactions/edit/${id}` as any);
  };

  useEffect(() => {
    async function load() {
      try {
        const results = await viewTransactionsUseCase.execute({});
        const found = results.find((t) => t.id.getValue() === id) ?? null;
        setTransaction(found);

        if (found) {
          if (found.vendorId) {
            const vendors = await vendorRepository.getVendors([Id.rehydrate(found.vendorId)]);
            if (vendors.length > 0) {
              setVendorName(vendors[0].name);
            }
          }

          if (found.categoryId) {
            const cats = await categoryRepository.getCategory([Id.rehydrate(found.categoryId)]);
            if (cats.length > 0) {
              setCategoryName(cats[0].name);
            }
          }
        }
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
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <TopBar title="TRANSACTION" />
        <View style={styles.center}>
          <Text style={[styles.errorText, { fontFamily: theme.fonts.mono, fontSize: 14, color: theme.colors.muted }]}>[ transaction not found ]</Text>
        </View>
      </View>
    );
  }

  const isExpense = transaction.type === "EXPENSE";

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TopBar title="ontrek" subtitle="@transaction" />

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.content, { padding: theme.spacing.lg, paddingBottom: 100 }]}>
        <TerminalCard title="DETAILS">
          <TerminalRow
            label="AMOUNT"
            value={`${isExpense ? "-" : "+"}Rp ${formatCurrencyShort(transaction.amount)}`}
            valueColor={isExpense ? theme.colors.expense : theme.colors.income}
          />
          <View style={[styles.divider, { height: 1, backgroundColor: theme.colors.border }]} />
          <TerminalRow
            label="DATE"
            value={formatDate(transaction.transactionDate)}
          />
          <View style={[styles.divider, { height: 1, backgroundColor: theme.colors.border }]} />
          <TerminalRow
            label="TYPE"
            value={transaction.type}
            valueColor={isExpense ? theme.colors.expense : theme.colors.income}
          />
        </TerminalCard>

        <TerminalCard title="INFO">
          <TerminalRow
            label="VENDOR"
            value={vendorName ?? "—"}
            valueColor={vendorName ? theme.colors.primary : undefined}
          />
          <View style={[styles.divider, { height: 1, backgroundColor: theme.colors.border }]} />
          <TerminalRow
            label="CATEGORY"
            value={categoryName ?? "—"}
            valueColor={categoryName ? theme.colors.accent : undefined}
          />
          <View style={[styles.divider, { height: 1, backgroundColor: theme.colors.border }]} />
          <TerminalRow
            label="NOTE"
            value={transaction.description ?? "—"}
            valueColor={transaction.description ? theme.colors.secondary : undefined}
          />
        </TerminalCard>

        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.accent, padding: theme.spacing.lg, borderRadius: theme.border.radius, alignItems: "center", marginTop: theme.spacing.md }]}
          onPress={handleEdit}
        >
          <Text style={[styles.editText, { fontFamily: theme.fonts.mono, fontSize: 14, color: theme.colors.accent }]}>
            [ edit transaction ]
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.expense, padding: theme.spacing.lg, borderRadius: theme.border.radius, alignItems: "center", marginTop: theme.spacing.md }, deleting && { opacity: 0.5 }]}
          onPress={handleDelete}
          disabled={deleting}
        >
          <Text style={[styles.deleteText, { fontFamily: theme.fonts.mono, fontSize: 14, color: theme.colors.expense }]}>
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
  deleteButton: {},
  deleteButtonDisabled: {},
  deleteText: {},
  editButton: {},
  editText: {},
});
