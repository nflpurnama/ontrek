import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState, useRef, useEffect, useCallback } from "react";
import { TransactionType } from "@/src/domain/constants/transaction-type";
import { SpendingType } from "@/src/domain/constants/spending-type";
import { Category } from "@/src/domain/entities/category";
import { Vendor } from "@/src/domain/entities/vendor";
import { formatCurrency, parseCurrency } from "@/src/presentation/utility/formatter/currency";
import { SuggestionList } from "../components/inputs/suggestion-list";
import {
  TypePill,
  VendorPill,
  CategoryPill,
  NotePill,
} from "../components/inputs/transaction-pill";
import { terminalTheme } from "../theme/terminal";

const t = terminalTheme;

type ContextType = "EDIT" | "CREATE";

type FormPhase = "type" | "amount" | "vendor" | "category" | "note";

const PHASE_ORDER: FormPhase[] = [
  "type",
  "amount",
  "vendor",
  "category",
  "note",
];

export type TransactionFormData = {
  amount: number;
  transactionType: TransactionType;
  spendingType: SpendingType;
  category: Category | null;
  vendor: Vendor | null;
  vendorName: string;
  description: string;
};

export type TransactionFormContext = {
  contextType: ContextType;
  vendorSuggestions: Vendor[];
  categoryOptions: Category[];
  handleSubmit: (formData: TransactionFormData) => void;
  handleVendorSearch: (vendorName: string) => void;
  handleDelete?: (formData: TransactionFormData) => void;
};

export const TransactionForm = ({
  contextType,
  vendorSuggestions,
  categoryOptions,
  handleVendorSearch,
  handleSubmit,
  handleDelete,
}: TransactionFormContext) => {
  const [phase, setPhase] = useState<FormPhase>("type");
  const [inputValue, setInputValue] = useState<string>("");

  const [transactionType, setTransactionType] =
    useState<TransactionType | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [spendingType] = useState<SpendingType>("ESSENTIAL");
  const [category, setCategory] = useState<Category | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [vendorName, setVendorName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const inputRef = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [phase]);

  const handleTypeSubmit = useCallback((value: string) => {
    if (!transactionType) {
      return;
    }
    setPhase("amount");
    setInputValue("");
  }, [transactionType]);

  const handleAmountSubmit = useCallback((value: string) => {
    const parsed = parseCurrency(value);
    if (parsed > 0) {
      setAmount(parsed);
      setPhase("vendor");
      setInputValue("");
    }
  }, []);

  const handleAmountNext = useCallback(() => {
    if (amount > 0) {
      setPhase("vendor");
    }
  }, [amount]);

  const handleVendorSubmit = useCallback((value: string) => {
    if (!value.trim()) {
      setVendor(null);
      setVendorName("");
    }
    setPhase("category");
    setInputValue("");
  }, []);

  const handleCategorySubmit = useCallback((value: string) => {
    if (!value.trim()) {
      setCategory(null);
    }
    setPhase("note");
    setInputValue("");
  }, []);

  const handleNoteSubmit = useCallback((value: string) => {
    if (!transactionType) {
      setPhase("type");
      return;
    }
    if (!amount) {
      setPhase("amount");
      return;
    }
    setDescription(value.trim());
    setInputValue("");
    Keyboard.dismiss();
    handleSubmit(buildFormData());
  }, [transactionType, amount]);

  const buildFormData = (): TransactionFormData => {
    if (!transactionType) throw new Error("Transaction Type cannot be empty");
    if (!amount) throw new Error("Amount cannot be empty");
    return {
      amount,
      category,
      description,
      spendingType,
      transactionType,
      vendor,
      vendorName,
    };
  };

  const handleSubmitPhase = useCallback(() => {
    switch (phase) {
      case "type":
        handleTypeSubmit(inputValue);
        break;
      case "amount":
        handleAmountSubmit(inputValue);
        break;
      case "vendor":
        handleVendorSubmit(inputValue);
        break;
      case "category":
        handleCategorySubmit(inputValue);
        break;
      case "note":
        handleNoteSubmit(inputValue);
        break;
    }
  }, [phase, inputValue, handleTypeSubmit, handleAmountSubmit, handleVendorSubmit, handleCategorySubmit, handleNoteSubmit]);

  const handleVendorChange = useCallback(
    (value: string) => {
      setInputValue(value);
      setVendorName(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        handleVendorSearch(value);
      }, 300);
    },
    [handleVendorSearch]
  );

  const handleVendorSelect = useCallback(
    (selectedVendor: Vendor) => {
      setVendor(selectedVendor);
      setVendorName(selectedVendor.name);
      setInputValue("");
      setPhase("category");
    },
    []
  );

  const handleCategorySelect = useCallback((selectedCategory: Category) => {
    setCategory(selectedCategory);
    setPhase("note");
  }, []);

  const navigateToPhase = useCallback((targetPhase: FormPhase) => {
    setPhase(targetPhase);
  }, []);

  const renderPills = () => {
    const pills: React.ReactNode[] = [];

    if (transactionType) {
      pills.push(
        <TypePill
          key="type"
          transactionType={transactionType}
          onPress={() => navigateToPhase("type")}
        />
      );
    }

    if (amount > 0) {
      pills.push(
        <TouchableOpacity
          key="amount"
          style={styles.pill}
          onPress={() => navigateToPhase("amount")}
          activeOpacity={0.7}
        >
          <Text style={styles.pillPhase}>AMOUNT</Text>
          <Text style={styles.pillLabel}>
            {formatCurrency(amount)}
          </Text>
        </TouchableOpacity>
      );
    }

    if (vendor || vendorName) {
      pills.push(
        <VendorPill
          key="vendor"
          vendor={vendor}
          vendorName={vendorName}
          onPress={() => navigateToPhase("vendor")}
        />
      );
    }

    if (category) {
      pills.push(
        <CategoryPill
          key="category"
          category={category}
          onPress={() => navigateToPhase("category")}
        />
      );
    }

    if (description) {
      pills.push(
        <NotePill
          key="note"
          note={description}
          onPress={() => navigateToPhase("note")}
        />
      );
    }

    return pills;
  };

  const renderInput = () => {
    switch (phase) {
      case "type":
        const lower = inputValue.toLowerCase();
        const typeDisplay =
          lower === "e" || lower === "expense"
            ? "expense"
            : lower === "i" || lower === "income"
            ? "income"
            : inputValue;

        return (
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="expense or income? (e / i)"
            placeholderTextColor={t.colors.muted}
            value={typeDisplay}
            onChangeText={(text) => {
              const t = text.toLowerCase();
              if (t === "e" || t === "expense") {
                setInputValue("e");
                setTransactionType("EXPENSE");
              } else if (t === "i" || t === "income") {
                setInputValue("i");
                setTransactionType("INCOME");
              } else {
                setInputValue("");
                setTransactionType(null);
              }
            }}
            onSubmitEditing={handleSubmitPhase}
            returnKeyType="next"
            autoCapitalize="none"
            autoCorrect={false}
          />
        );

      case "amount":
        return (
          <View style={styles.amountRow}>
            <Text style={styles.currencyPrefix}>Rp</Text>
            <TextInput
              ref={inputRef}
              style={styles.amountInput}
              placeholder={
                transactionType === "INCOME"
                  ? "how much did you earn?"
                  : "how much did you spend?"
              }
              placeholderTextColor={t.colors.muted}
              value={amount > 0 ? formatCurrency(amount) : ""}
              onChangeText={(text) => {
                const raw = parseCurrency(text);
                setAmount(raw);
              }}
              onSubmitEditing={handleAmountNext}
              returnKeyType="next"
              keyboardType="numeric"
              autoCorrect={false}
            />
          </View>
        );

      case "vendor":
        return (
          <>
            <SuggestionList
              items={vendorSuggestions}
              onSelect={handleVendorSelect}
              renderItem={(v) => v.name}
              emptyMessage="No vendors found"
            />
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder={
                transactionType === "INCOME"
                  ? "where did you earn?"
                  : "where did you spend?"
              }
              placeholderTextColor={t.colors.muted}
              value={inputValue}
              onChangeText={handleVendorChange}
              onSubmitEditing={handleSubmitPhase}
              returnKeyType="next"
              autoCapitalize="words"
            />
          </>
        );

      case "category":
        return (
          <>
            <SuggestionList
              items={categoryOptions}
              onSelect={handleCategorySelect}
              renderItem={(c) => c.name}
              emptyMessage="No categories found"
            />
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="category (tap or type to select)"
              placeholderTextColor={t.colors.muted}
              value={inputValue}
              onChangeText={setInputValue}
              onSubmitEditing={handleSubmitPhase}
              returnKeyType="next"
              autoCapitalize="none"
            />
          </>
        );

      case "note":
        return (
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="add a note (optional)"
            placeholderTextColor={t.colors.muted}
            value={inputValue}
            onChangeText={setInputValue}
            onSubmitEditing={handleSubmitPhase}
            returnKeyType="done"
            multiline={false}
          />
        );

      default:
        return null;
    }
  };

  const renderPillsRow = () => {
    const pills: React.ReactNode[] = [];

    if (transactionType) {
      pills.push(
        <TypePill
          key="type"
          transactionType={transactionType}
          onPress={() => navigateToPhase("type")}
        />
      );
    }

    if (amount > 0) {
      pills.push(
        <TouchableOpacity
          key="amount"
          style={styles.pillCompact}
          onPress={() => navigateToPhase("amount")}
          activeOpacity={0.7}
        >
          <Text style={styles.pillPhase}>AMT</Text>
          <Text style={styles.pillLabelCompact}>
            {formatCurrency(amount)}
          </Text>
        </TouchableOpacity>
      );
    }

    if (vendor || vendorName) {
      pills.push(
        <VendorPill
          key="vendor"
          vendor={vendor}
          vendorName={vendorName}
          onPress={() => navigateToPhase("vendor")}
        />
      );
    }

    if (category) {
      pills.push(
        <CategoryPill
          key="category"
          category={category}
          onPress={() => navigateToPhase("category")}
        />
      );
    }

    if (description) {
      pills.push(
        <NotePill
          key="note"
          note={description}
          onPress={() => navigateToPhase("note")}
        />
      );
    }

    if (pills.length === 0) {
      return null;
    }

    return <View style={styles.pillsRow}>{pills}</View>;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <View style={styles.content}>
        <View style={styles.inputSection}>
          {renderPillsRow()}
          {renderInput()}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "flex-end",
  },
  pill: {
    backgroundColor: t.colors.card,
    borderWidth: 1,
    borderColor: t.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  pillCompact: {
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
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  pillPhase: {
    color: t.colors.muted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    marginRight: 4,
  },
  pillLabel: {
    color: t.colors.secondary,
    fontSize: 13,
    fontWeight: "600",
  },
  pillLabelCompact: {
    color: t.colors.secondary,
    fontSize: 12,
    fontWeight: "600",
  },
  inputSection: {
    marginTop: "auto",
  },
  input: {
    backgroundColor: t.colors.card,
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontFamily: t.fonts.mono,
    color: t.colors.primary,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: t.colors.card,
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencyPrefix: {
    fontSize: 24,
    fontWeight: "600",
    fontFamily: t.fonts.mono,
    color: t.colors.secondary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "600",
    fontFamily: t.fonts.mono,
    color: t.colors.primary,
    paddingVertical: 16,
  },
});
