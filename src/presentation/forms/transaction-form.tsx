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

type ContextType = "EDIT" | "CREATE";

type FormPhase = "type" | "amount" | "vendor" | "category" | "note" | "review";

const PHASE_ORDER: FormPhase[] = [
  "type",
  "amount",
  "vendor",
  "category",
  "note",
  "review",
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
    if (phase !== "review") {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [phase]);

  const navigateToPhase = useCallback((targetPhase: FormPhase) => {
    setPhase(targetPhase);
    setInputValue("");
  }, []);



  const handleTypeSubmit = useCallback((value: string) => {
    const lower = value.toLowerCase().trim();
    if (lower === "e") {
      setTransactionType("EXPENSE");
    } else if (lower === "i") {
      setTransactionType("INCOME");
    } else {
      setTransactionType(null);
      return;
    }
    setPhase("amount");
    setInputValue("");
  }, []);

  const handleAmountSubmit = useCallback((value: string) => {
    const parsed = parseCurrency(value);
    if (parsed > 0) {
      setAmount(parsed);
      setPhase("vendor");
      setInputValue("");
    }
  }, []);

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
    setDescription(value.trim());
    setPhase("review");
    setInputValue("");
    Keyboard.dismiss();
  }, []);

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

  const handleAutoSelect = useCallback(() => {
    if (phase === "vendor" && vendorSuggestions.length === 1) {
      const exactMatch =
        inputValue.toLowerCase() === vendorSuggestions[0].name.toLowerCase();
      if (exactMatch) {
        handleVendorSelect(vendorSuggestions[0]);
      }
    }
  }, [phase, vendorSuggestions, inputValue, handleVendorSelect]);

  useEffect(() => {
    handleAutoSelect();
  }, [vendorSuggestions, handleAutoSelect]);

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
        return (
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="e / i"
            placeholderTextColor="#999"
            value={inputValue}
            onChangeText={setInputValue}
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
              placeholder="0"
              placeholderTextColor="#999"
              value={inputValue}
              onChangeText={setInputValue}
              onSubmitEditing={handleSubmitPhase}
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
              placeholder="vendor (optional)"
              placeholderTextColor="#999"
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
              placeholder="category (optional)"
              placeholderTextColor="#999"
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
            placeholder="note (optional)"
            placeholderTextColor="#999"
            value={inputValue}
            onChangeText={setInputValue}
            onSubmitEditing={handleSubmitPhase}
            returnKeyType="done"
            multiline={false}
          />
        );

      case "review":
        return null;

      default:
        return null;
    }
  };

  const getPrompt = () => {
    switch (phase) {
      case "type":
        return "Expense or Income?";
      case "amount":
        return transactionType === "INCOME"
          ? "How much did you earn?"
          : "How much did you spend?";
      case "vendor":
        return transactionType === "INCOME"
          ? "Where did you earn?"
          : "Where did you spend?";
      case "category":
        return "Category?";
      case "note":
        return "Add a note?";
      case "review":
        return "Review your transaction";
      default:
        return "";
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <View style={styles.content}>
        {phase !== "type" && renderPills()}

        {phase !== "review" && (
          <View style={styles.inputSection}>
            <Text style={styles.prompt}>{getPrompt()}</Text>
            {renderInput()}
          </View>
        )}

        {phase === "review" && (
          <View style={styles.reviewSection}>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewType}>
                {transactionType === "EXPENSE" ? "Expense" : "Income"}
              </Text>
              <Text style={styles.reviewAmount}>
                {formatCurrency(amount)}
              </Text>
              {(vendor || vendorName) && (
                <Text style={styles.reviewVendor}>
                  {vendor?.name ?? vendorName}
                </Text>
              )}
              {category && (
                <Text style={styles.reviewCategory}>{category.name}</Text>
              )}
              {description && (
                <Text style={styles.reviewNote}>{description}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => handleSubmit(buildFormData())}
            >
              <Text style={styles.submitText}>Save Transaction</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigateToPhase("type")}
            >
              <Text style={styles.backText}>← Start Over</Text>
            </TouchableOpacity>

            {contextType === "EDIT" && handleDelete && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(buildFormData())}
              >
                <Text style={styles.submitText}>Delete Transaction</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
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
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  pillPhase: {
    color: "#666",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 2,
  },
  pillLabel: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  inputSection: {
    marginTop: "auto",
  },
  prompt: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: "#333",
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencyPrefix: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    paddingVertical: 16,
  },
  reviewSection: {
    flex: 1,
    justifyContent: "center",
  },
  reviewCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  reviewType: {
    fontSize: 14,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  reviewAmount: {
    fontSize: 36,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  reviewVendor: {
    fontSize: 18,
    color: "#333",
    marginBottom: 4,
  },
  reviewCategory: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  reviewNote: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  submitButton: {
    backgroundColor: "#111827",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#bc0000",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  backButton: {
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  backText: {
    color: "#666",
    fontSize: 14,
  },
});
