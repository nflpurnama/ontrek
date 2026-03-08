import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Category } from "@/src/domain/entities/category";
import { Vendor } from "@/src/domain/entities/vendor";
import { TransactionType } from "@/src/domain/constants/transaction-type";

type EditableField = "amount" | "vendor" | "description" | "type" | null;

type TransactionPreviewCardProps = {
  date: Date;
  amount: number;
  vendor: Vendor | null;
  vendorName: string;
  description: string;
  transactionType: TransactionType;
  category: Category | null;
  onAmountChange: (amount: number) => void;
  onVendorNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onTransactionTypeChange: (type: TransactionType) => void;
};

const formatAmount = (amount: number) => {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}k`;
  return amount.toFixed(2);
};

const formatDate = (date: Date) => {
  const today = new Date();
  const yesterday = new Date(Date.now() - 86400000);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const TransactionPreviewCard = ({
  date,
  amount,
  vendor,
  vendorName,
  description,
  transactionType,
  category,
  onAmountChange,
  onVendorNameChange,
  onDescriptionChange,
  onTransactionTypeChange,
}: TransactionPreviewCardProps) => {
  const [editingField, setEditingField] = useState<EditableField>(null);
  const [localAmount, setLocalAmount] = useState(amount.toString());

  const isExpense = transactionType === "EXPENSE";

  const handleAmountBlur = () => {
    const parsed = parseFloat(localAmount.replace(/k$/i, ""));
    const multiplier = localAmount.toLowerCase().endsWith("k") ? 1000 : 1;
    if (!isNaN(parsed)) onAmountChange(parsed * multiplier);
    setEditingField(null);
  };

  return (
    <View style={styles.card}>
      {/* Header Row — Date + Type toggle */}
      <View style={styles.headerRow}>
        <Text style={styles.date}>{formatDate(date)}</Text>
        <TouchableOpacity
          style={[
            styles.typeBadge,
            isExpense ? styles.expenseBadge : styles.incomeBadge,
          ]}
          onPress={() =>
            onTransactionTypeChange(isExpense ? "INCOME" : "EXPENSE")
          }
        >
          <Text style={styles.typeBadgeText}>
            {isExpense ? "EXPENSE" : "INCOME"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Amount */}
      <TouchableOpacity
        onPress={() => {
          setLocalAmount(amount.toString());
          setEditingField("amount");
        }}
        style={styles.amountRow}
      >
        {editingField === "amount" ? (
          <TextInput
            style={styles.amountInput}
            value={localAmount}
            onChangeText={setLocalAmount}
            onBlur={handleAmountBlur}
            keyboardType="numeric"
            autoFocus
            selectTextOnFocus
          />
        ) : (
          <Text style={[styles.amount, !isExpense && styles.incomeAmount]}>
            {isExpense ? "- " : "+ "}
            {formatAmount(amount)}
          </Text>
        )}
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Vendor */}
      <TouchableOpacity
        onPress={() => setEditingField("vendor")}
        style={styles.fieldRow}
      >
        <Text style={styles.fieldLabel}>FROM</Text>
        {editingField === "vendor" ? (
          <TextInput
            style={styles.fieldInput}
            value={vendorName}
            onChangeText={onVendorNameChange}
            onBlur={() => setEditingField(null)}
            autoFocus
            placeholder="vendor"
            placeholderTextColor="#555"
          />
        ) : (
          <Text style={[styles.fieldValue, !vendorName && styles.placeholder]}>
            {vendor?.name || vendorName || "tap to set vendor"}
          </Text>
        )}
      </TouchableOpacity>

      {/* Description */}
      <TouchableOpacity
        onPress={() => setEditingField("description")}
        style={styles.fieldRow}
      >
        <Text style={styles.fieldLabel}>NOTE</Text>
        {editingField === "description" ? (
          <TextInput
            style={styles.fieldInput}
            value={description}
            onChangeText={onDescriptionChange}
            onBlur={() => setEditingField(null)}
            autoFocus
            placeholder="description"
            placeholderTextColor="#555"
          />
        ) : (
          <Text
            style={[styles.fieldValue, !description && styles.placeholder]}
          >
            {description || "tap to add note"}
          </Text>
        )}
      </TouchableOpacity>

      {/* Category — only shows when selected */}
      {category && (
        <View style={styles.categoryRow}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>{category.name}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#222",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  date: {
    color: "#666",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  expenseBadge: {
    backgroundColor: "#2a1010",
    borderWidth: 1,
    borderColor: "#5a1a1a",
  },
  incomeBadge: {
    backgroundColor: "#0a2a10",
    borderWidth: 1,
    borderColor: "#1a5a1a",
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#aaa",
  },
  amountRow: {
    marginBottom: 16,
  },
  amount: {
    fontSize: 42,
    fontWeight: "800",
    color: "#ff4444",
    letterSpacing: -1,
  },
  incomeAmount: {
    color: "#44ff88",
  },
  amountInput: {
    fontSize: 42,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -1,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
    paddingBottom: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#222",
    marginBottom: 14,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  fieldLabel: {
    color: "#444",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    width: 40,
  },
  fieldValue: {
    color: "#ccc",
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  fieldInput: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
    paddingBottom: 2,
  },
  placeholder: {
    color: "#444",
    fontStyle: "italic",
  },
  categoryRow: {
    marginTop: 12,
    flexDirection: "row",
  },
  categoryPill: {
    backgroundColor: "#1a1a2e",
    borderWidth: 1,
    borderColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categoryPillText: {
    color: "#8888ff",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});