import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { TransactionType } from "@/src/domain/constants/transaction-type";
import { Category } from "@/src/domain/entities/category";
import { Vendor } from "@/src/domain/entities/vendor";
import { terminalTheme } from "../../theme/terminal";

const t = terminalTheme;

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
  return (
    <TouchableOpacity
      style={styles.pill}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.phase}>{phase.toUpperCase()}</Text>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

type AmountPillProps = {
  onPress: () => void;
};

export const AmountPill = ({ onPress }: AmountPillProps) => {
  return (
    <TouchableOpacity
      style={styles.pill}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.phase}>AMOUNT</Text>
      <Text style={styles.label}>0</Text>
    </TouchableOpacity>
  );
};

type TypePillProps = {
  transactionType: TransactionType;
  onPress: () => void;
};

export const TypePill = ({
  transactionType,
  onPress,
}: TypePillProps) => {
  const label = transactionType === "EXPENSE" ? "Expense" : "Income";

  return (
    <TouchableOpacity
      style={styles.pill}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.phase}>TYPE</Text>
      <Text style={styles.label}>{label}</Text>
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
  const label = vendor?.name ?? vendorName;

  return (
    <TouchableOpacity
      style={styles.pill}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.phase}>VENDOR</Text>
      <Text style={styles.label}>{label || "—"}</Text>
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
  return (
    <TouchableOpacity
      style={styles.pill}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.phase}>CATEGORY</Text>
      <Text style={styles.label}>{category?.name ?? "—"}</Text>
    </TouchableOpacity>
  );
};

type NotePillProps = {
  note: string;
  onPress: () => void;
};

export const NotePill = ({ note, onPress }: NotePillProps) => {
  const truncated = note.length > 20 ? note.slice(0, 20) + "…" : note;

  return (
    <TouchableOpacity
      style={styles.pill}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.phase}>NOTE</Text>
      <Text style={styles.label}>{truncated || "—"}</Text>
    </TouchableOpacity>
  );
};

type DatePillProps = {
  date: Date;
  onPress: () => void;
};

export const DatePill = ({ date, onPress }: DatePillProps) => {
  const formatted = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  }).toUpperCase();

  return (
    <TouchableOpacity
      style={styles.pill}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.phase}>DATE</Text>
      <Text style={styles.label}>{formatted}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    backgroundColor: t.colors.card,
    borderWidth: 1,
    borderColor: t.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  phase: {
    color: t.colors.muted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    marginRight: 4,
  },
  label: {
    color: t.colors.secondary,
    fontSize: 13,
    fontWeight: "600",
  },
});
