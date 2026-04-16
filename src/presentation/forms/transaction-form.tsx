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
  DatePill,
  AmountPill,
} from "../components/inputs/transaction-pill";
import { terminalTheme } from "../theme/terminal";

const t = terminalTheme;

type ContextType = "EDIT" | "CREATE";

type FormPhase = "type" | "amount" | "date" | "vendor" | "category" | "note";

const PHASE_ORDER: FormPhase[] = [
  "date",
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
  transactionDate: Date;
};

export type TransactionFormContext = {
  contextType: ContextType;
  vendorSuggestions: Vendor[];
  categoryOptions: Category[];
  handleSubmit: (formData: TransactionFormData) => void;
  handleVendorSearch: (vendorName: string) => void;
  handleDelete?: (formData: TransactionFormData) => void;
  initialData?: TransactionFormData;
};

export const TransactionForm = ({
  vendorSuggestions,
  categoryOptions,
  handleVendorSearch,
  handleSubmit,
  initialData,
}: TransactionFormContext) => {
  const [phase, setPhase] = useState<FormPhase>("date");
  const getInitialDateValue = () => {
    const d = String(new Date().getDate()).padStart(2, '0');
    const m = String(new Date().getMonth() + 1).padStart(2, '0');
    const y = new Date().getFullYear();
    return `${d}/${m}/${y}`;
  };
  const [inputValue, setInputValue] = useState<string>(getInitialDateValue());

  const [transactionType, setTransactionType] =
    useState<TransactionType | null>(initialData?.transactionType ?? null);
  const [amount, setAmount] = useState<number>(initialData?.amount ?? 0);
  const [spendingType] = useState<SpendingType>(initialData?.spendingType ?? "ESSENTIAL");
  const [category, setCategory] = useState<Category | null>(initialData?.category ?? null);
  const [vendor, setVendor] = useState<Vendor | null>(initialData?.vendor ?? null);
  const [vendorName, setVendorName] = useState<string>(initialData?.vendorName ?? "");
  const [description, setDescription] = useState<string>(initialData?.description ?? "");
  const [transactionDate, setTransactionDate] = useState<Date>(
    initialData?.transactionDate ?? new Date()
  );

  const inputRef = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [phase]);

  const navigateToPhase = useCallback((targetPhase: FormPhase) => {
    setPhase(targetPhase);
    switch (targetPhase) {
      case "type":
        setInputValue(transactionType === "EXPENSE" ? "e" : transactionType === "INCOME" ? "i" : "");
        break;
      case "amount":
        setInputValue(amount > 0 ? formatCurrency(amount) : "");
        break;
      case "date": {
        const d = String(transactionDate.getDate()).padStart(2, '0');
        const m = String(transactionDate.getMonth() + 1).padStart(2, '0');
        const y = transactionDate.getFullYear();
        setInputValue(`${d}/${m}/${y}`);
        break;
      }
      case "vendor":
        setInputValue(vendorName);
        break;
      case "category":
        setInputValue(category?.name ?? "");
        break;
      case "note":
        setInputValue(description);
        break;
    }
  }, [transactionType, amount, transactionDate, vendorName, category, description]);

  const handleTypeSubmit = useCallback((value: string) => {
    if (!transactionType) {
      return;
    }
    navigateToPhase("amount");
  }, [transactionType, navigateToPhase]);

  const handleAmountSubmit = useCallback((value: string) => {
    const parsed = parseCurrency(value);
    if (parsed > 0) {
      setAmount(parsed);
      navigateToPhase("vendor");
    }
  }, [navigateToPhase]);

  const handleAmountNext = useCallback(() => {
    if (amount > 0) {
      navigateToPhase("vendor");
    }
  }, [amount, navigateToPhase]);

  const handleDateSubmit = useCallback((value: string) => {
    if (!value.trim()) {
      setTransactionDate(new Date());
    } else {
      const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (match) {
        const [, day, month, year] = match;
        const parsed = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
        if (!isNaN(parsed.getTime())) {
          setTransactionDate(parsed);
        }
      }
    }
    navigateToPhase("type");
  }, [navigateToPhase]);

  const handleVendorSubmit = useCallback((value: string) => {
    if (!value.trim()) {
      setVendor(null);
      setVendorName("");
    } else {
      setVendorName(value.trim());
    }
    navigateToPhase("category");
  }, [navigateToPhase]);

  const handleCategorySubmit = useCallback((value: string) => {
    if (!value.trim()) {
      setCategory(null);
    } else {
      const matchedCategory = categoryOptions.find(
        (c) => c.name.toLowerCase() === value.trim().toLowerCase()
      );
      setCategory(matchedCategory ?? null);
    }
    navigateToPhase("note");
  }, [categoryOptions, navigateToPhase]);

  const handleNoteSubmit = useCallback((value: string) => {
    if (!transactionType) {
      setPhase("type");
      return;
    }
    if (!amount) {
      setPhase("amount");
      return;
    }
    const trimmedDescription = value.trim();
    setDescription(trimmedDescription);
    setInputValue("");
    Keyboard.dismiss();
    handleSubmit({
      amount,
      category,
      description: trimmedDescription,
      spendingType,
      transactionType,
      vendor,
      vendorName,
      transactionDate,
    });
  }, [transactionType, amount, category, vendor, vendorName, spendingType, transactionDate]);

  const handleSubmitPhase = useCallback(() => {
    switch (phase) {
      case "type":
        handleTypeSubmit(inputValue);
        break;
      case "amount":
        handleAmountSubmit(inputValue);
        break;
      case "date":
        handleDateSubmit(inputValue);
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
  }, [phase, inputValue, handleTypeSubmit, handleAmountSubmit, handleDateSubmit, handleVendorSubmit, handleCategorySubmit, handleNoteSubmit]);

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

      case "date":
        return (
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="date (dd/mm/yyyy)"
            placeholderTextColor={t.colors.muted}
            value={inputValue}
            onChangeText={setInputValue}
            onSubmitEditing={handleSubmitPhase}
            returnKeyType="next"
            keyboardType="numeric"
            autoCapitalize="none"
          />
        );

      case "vendor":
        return (
          <>
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
            <SuggestionList
              items={vendorSuggestions}
              onSelect={handleVendorSelect}
              renderItem={(v) => v.name}
              emptyMessage="No vendors found"
            />
          </>
        );

      case "category":
        return (
          <>
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
            <SuggestionList
              items={categoryOptions}
              onSelect={handleCategorySelect}
              renderItem={(c) => c.name}
              emptyMessage="No categories found"
              layout="vertical"
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

    pills.push(
      <DatePill
        key="date"
        date={transactionDate}
        onPress={() => navigateToPhase("date")}
      />
    );

    pills.push(
      <TypePill
        key="type"
        transactionType={transactionType}
        onPress={() => navigateToPhase("type")}
      />
    );

    pills.push(
      <AmountPill
        key="amount"
        amount={amount}
        onPress={() => navigateToPhase("amount")}
      />
    );

    pills.push(
      <VendorPill
        key="vendor"
        vendor={vendor}
        vendorName={vendorName}
        onPress={() => navigateToPhase("vendor")}
      />
    );

    pills.push(
      <CategoryPill
        key="category"
        category={category}
        onPress={() => navigateToPhase("category")}
      />
    );

    pills.push(
      <NotePill
        key="note"
        note={description}
        onPress={() => navigateToPhase("note")}
      />
    );

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
    letterSpacing: 1,
    marginRight: 4,
  },
  pillLabel: {
    color: t.colors.secondary,
    fontSize: 13,
  },
  pillLabelCompact: {
    color: t.colors.secondary,
    fontSize: 12,
  },
  pillLabelCompactMuted: {
    color: t.colors.muted,
    fontSize: 12,
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
    fontFamily: t.fonts.mono,
    color: t.colors.secondary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontFamily: t.fonts.mono,
    color: t.colors.primary,
    paddingVertical: 16,
  },
});
