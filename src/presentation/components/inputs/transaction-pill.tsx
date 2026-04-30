import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { TransactionType } from "@/src/domain/constants/transaction-type";
import { Category } from "@/src/domain/entities/category";
import { Vendor } from "@/src/domain/entities/vendor";
import { formatCurrency } from "../../utility/formatter/currency";
import { useTheme } from "../../theme/theme-provider";

export type PhaseType = "type" | "amount" | "vendor" | "category" | "note";

type TransactionPillProps = {
  phase: PhaseType;
  label: string;
  onPress: () => void;
};

export const TransactionPill = ({
  phase,
  label,
  onPress,
}: TransactionPillProps) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.pill, { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 10, paddingVertical: 6, borderRadius: theme.border.radius, marginRight: 8, marginBottom: 8 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.phase, { color: theme.colors.muted, fontSize: 9, fontWeight: "700", letterSpacing: 1, marginRight: 4 }]}>{phase.toUpperCase()}</Text>
      <Text style={[styles.label, { color: theme.colors.secondary, fontSize: 13, fontWeight: "600" }]}>{label}</Text>
    </TouchableOpacity>
  );
};

type AmountPillProps = {
  amount: number;
  onPress: () => void;
};

export const AmountPill = ({ amount, onPress }: AmountPillProps) => {
  const { theme } = useTheme();
  const isEmpty = amount === 0;
  const label = isEmpty ? "?" : formatCurrency(amount);

  return (
    <TouchableOpacity
      style={[styles.pill, { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 10, paddingVertical: 6, borderRadius: theme.border.radius, marginRight: 8, marginBottom: 8 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.phase, { color: theme.colors.muted, fontSize: 9, fontWeight: "700", letterSpacing: 1, marginRight: 4 }]}>AMT</Text>
      <Text style={[styles.label, { color: theme.colors.secondary, fontSize: 13, fontWeight: "600" }, isEmpty && { color: theme.colors.muted }]}>{label}</Text>
    </TouchableOpacity>
  );
};

type TypePillProps = {
  transactionType: TransactionType | null;
  onPress: () => void;
};

export const TypePill = ({
  transactionType,
  onPress,
}: TypePillProps) => {
  const { theme } = useTheme();
  const isEmpty = !transactionType;
  const label = transactionType === "EXPENSE" ? "Expense" : transactionType === "INCOME" ? "Income" : "?";

  return (
    <TouchableOpacity
      style={[styles.pill, { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 10, paddingVertical: 6, borderRadius: theme.border.radius, marginRight: 8, marginBottom: 8 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.phase, { color: theme.colors.muted, fontSize: 9, fontWeight: "700", letterSpacing: 1, marginRight: 4 }]}>TYPE</Text>
      <Text style={[styles.label, { color: theme.colors.secondary, fontSize: 13, fontWeight: "600" }, isEmpty && { color: theme.colors.muted }]}>{label}</Text>
    </TouchableOpacity>
  );
};

type VendorPillProps = {
  vendor: Vendor | null;
  vendorName: string;
  onPress: () => void;
};

export const VendorPill = ({
  vendor,
  vendorName,
  onPress,
}: VendorPillProps) => {
  const { theme } = useTheme();
  const isEmpty = !vendor && !vendorName;
  const label = vendor?.name ?? vendorName;

  return (
    <TouchableOpacity
      style={[styles.pill, { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 10, paddingVertical: 6, borderRadius: theme.border.radius, marginRight: 8, marginBottom: 8 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.phase, { color: theme.colors.muted, fontSize: 9, fontWeight: "700", letterSpacing: 1, marginRight: 4 }]}>VENDOR</Text>
      <Text style={[styles.label, { color: theme.colors.secondary, fontSize: 13, fontWeight: "600" }, isEmpty && { color: theme.colors.muted }]}>{label || "—"}</Text>
    </TouchableOpacity>
  );
};

type CategoryPillProps = {
  category: Category | null;
  onPress: () => void;
};

export const CategoryPill = ({
  category,
  onPress,
}: CategoryPillProps) => {
  const { theme } = useTheme();
  const isEmpty = !category;

  return (
    <TouchableOpacity
      style={[styles.pill, { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 10, paddingVertical: 6, borderRadius: theme.border.radius, marginRight: 8, marginBottom: 8 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.phase, { color: theme.colors.muted, fontSize: 9, fontWeight: "700", letterSpacing: 1, marginRight: 4 }]}>CATEGORY</Text>
      <Text style={[styles.label, { color: theme.colors.secondary, fontSize: 13, fontWeight: "600" }, isEmpty && { color: theme.colors.muted }]}>{category?.name ?? "—"}</Text>
    </TouchableOpacity>
  );
};

type NotePillProps = {
  note: string;
  onPress: () => void;
};

export const NotePill = ({ note, onPress }: NotePillProps) => {
  const { theme } = useTheme();
  const isEmpty = !note;
  const truncated = note.length > 20 ? note.slice(0, 20) + "…" : note;

  return (
    <TouchableOpacity
      style={[styles.pill, { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 10, paddingVertical: 6, borderRadius: theme.border.radius, marginRight: 8, marginBottom: 8 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.phase, { color: theme.colors.muted, fontSize: 9, fontWeight: "700", letterSpacing: 1, marginRight: 4 }]}>NOTE</Text>
      <Text style={[styles.label, { color: theme.colors.secondary, fontSize: 13, fontWeight: "600" }, isEmpty && { color: theme.colors.muted }]}>{truncated || "—"}</Text>
    </TouchableOpacity>
  );
};

type DatePillProps = {
  date: Date;
  onPress: () => void;
};

export const DatePill = ({ date, onPress }: DatePillProps) => {
  const { theme } = useTheme();
  const formatted = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  }).toUpperCase();

  return (
    <TouchableOpacity
      style={[styles.pill, { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 10, paddingVertical: 6, borderRadius: theme.border.radius, marginRight: 8, marginBottom: 8 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.phase, { color: theme.colors.muted, fontSize: 9, fontWeight: "700", letterSpacing: 1, marginRight: 4 }]}>DATE</Text>
      <Text style={[styles.label, { color: theme.colors.secondary, fontSize: 13, fontWeight: "600" }]}>{formatted}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
  },
  phase: {},
  label: {},
  labelMuted: {},
});
